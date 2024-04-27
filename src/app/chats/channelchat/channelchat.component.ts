import { Component } from '@angular/core';

@Component({
  selector: 'app-channelchat',
  standalone: true,
  imports: [],
  templateUrl: './channelchat.component.html',
  styleUrls: ['./channelchat.component.scss', '../chats.component.scss'],
})
export class ChannelchatComponent {
  openChannelInfoDialog() {}
  openMemberDialog() {}
}
