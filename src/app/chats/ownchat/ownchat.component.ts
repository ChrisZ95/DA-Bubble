import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { collection, getDocs } from 'firebase/firestore';
import { ChatService } from '../../services/chat.service';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { TextEditorComponent } from '../../shared/text-editor/text-editor.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPeopleComponent } from '../../dialog-add-people/dialog-add-people.component';
import { DialogChannelInfoComponent } from '../../dialog-channel-info/dialog-channel-info.component';
import { DialogContactInfoComponent } from '../../dialog-contact-info/dialog-contact-info.component';
import { DialogMembersComponent } from '../../dialog-members/dialog-members.component';
import { FirestoreService } from '../../firestore.service';
import { ChannelService } from '../../services/channel.service';
import { ThreadService } from '../../services/thread.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ownchat',
  standalone: true,
  imports: [TextEditorComponent, TimestampPipe, CommonModule, TimestampPipe],
  templateUrl: './ownchat.component.html',
  styleUrls: ['./ownchat.component.scss', '../chats.component.scss'],
})
export class OwnchatComponent implements OnChanges, OnInit, OnDestroy {
  constructor(
    public dialog: MatDialog,
    public chatService: ChatService,
    public threadService: ThreadService,
    private firestore: FirestoreService
  ) {}
  @Input() userDetails: any;
  messages: any = [];
  allUsers: any = [];
  participants: any;
  filteredUsers: any;
  private messagesSubscription: Subscription | undefined;
  private filteredUsersSubscription: Subscription | undefined;
  openMemberDialog() {
    this.dialog.open(DialogMembersComponent);
  }

  openChannelInfoDialog() {
    this.dialog.open(DialogChannelInfoComponent);
  }

  openContactInfoDialog(userDetails: any) {
    console.log(userDetails)
    this.dialog.open(DialogContactInfoComponent, {
      data: userDetails
    });
  }

  openThread(messageInformation: any) {
    let chatDocId = this.chatService.chatDocId;
    this.threadService.displayThread = true;
    this.threadService.getMessage(messageInformation, chatDocId);
  }

  async loadCurrentUser() {
    let allUsers = await this.firestore.getAllUsers();
    let currentUserDetails = allUsers.filter(
      (user) => user.uid == this.firestore.currentuid
    );
    this.chatService.loadMessages(currentUserDetails);
  }

  displayName(id: any) {
    let user = this.allUsers.filter((user: any) => {
      if (id == user.uid) {
        return user;
      }
    });
    return user[0]?.username;
  }

  async loadAllUsers() {
    this.allUsers = await this.chatService.loadUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.userDetails != '' && changes['userDetails']) {
      this.chatService.loadMessages(this.userDetails);
      this.messages = this.chatService.messages;
    }
  }

  ngOnInit(): void {
    this.loadCurrentUser();

    this.messagesSubscription = this.chatService.messages$.subscribe(
      (messages) => {
        this.messages = messages;
      }
    );

    const userDetails = { uid: 'someUserId' };
    this.loadAllUsers();

    this.filteredUsersSubscription = this.chatService.filteredUsers$.subscribe(
      (users) => {
        this.filteredUsers = users;
        console.log(this.filteredUsers)
      }
    );
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }

    if (this.filteredUsersSubscription) {
      this.filteredUsersSubscription.unsubscribe();
    }
  }
}
