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
  displayedUserNames: string[] = [];
  
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
    if (!this.selectedUsers.find(u => u.uid === user.uid)) {
        this.selectedUsers.push(user);
        this.updateDisplayedUserNames();
        if (this.selectedUsers.length === 1) { // Check if only one user is selected
            this.personName = user.username; // Set personName to the username directly
        } else {
            this.personName += `, ${user.username}`; // Otherwise append to personName
        }
    }
    console.log('Ausgewählte User:', this.displayedUserNames)
    // Remove this line to keep the input field populated after selecting a user
    // this.personName = ''; // Clear input field after selecting user
    this.showUserList = false; // Close dropdown after selecting user
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

  removeUser(user: any): void {
    this.selectedUsers = this.selectedUsers.filter(u => u.uid !== user.uid);
    this.updatePersonName(); // Update the input field value
  }

  updatePersonName(): void {
    this.personName = this.selectedUsers.map(u => u.username).join(', ');
  }

  updateDisplayedUserNames(): void {
    this.displayedUserNames = this.selectedUsers.map(user => user.username);
  }
}