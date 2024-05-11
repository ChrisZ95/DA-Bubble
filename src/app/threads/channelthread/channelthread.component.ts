import { Component } from '@angular/core';
import { ChannelService } from '../../services/channel.service';
import { ChatService } from '../../services/chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-channelthread',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './channelthread.component.html',
  styleUrls: ['./channelthread.component.scss', '../threads.component.scss'],
})
export class ChannelthreadComponent {
  channelId: string = '';
  messageId: string = '';
  comments: string[] = [];
  currentChannelId: string = '';
  currentMessageId: string = '';
  currentMessageComments: string[] = []; 
  messages: any[] = [];

  constructor(public channelService: ChannelService, public chatService: ChatService) {
    
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
    const currentMessage = this.channelService.messages.find(message => message.id === this.currentMessageId);
    if (currentMessage) {
      this.currentMessageComments = currentMessage.comments;
    } else {
      this.currentMessageComments = [];
    }
  }
}