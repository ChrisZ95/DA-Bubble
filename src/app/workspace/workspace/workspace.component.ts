import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent implements OnInit {
  displayUsers: boolean = true;
  channel = new Channel();
  allChannels: any = [];
  allUsers: any[] = [];
  selectedChannelName: string | null = null;

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

  openChannelChat(id: string) {
    this.channelService.showChannelChat = true;
  }
  // Adrian
  openChat(user: any) {
    this.channelService.showChannelChat = true;
    this.userDetails.emit(user);
  }

  ngOnInit(): void {
    this.firestoreService
      .getAllUsers()
      .then((users) => {
        this.allUsers = users;
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }
}
