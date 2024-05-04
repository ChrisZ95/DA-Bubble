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

  constructor(private dialogRef: MatDialogRef<DialogCreateChannelComponent>, public dialog: MatDialog, private channelService: ChannelService) {}

  closeCreateChannelDialog(): void {
    this.dialogRef.close();
  }

  openAddPeopleToNewChannelDialog() {
    this.createChannel();
    this.dialog.open(DialogAddPeopleToNewChannelComponent);
  }

  createChannel(): void {
    const channelName = this.channelName;
    const channelDescription = this.channelDescription;
    this.channelService.setChannelData(channelName, channelDescription);
  }
}