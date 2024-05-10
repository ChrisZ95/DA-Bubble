import { Component } from '@angular/core';
import { ChannelService } from '../../services/channel.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-channelthread',
  standalone: true,
  imports: [],
  templateUrl: './channelthread.component.html',
  styleUrls: ['./channelthread.component.scss', '../threads.component.scss'],
})
export class ChannelthreadComponent {
  channelId: string = '';
  messageId: string = '';
  comments: string[] = [];
  currentChannelId: string = '';
  currentMessageId: string = '';

  constructor(public channelService: ChannelService, public chatService: ChatService) {
    
  }

  closeThreadWindow(){
    this.channelService.showThreadWindow = false;
  }

  ngOnInit(): void {
    this.currentChannelId = this.channelService.getCurrentChannelId();
    this.currentMessageId = this.channelService.getCurrentMessageId();
    this.loadComments();
  }

  async loadComments() {
    this.comments = await this.chatService.getCommentsForMessage(this.currentChannelId, this.currentMessageId);
  }
}
