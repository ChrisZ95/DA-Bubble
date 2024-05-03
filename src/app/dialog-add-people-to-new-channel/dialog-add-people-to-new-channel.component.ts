import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { FirestoreService } from '../firestore.service';

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
  allUsers: User[] = [];

  constructor(private dialogRef: MatDialogRef<DialogAddPeopleToNewChannelComponent>, private firestoreService: FirestoreService){}

  ngOnInit(): void {
    this.fetchAllUsers();
  }

  async fetchAllUsers(){
    this.allUsers = await this.firestoreService.getAllUsers();
  }

  closeAddPeopleToNewChannelDialog(): void {
    this.dialogRef.close();
  }

  toggleButtonColor(): void {
    this.buttonColor = !this.selectedOption ? '#686868' : '#444DF2';
  }

  addUserToChannel(): void {
  // Logik zum Erstellen des Kanals hier
  }
}