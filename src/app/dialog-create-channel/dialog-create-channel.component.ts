import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog'; 
import { DialogAddPeopleToNewChannelComponent } from '../dialog-add-people-to-new-channel/dialog-add-people-to-new-channel.component';
import { Firestore, addDoc, collection, updateDoc, doc } from '@angular/fire/firestore';
import { Channel } from './../../models/channel.class';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-dialog-create-channel',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './dialog-create-channel.component.html',
  styleUrl: './dialog-create-channel.component.scss'
})
export class DialogCreateChannelComponent {
  channel = new Channel();
  newChannelName: string = '';
  newChannelDescription: string = '';

  constructor(private dialogRef: MatDialogRef<DialogCreateChannelComponent>, public dialog: MatDialog, private readonly firestore: Firestore) {}

  closeCreateChannelDialog(): void {
    this.dialogRef.close();
  }

  saveChannel() {
    if (this.newChannelName.trim() !== '') {
      const newChannelData: Channel = {
        channelName: this.newChannelName,
        channelDescription: this.newChannelDescription,
      };
      addDoc(collection(this.firestore, 'channels'), newChannelData)
        .then(() => {
          console.log('Channel successfully created!');
          this.dialogRef.close();
        })
        .catch((error) => {
          console.error('Error creating channel: ', error);
        });
    } else {
      console.error('Channel name is required!');
    }
  }

  openAddPeopleToNewChannelDialog() {
    this.saveChannel();
    this.dialog.open(DialogAddPeopleToNewChannelComponent);
  }
}
