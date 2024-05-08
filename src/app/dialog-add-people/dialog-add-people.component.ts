import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../services/channel.service';
import { Firestore, arrayUnion, doc, addDoc, updateDoc } from '@angular/fire/firestore';
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
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  showUserList: boolean = false;
  channelName: string = '';
  channelDescription: string = '';
  channelMember: { userId: string }[] = [];
  selectedUsers: any[] = [];
  channel = new Channel();
  currentChannelId: string = '';

  constructor(private dialogRef: MatDialogRef<DialogAddPeopleComponent>, private firestoreService: FirestoreService, public channelService: ChannelService, private readonly firestore: Firestore) {}

  closeAddPeopleDialog(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.firestoreService.getAllUsers().then(users => {
      this.allUsers = users;
    }).catch(error => {
      console.error('Error fetching users:', error);
    });
    this.currentChannelId = this.channelService.getCurrentChannelId();
  }

  selectUser(user: any): void {
    this.personName = user.username;
    this.selectedUsers.push({ userId: user.username });
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
      // Fügen Sie die ausgewählten Benutzer zur channelMember-Liste hinzu
      this.channelMember.push(...this.selectedUsers);
      // Holen Sie sich die aktuellen Benutzer des Kanals
      const currentUsers = this.channelService.channel.users || [];
      // Kombinieren Sie die aktuellen Benutzer mit den ausgewählten Benutzern
      const updatedUsers = currentUsers.concat(this.channelMember.map(member => member.userId));
      // Aktualisieren Sie den Kanal mit den aktualisierten Benutzern
      await this.channelService.updateChannel(channelDocRef, { users: updatedUsers });
      this.selectedUsers = [];
      this.showUserList = false;
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Benutzer zum Kanal:', error);
    }
  }
}
