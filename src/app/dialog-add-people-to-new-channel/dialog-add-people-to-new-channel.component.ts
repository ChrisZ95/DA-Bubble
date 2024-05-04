import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { Firestore, collection, getDocs, doc, updateDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
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
  channel: Channel = Channel.create();
  channelName: string = '';
  channelDescription: string = '';
  channelMember: { userId: string }[] = [];
  

  constructor(private dialogRef: MatDialogRef<DialogAddPeopleToNewChannelComponent>, private firestoreService: FirestoreService, private channelService: ChannelService, private readonly firestore: Firestore){
    this.channelName = this.channelService.getChannelName();
    this.channelDescription = this.channelService.getChannelDescription();
  }

  ngOnInit(): void {
    this.firestoreService.getAllUsers().then(users => {
      this.allUsers = users;
    }).catch(error => {
      console.error('Error fetching users:', error);
    });
  }


  closeAddPeopleToNewChannelDialog(): void {
    this.dialogRef.close();
  }

  toggleButtonColor(): void {
    this.buttonColor = !this.selectedOption ? '#686868' : '#444DF2';
  }

  selectUser(user: any): void {
    this.personName = user.username; // Setze den Benutzernamen in der Anzeige
    this.channelMember.push({ userId: user.id }); // Füge den ausgewählten Benutzer zum channelMember Array hinzu
    this.showUserList = false; // Verstecke die Benutzerliste
    console.log(this.channelMember)
  }

  createChannel() {
    // Erstelle ein neues Channel-Objekt mit den eingegebenen Werten
    const newChannelData: Channel = new Channel({
      channelName: this.channelName,
      channelDescription: this.channelDescription,
      channelMember: this.channelMember
    });
  
    // Überprüfe, ob die Werte korrekt übernommen wurden
    console.log("New Channel Data:", newChannelData);
  
    // Führe den Vorgang zum Hinzufügen des Kanals durch
    this.channelService.addChannel(newChannelData)
      .then(() => {
        console.log('Channel successfully created!');
        this.dialogRef.close();
      })
      .catch((error) => {
        console.error('Error creating channel: ', error);
      });
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