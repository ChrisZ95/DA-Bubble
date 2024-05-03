import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog'; 
import { DialogAddPeopleToNewChannelComponent } from '../dialog-add-people-to-new-channel/dialog-add-people-to-new-channel.component';
import { Firestore, addDoc, collection, updateDoc, doc } from '@angular/fire/firestore';
import { Channel } from './../../models/channel.class';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../services/channel.service';


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

  constructor(private dialogRef: MatDialogRef<DialogCreateChannelComponent>, public dialog: MatDialog, private firestoreService: ChannelService) {}

  closeCreateChannelDialog(): void {
    this.dialogRef.close();
  }

  createChannel() {
    const newChannelData: Channel = new Channel({
      channelName: this.channelName,
      channelDescription: this.channelDescription
    });

    this.firestoreService.addChannel(newChannelData)
      .then(() => {
        console.log('Channel successfully created!');
        this.dialogRef.close();
      })
      .catch((error) => {
        console.error('Error creating channel: ', error);
      });
  }

  openAddPeopleToNewChannelDialog() {
    this.createChannel();
    this.dialog.open(DialogAddPeopleToNewChannelComponent);
  }
}
