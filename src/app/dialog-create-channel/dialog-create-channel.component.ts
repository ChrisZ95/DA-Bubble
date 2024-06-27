import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogAddPeopleToNewChannelComponent } from '../dialog-add-people-to-new-channel/dialog-add-people-to-new-channel.component';
import { Firestore, addDoc, collection, updateDoc, doc, where, query, getDocs } from '@angular/fire/firestore';
import { Channel } from './../../models/channel.class';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../services/channel.service';
import { ChatService } from '../services/chat.service';
import { FirestoreService } from '../firestore.service';


@Component({
  selector: 'app-dialog-create-channel',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './dialog-create-channel.component.html',
  styleUrl: './dialog-create-channel.component.scss'
})
export class DialogCreateChannelComponent {
  channelName: string = '';
  channelDescription: string = '';
  channelAuthor: string = '';
  channel = new Channel();
  errorMessage: string | null = null;

  constructor(private dialogRef: MatDialogRef<DialogCreateChannelComponent>, public dialog: MatDialog, private channelService: ChannelService, private readonly firestore: Firestore, public chatService: ChatService, public firestoreService: FirestoreService) {}

  closeCreateChannelDialog(): void {
    this.dialogRef.close();
  }

  openAddPeopleToNewChannelDialog(newChannelId: string) {
    this.dialog.open(DialogAddPeopleToNewChannelComponent, {
      data: {
        channelId: newChannelId
      }
    });
    this.channelService.setCurrentChannelId(newChannelId);
  }

  async createChannel(): Promise<void> {
    try {
      const authorUid = this.firestoreService.currentuid;
      if (!authorUid) {
        console.error('Benutzer nicht angemeldet.'); //??
        return;
      }

      const channelExists = await this.checkIfChannelExists(this.channelName);
      if (channelExists) {
        this.errorMessage = 'Ein Kanal mit diesem Namen existiert bereits!';
        return;
      }

      const newChannelId = await this.addChannel(authorUid);
      this.dialogRef.close();
      this.openAddPeopleToNewChannelDialog(newChannelId);
    } catch (error) {
      throw error;
    }
  }

  async checkIfChannelExists(channelName: string): Promise<boolean> {
    const channelsRef = collection(this.firestore, 'channels');
    const q = query(channelsRef, where('channelName', '==', channelName));
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  }

  async addChannel(authorUid: string): Promise<string> {
    const channelData = {
      channelName: this.channelName,
      description: this.channelDescription,
      author: authorUid,
      users: [authorUid]
    };
    return await this.channelService.addChannel(channelData);
  }

}
