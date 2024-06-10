import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { Firestore, collection, getDoc, doc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { FirestoreService } from '../firestore.service';
import { Channel } from './../../models/channel.class';
import { ChannelService } from '../services/channel.service';

@Component({
  selector: 'app-dialog-add-people-to-new-channel',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dialog-add-people-to-new-channel.component.html',
  styleUrls: ['./dialog-add-people-to-new-channel.component.scss']
})
export class DialogAddPeopleToNewChannelComponent implements OnInit {
  selectedOption: string = '';
  buttonColor: string = '#686868';
  isButtonDisabled: boolean = true;
  personName: string = '';
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  channelMember: { userId: string }[] = [];
  selectedUsers: any[] = [];
  channel: Channel = new Channel();
  allChannels: any = [];
  currentChannelId: string = '';
  showUserList: boolean = false;
  authorUid: string = '';

  constructor(
    private dialogRef: MatDialogRef<DialogAddPeopleToNewChannelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { channelId: string },
    private firestoreService: FirestoreService,
    private channelService: ChannelService,
    private readonly firestore: Firestore
  ) {
    onSnapshot(collection(this.firestore, 'channels'), (list) => {
      this.allChannels = list.docs.map((doc) => doc.data());
    });
  }

  async ngOnInit(): Promise<void> {
    this.currentChannelId = this.data.channelId;  // Correctly access channelId from data
    const channelDoc = await getDoc(doc(this.firestore, 'channels', this.currentChannelId));
    if (channelDoc.exists()) {
      const channelData = channelDoc.data() as any;
      this.authorUid = channelData.author;
    }
    this.firestoreService.getAllUsers().then(users => {
      this.allUsers = users.filter(user => user.uid !== this.authorUid); // Exclude the author from all users
    }).catch(error => {
      console.error('Error fetching users:', error);
    });
  }

  closeAddPeopleToNewChannelDialog(): void {
    this.dialogRef.close();
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
        user.uid !== this.authorUid 
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
      const usersToAdd = this.getUsersToAdd();
      const updatedUsers = await this.getUpdatedUsers(channelDocRef, usersToAdd);
      await this.channelService.updateChannel(channelDocRef, { users: updatedUsers });
      this.resetSelections();
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Benutzer zum Kanal:', error);
    }
  }
  
  getValidChannelDocRef() {
    const channelDocRef = this.channelService.getChannelDocByID(this.currentChannelId);
    if (!channelDocRef) throw new Error('Channel Document Reference is invalid.');
    return channelDocRef;
  }
  
  getUsersToAdd() {
    return this.selectedOption === 'office' ? this.allUsers : this.selectedUsers;
  }
  
  async getUpdatedUsers(channelDocRef: any, usersToAdd: any[]) {
    const channelSnap = await getDoc(channelDocRef);
    const currentUsers = (channelSnap.data() as { users?: string[] })?.users || [];
    const userIdsToAdd = usersToAdd.map(user => user.uid);
    return [...new Set([...currentUsers, ...userIdsToAdd])];
  }
  
  resetSelections() {
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
    if (this.selectedOption === 'office') {
      this.buttonColor = '#444DF2';
      this.isButtonDisabled = false;
    } else if (this.selectedOption === 'certain' && this.selectedUsers.length > 0) {
      this.buttonColor = '#444DF2';
      this.isButtonDisabled = false;
    } else {
      this.buttonColor = '#686868';
      this.isButtonDisabled = true;
    }
  }
}