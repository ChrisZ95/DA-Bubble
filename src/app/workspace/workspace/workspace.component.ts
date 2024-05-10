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
  styleUrls: ['./workspace.component.scss', '../../../styles.scss'],
})
export class WorkspaceComponent implements OnInit {
  @ViewChild(ChannelchatComponent) channelchatComponent!: ChannelchatComponent;

  displayUsers: boolean = true;
  channel = new Channel();
  allChannels: any = [];
  allUsers: any[] = [];
  selectedChannelName: string | null = null;
  currentChannelId: string = '';

  constructor(
    public dialog: MatDialog,
    private readonly firestore: Firestore,
    private firestoreService: FirestoreService,
    public channelService: ChannelService,
    private chat: ChatService
  ) {
    onSnapshot(collection(this.firestore, 'channels'), (list) => {
      this.allChannels = list.docs.map((doc) => doc.data());
    });
  }

  @Output() userDetails = new EventEmitter<string>();

  openCreateChannelDialog() {
    this.dialog.open(DialogCreateChannelComponent);
  }

  dropDownMessages() {
    this.displayUsers = !this.displayUsers;
  }

  openChannelChat(channelId: string) {
    this.channelService.setCurrentChannelId(channelId);
    this.channelService.showChannelChat = true;
    this.channelService
      .loadMessagesForChannel(channelId)
      .then((messages) => {
        // Nachrichten wurden erfolgreich geladen, aktualisieren Sie den ChannelchatComponent
        // Beispiel: this.channelchatComponent.messages = messages;
      })
      .catch((error) => {
        console.error('Error loading messages for channel:', error);
      });
  }
  // Adrian
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
      console.log('Channels', channels);
    });
  }
}
