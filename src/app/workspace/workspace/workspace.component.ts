import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogCreateChannelComponent } from '../../dialog-create-channel/dialog-create-channel.component';
import { MatDialog } from '@angular/material/dialog';
import {
  Firestore,
  onSnapshot,
  collection,
  doc,
  getDoc,
} from '@angular/fire/firestore';
import { Channel } from './../../../models/channel.class';
import { FirestoreService } from '../../firestore.service';
import { ChannelService } from '../../services/channel.service';
import { ChatService } from '../../services/chat.service';
import { ChannelchatComponent } from '../../chats/channelchat/channelchat.component';
import { log } from 'console';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent implements OnInit {
  @ViewChild(ChannelchatComponent) channelchatComponent!: ChannelchatComponent;

  displayUsers: boolean = true;
  channel = new Channel();
  allChannels: any = [];
  filteredChannels: any[] = [];
  allUsers: any[] = [];
  selectedChannelName: string | null = null;
  currentChannelId: string = '';

  constructor(
    public dialog: MatDialog,
    private readonly firestore: Firestore,
    private firestoreService: FirestoreService,
    public channelService: ChannelService,
    public chatService: ChatService
  ) {
    onSnapshot(collection(this.firestore, 'channels'), (list) => {
      this.allChannels = list.docs.map((doc) => doc.data());
      this.filterChannels();
    });
  }

  @Output() userDetails = new EventEmitter<string>();
  @Output() disyplayEmptyChat = new EventEmitter<boolean>();

  openCreateChannelDialog() {
    this.dialog.open(DialogCreateChannelComponent);
  }

  dropDownMessages() {
    this.displayUsers = !this.displayUsers;
  }

  openChannelChat(channelId: string) {
    this.channelService.setCurrentChannelId(channelId);
    this.channelService.showChannelChat = true;
    this.chatService.showOwnChat = false;
    this.channelService.showThreadWindow = false;
  }

  openEmptyChat() {
    this.disyplayEmptyChat.emit(true);
  }
  openChat(user: any) {
    this.userDetails.emit(user);
  }

  ngOnInit(): void {
    this.firestoreService
      .getAllUsers()
      .then((users) => {
        this.allUsers = users;
        console.log('allUsers', this.allUsers);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
    this.channelService.getChannels().then((channels) => {
      this.allChannels = channels;
      this.filterChannels();
    });
    console.log('Aktueller User ist:', this.firestoreService.currentuid);
  }

  filterChannels() {
    const currentUserId = this.firestoreService.currentuid;
    this.filteredChannels = this.allChannels.filter(
      (channel: Channel) =>
        channel.users && channel.users.includes(currentUserId)
    );
  }
}
