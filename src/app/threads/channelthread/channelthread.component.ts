import { Component } from '@angular/core';
import { ChannelService } from '../../services/channel.service';

@Component({
  selector: 'app-channelthread',
  standalone: true,
  imports: [],
  templateUrl: './channelthread.component.html',
  styleUrls: ['./channelthread.component.scss', '../threads.component.scss'],
})
export class ChannelthreadComponent {
  constructor(public channelService: ChannelService) {
    
  }

  closeThreadWindow(){
    this.channelService.showThreadWindow = false;
  }
}
