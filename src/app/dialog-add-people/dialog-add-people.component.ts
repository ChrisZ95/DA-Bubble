import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../services/channel.service';
import { Firestore, arrayUnion, doc, addDoc, updateDoc, onSnapshot, collection, getDoc } from '@angular/fire/firestore';
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
    if (!this.selectedUsers.find(u => u.uid === user.uid)) {
      this.selectedUsers.push(user);
      this.updatePersonName();
    }
    this.personName = '';
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
        if (!channelDocRef) {
            throw new Error('Channel Document Reference is invalid.');
        }
        const channelSnap = await getDoc(channelDocRef);
        if (!channelSnap.exists()) {
            throw new Error('Channel document does not exist.');
        }
        const currentChannelData = channelSnap.data();
        const currentUsers = currentChannelData['users'] || [];
        const userIdsToAdd = this.selectedUsers.map(user => user.uid);
        const updatedUsers = [...new Set([...currentUsers, ...userIdsToAdd])];
        await this.channelService.updateChannel(channelDocRef, { users: updatedUsers });
        this.selectedUsers = [];
        this.updatePersonName();
    } catch (error) {
        console.error('Fehler beim Hinzufügen der Benutzer zum Kanal:', error);
    }
}

  removeUser(user: any): void {
    this.selectedUsers = this.selectedUsers.filter(u => u.uid !== user.uid);
    this.updatePersonName();
  }

  updatePersonName(): void {
    this.personName = this.selectedUsers.map(u => u.username).join(', ');
  }
}