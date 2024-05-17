import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';

@Component({
  selector: 'app-dialog-edit-profile',
  standalone: true,
  imports: [],
  templateUrl: './dialog-edit-profile.component.html',
  styleUrl: './dialog-edit-profile.component.scss'
})
export class DialogEditProfileComponent implements OnInit{
  constructor(private dialogRef: MatDialogRef<DialogEditProfileComponent>, private firestoreService: FirestoreService) {}

  logInUid: any;
  userForm: any;
  userName: any;
  userEmail: any;
  userPhoto: any;

  async ngOnInit() {
    const uid = localStorage.getItem('uid');
    this.userForm = await this.firestoreService.getUserName(uid);
    this.userName = this.userForm['username'];
    this.userEmail = this.userForm['email'];
    this.userPhoto = this.userForm['photo'];
  }

  closeEditProfileDialog(){
    this.dialogRef.close();
  }
}
