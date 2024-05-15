import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../services/channel.service';
import { Firestore, arrayUnion, doc, addDoc, updateDoc, onSnapshot, collection } from '@angular/fire/firestore';
import { Channel } from './../../models/channel.class';

@Component({
  selector: 'app-dialog-add-people',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './dialog-add-people.component.html',
  styleUrl: './dialog-add-people.component.scss'
})
export class DialogAddPeopleComponent implements OnInit {
  selectedOption: string = '';
  buttonColor: string = '#686868';
  personName: string = '';
  personPhoto: string = '';
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  showUserList: boolean = false;
  channelName: string = '';
  channelDescription: string = '';
  channelMember: { userId: string }[] = [];
  selectedUsers: any[] = [];
  channel = new Channel();
  currentChannelId: string = '';
  allChannels: any = [];

  constructor(private dialogRef: MatDialogRef<DialogAddPeopleComponent>, private firestoreService: FirestoreService, public channelService: ChannelService, private readonly firestore: Firestore) {
    onSnapshot(collection(this.firestore, 'channels'), (list) => {
      this.allChannels = list.docs.map((doc) => doc.data());
    });
  }

  closeAddPeopleDialog(): void {
    this.dialogRef.close();
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

  selectUser(user: any): void {
    this.personName = user.username;
    this.selectedUsers.push({ userId: user.uid });
    this.showUserList = false;
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

  toggleButtonColor(): void {
    this.buttonColor = !this.selectedOption ? '#686868' : '#444DF2';
  }

  async addUserToChannel() {
    try {
      const channelDocRef = this.channelService.getChannelDocByID(this.currentChannelId);
      const currentUsers = this.channelService.channel.users || [];
      const updatedUsers = currentUsers.concat(this.selectedUsers.map(user => user.userId)); // Benutze selectedUsers anstatt channelMember
      await this.channelService.updateChannel(channelDocRef, { users: updatedUsers });
      this.showUserList = false;
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Benutzer zum Kanal:', error);
    }
  }
}