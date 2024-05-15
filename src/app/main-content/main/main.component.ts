import { DialogCreateChannelComponent } from './../../dialog-create-channel/dialog-create-channel.component';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { WorkspaceComponent } from '../../workspace/workspace/workspace.component';
import { ChannelchatComponent } from '../../chats/channelchat/channelchat.component';
import { DialogProfileComponent } from '../../dialog-profile/dialog-profile.component';
import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { DialogChannelInfoComponent } from '../../dialog-channel-info/dialog-channel-info.component';
import { DialogMembersComponent } from '../../dialog-members/dialog-members.component';
import { ChannelthreadComponent } from '../../threads/channelthread/channelthread.component';
import { HeaderComponent } from '../../header/header.component';
import { ChannelService } from '../../services/channel.service';
import { OwnchatComponent } from '../../chats/ownchat/ownchat.component';
import { EmptychatComponent } from '../../chats/emptychat/emptychat.component';
import { FirestoreService } from '../../firestore.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    MatMenuModule,
    MatButtonModule,
    RouterOutlet,
    CommonModule,
    WorkspaceComponent,
    ChannelchatComponent,
    ChannelthreadComponent,
    EmptychatComponent,
    OwnchatComponent,
    HeaderComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  animations: [
    trigger('displayWorkspaceTrigger', [
      state(
        'true',
        style({
          width: '30%',
          opacity: 1,
        })
      ),
      state(
        'false',
        style({
          width: '0%',
          opacity: 0,
        })
      ),
      transition('false <=> true', animate('1s linear')),
    ]),
    trigger('isThreadOpenTrigger', [
      state(
        'true',
        style({
          width: '40%',
          opacity: 1,
        })
      ),
      state(
        'false',
        style({
          width: '0%',
          opacity: 0,
        })
      ),
      transition('false <=> true', animate('1s linear')),
    ]),
  ],
})
export class MainComponent implements OnInit {
  constructor(
    private channelService: ChannelService,
    public firestoreService: FirestoreService
  ) {}
  displayWorkspace: boolean = true;
  showEmptyChat: boolean = false;
  showOwnChat: boolean = true;
  userDetails: any = '';
  selectedMessageId: string = '';

  showHideWorkspace() {
    this.displayWorkspace = !this.displayWorkspace;
  }

  get showChannelChat(): boolean {
    return this.channelService.showChannelChat;
  }

  get showThreadWindow(): boolean {
    return this.channelService.showThreadWindow;
  }

  openEmptyChat() {
    this.showEmptyChat = !this.showEmptyChat;
    this.showOwnChat = false;
  }

  openChat(userDetails: any) {
    this.showEmptyChat = false;
    this.showOwnChat = true;
    this.userDetails = userDetails;
  }

  ngOnInit(): void {}
}
