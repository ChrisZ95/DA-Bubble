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
import { ThreadComponent } from '../../threads/thread/thread.component';
import { ChannelthreadComponent } from '../../threads/channelthread/channelthread.component';
import { HeaderComponent } from '../../header/header.component';
import { ChannelService } from '../../services/channel.service';
import { OwnchatComponent } from '../../chats/ownchat/ownchat.component';
import { EmptychatComponent } from '../../chats/emptychat/emptychat.component';
import { FirestoreService } from '../../firestore.service';
import { ChatService } from '../../services/chat.service';
import { ThreadService } from '../../services/thread.service';
import { Subscription } from 'rxjs';

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
    ThreadComponent,
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
    public firestoreService: FirestoreService,
    public chatService: ChatService,
    public threadService: ThreadService
  ) {}
  displayWorkspace: boolean = true;
  displayThread: boolean = false;
  userDetails: any = '';
  selectedMessageId: string = '';
  emojiPicker = false;

  closeEmojiPicker() {
    this.chatService.emojiPicker(false);
  }

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
    this.chatService.showEmptyChat = !this.chatService.showEmptyChat;
    this.chatService.showOwnChat = false;
  }

  openChat(userDetails: any) {
    this.chatService.showEmptyChat = false;
    this.chatService.showOwnChat = true;
    this.userDetails = userDetails;
  }

  handleIdle() {
    let key = this.firestoreService.currentuid;
    let status = 'away';
    this.firestoreService.updateActiveStatus(key, status);
  }
  handleActive() {
    let key = this.firestoreService.currentuid;
    let status = 'active';
    this.firestoreService.updateActiveStatus(key, status);
  }

  isIdle: number = 0;
  idleSubscription!: Subscription;
  activityAfterIdleSubscription!: Subscription;
  mouseMoveSubscription!: Subscription;
  noMouseMove!: Subscription;
  keyPressSubscription!: Subscription;
  noKeyPress!: Subscription;
  emojiPickerSubscription: Subscription | null = null;
  ngOnInit(): void {
    this.idleSubscription = this.firestoreService
      .isUserIdle()
      .subscribe((idle) => {});
    this.noMouseMove = this.firestoreService
      .noMouseMoveAfterIdle()
      .subscribe(() => {
        this.handleIdle();
      });
    this.mouseMoveSubscription = this.firestoreService
      .onMouseMoveAfterIdle()
      .subscribe(() => {
        this.handleActive();
      });

    this.noKeyPress = this.firestoreService
      .noKeyPressAfterIdle()
      .subscribe(() => {
        this.handleIdle();
      });
    this.keyPressSubscription = this.firestoreService
      .onKeyPressAfterIdle()
      .subscribe(() => {
        this.handleActive();
      });
      this.emojiPickerSubscription = this.chatService.emojiPicker$
      .subscribe((state: boolean) => {
        this.emojiPicker = state;
      });
  }
  ngOnDestroy(): void {
    this.idleSubscription.unsubscribe();
    if (this.emojiPickerSubscription) {
      this.emojiPickerSubscription.unsubscribe();
    }
    // this.activityAfterIdleSubscription.unsubscribe();
  }
}
