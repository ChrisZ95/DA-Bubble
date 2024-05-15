import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Inject } from '@angular/core';
import { Firestore, collection, getDocs, doc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { FirestoreService } from '../firestore.service';
import { Channel } from './../../models/channel.class';
import { ChannelService } from '../services/channel.service';

@Component({
  selector: 'app-dialog-add-people-to-new-channel',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './dialog-add-people-to-new-channel.component.html',
  styleUrl: './dialog-add-people-to-new-channel.component.scss'
})
export class DialogAddPeopleToNewChannelComponent implements OnInit {
  selectedOption: string = '';
  buttonColor: string = '#686868';
  personName: string = '';
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  showUserList: boolean = false;
  channelName: string = '';
  channelDescription: string = '';
  channelMember: { userId: string }[] = [];
  selectedUsers: any[] = [];
  channel: Channel = new Channel(); 
  allChannels: any = [];
  currentChannelId: string = '';
  

  constructor(private dialogRef: MatDialogRef<DialogAddPeopleToNewChannelComponent>, @Inject(MAT_DIALOG_DATA) public data: { channels: any[] }, private firestoreService: FirestoreService, private channelService: ChannelService, private readonly firestore: Firestore){
    onSnapshot(collection(this.firestore, 'channels'), (list) => {
      this.allChannels = list.docs.map((doc) => doc.data());
    });
  }

  ngOnInit(): void {
    this.firestoreService.getAllUsers().then(users => {
      this.allUsers = users;
    }).catch(error => {
      console.error('Error fetching users:', error);
    });
    this.channelService.getChannels().then((channels) => {
      this.allChannels = channels;
      console.log('Channels', channels);
    });
    this.currentChannelId = this.channelService.getCurrentChannelId();
    console.log(this.currentChannelId)
  }

  closeAddPeopleToNewChannelDialog(): void {
    this.dialogRef.close();
  }

  toggleButtonColor(): void {
    this.buttonColor = !this.selectedOption ? '#686868' : '#444DF2';
  }

  selectUser(user: any): void {
    this.personName = user.username;
    this.channelMember.push({ userId: user.uid });
    this.showUserList = false;
  }

  async addUserToChannel() {
    try {
      const channelDocRef = this.channelService.getChannelDocByID(this.currentChannelId);
      const currentUsers = this.channelService.channel.users || [];
      const updatedUsers = currentUsers.concat(this.channelMember.map(member => member.userId));
      await this.channelService.updateChannel(channelDocRef, { users: updatedUsers });
      this.showUserList = false;
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Benutzer zum Kanal:', error);
    }
  }

  filterUsers(): void {
    if (this.personName.trim() !== '') {
        this.filteredUsers = this.allUsers.filter(user => {
            return user.username.toLowerCase().includes(this.personName.toLowerCase());
        });
        this.showUserList = true;
    } else {
        this.filteredUsers = [];
        this.showUserList = false;
    }
  }
}