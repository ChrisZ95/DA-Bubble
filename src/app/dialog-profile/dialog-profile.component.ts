import { DialogRef } from '@angular/cdk/dialog';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogEditProfileComponent } from '../dialog-edit-profile/dialog-edit-profile.component';
import { FirestoreService } from '../firestore.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-profile',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './dialog-profile.component.html',
  styleUrl: './dialog-profile.component.scss'
})
export class DialogProfileComponent implements OnInit{
  constructor(private dialogRef: MatDialogRef<DialogProfileComponent>, public dialog: MatDialog, public firestoreService: FirestoreService) {}

  logInUid: any;
  userForm: any;
  userName: any;
  userEmail: any;
  userPhoto: any;
  userSignUpDate: any;
  formattedDate: any;

  async ngOnInit() {
    const uid = localStorage.getItem('uid');
    this.userForm = await this.firestoreService.getUserData(uid);
    this.userName = this.userForm['username'];
    this.userEmail = this.userForm['email'];
    this.userPhoto = this.userForm['photo'];
    this.userSignUpDate = this.userForm['signUpdate'];
    this.convertSignUpDate(this.userSignUpDate);
  }

  convertSignUpDate(unixTimestamp:any) {
    if (unixTimestamp.toString().length === 13) {
        this.userSignUpDate = new Date(unixTimestamp);
    } else {
        this.userSignUpDate = new Date(unixTimestamp * 1000);
    }
    const year = this.userSignUpDate.getFullYear();
    const month = this.userSignUpDate.getMonth() + 1;
    const day = this.userSignUpDate.getDate();
    this.formattedDate = `${day}.${month}.${year}`;
  }

  closeProfileDialog(): void {
    this.dialogRef.close();
  }

  openDialogEditProfile(){
    this.dialog.open(DialogEditProfileComponent);
    this.dialogRef.close();
  }
}
