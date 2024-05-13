import { Component, Input } from '@angular/core';
import { ChannelService } from '../../services/channel.service';
import { ChatService } from '../../services/chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GenerateIdsService } from '../../services/generate-ids.service';
import { Firestore } from '@angular/fire/firestore';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';

@Component({
  selector: 'app-channelthread',
  standalone: true,
  imports: [ FormsModule, CommonModule, TimestampPipe ],
  templateUrl: './channelthread.component.html',
  styleUrls: ['./channelthread.component.scss', '../threads.component.scss'],
})
export class ChannelthreadComponent {
  channelId: string = '';
  messageId: string = '';
  comments: string[] = [];
  currentChannelId: string = '';
  currentMessageId: string = '';
  currentMessageComments: { id: string, comment: string, createdAt: string }[] = []; 
  messages: any[] = [];

  constructor(private chatService: ChatService,
    private generateId: GenerateIdsService,
    private firestore: Firestore,
    public channelService: ChannelService) {
    
  }

  closeThreadWindow(){
    this.channelService.showThreadWindow = false;
  }

  ngOnInit(): void {
    this.currentChannelId = this.channelService.getCurrentChannelId();
    this.currentMessageId = this.channelService.getCurrentMessageId();
    this.messages = this.channelService.messages;
    this.loadCommentsForCurrentMessage();
    console.log('Messages123', this.channelService.messages);
  }

  loadCommentsForCurrentMessage() {
    const currentMessage = this.channelService.messages.find(message => message.messageId === this.currentMessageId);
    if (currentMessage) {
      this.currentMessageComments = currentMessage.comments;
    } else {
      this.currentMessageComments = [];
    }
  }

  comment: any = '';

  sendCommentToMessage() {
    const currentMessageId = this.channelService.getCurrentMessageId();
    if (currentMessageId) {
      const timestamp: number = Date.now();
      const timestampString: string = timestamp.toString();
      const comment = {
        id: this.generateId.generateId(),
        comment: this.comment,
        createdAt: timestampString,
      };
      this.chatService.sendCommentToChannel(currentMessageId, comment);

      this.comment = '';
    } else {
      console.error('Kein aktueller Kanal ausgewählt.');
      // Fehlerfall, falls kein aktueller Kanal ausgewählt ist
    }
  }
}