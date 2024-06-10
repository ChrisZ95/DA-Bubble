import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../services/channel.service';
import { Firestore, onSnapshot, collection, getDoc } from '@angular/fire/firestore';
import { Channel } from './../../models/channel.class';

@Component({
  selector: 'app-dialog-add-people',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dialog-add-people.component.html',
  styleUrls: ['./dialog-add-people.component.scss']
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
  channelMembers: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<DialogAddPeopleComponent>, 
    private firestoreService: FirestoreService, 
    public channelService: ChannelService, 
    private readonly firestore: Firestore
  ) {
    onSnapshot(collection(this.firestore, 'channels'), (list) => {
      this.allChannels = list.docs.map((doc) => doc.data());
    });
  }

  closeAddPeopleDialog(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.currentChannelId = this.channelService.getCurrentChannelId();
    this.loadChannelData();
  }

  async loadChannelData(): Promise<void> {
    try {
      const channelDocRef = this.getValidChannelDocRef();
      const channelSnap = await getDoc(channelDocRef);
      if (channelSnap.exists()) {
        const channelData = channelSnap.data() as { users: string[] };
        this.channelMembers = channelData.users || [];
      }
      this.allUsers = await this.firestoreService.getAllUsers();
      this.filterAvailableUsers();
    } catch (error) {
      console.error('Error fetching channel data:', error);
    }
  }

  selectUser(user: any): void {
    if (!this.selectedUsers.find(u => u.uid === user.uid)) {
      this.selectedUsers.push(user);
      this.updatePersonName();
    }
    this.personName = '';
    this.showUserList = false;
    this.checkButtonStatus();
  }

  filterUsers(): void {
    if (this.personName.trim() !== '') {
      this.filteredUsers = this.allUsers.filter(user => 
        user.username.toLowerCase().includes(this.personName.toLowerCase()) && 
        !this.channelMembers.includes(user.uid)
      );
      this.showUserList = true;
    } else {
      this.filteredUsers = [];
      this.showUserList = false;
    }
  }

  async addUserToChannel() {
    try {
      const channelDocRef = this.getValidChannelDocRef();
      const updatedUsers = await this.getUpdatedUsers(channelDocRef);
      await this.channelService.updateChannel(channelDocRef, { users: updatedUsers });
      this.clearSelectedUsers();
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Benutzer zum Kanal:', error);
    }
  }
  
  getValidChannelDocRef() {
    const channelDocRef = this.channelService.getChannelDocByID(this.currentChannelId);
    if (!channelDocRef) throw new Error('Channel Document Reference is invalid.');
    return channelDocRef;
  }
  
  async getUpdatedUsers(channelDocRef: any) {
    const channelSnap = await getDoc(channelDocRef);
    if (!channelSnap.exists()) throw new Error('Channel document does not exist.');
    const currentChannelData = channelSnap.data() as { users?: string[] };
    const currentUsers = currentChannelData.users || [];
    const userIdsToAdd = this.selectedUsers.map(user => user.uid);
    return [...new Set([...currentUsers, ...userIdsToAdd])];
  }
  
  clearSelectedUsers() {
    this.selectedUsers = [];
    this.updatePersonName();
    this.checkButtonStatus();
    this.dialogRef.close();
  }

  removeUser(user: any): void {
    this.selectedUsers = this.selectedUsers.filter(u => u.uid !== user.uid);
    this.updatePersonName();
    this.checkButtonStatus();
  }

  updatePersonName(): void {
    this.personName = this.selectedUsers.map(u => u.username).join(', ');
  }

  checkButtonStatus(): void {
    this.buttonColor = this.selectedUsers.length > 0 ? '#444DF2' : '#686868';
  }

  filterAvailableUsers(): void {
    this.allUsers = this.allUsers.filter(user => !this.channelMembers.includes(user.uid));
  }
}