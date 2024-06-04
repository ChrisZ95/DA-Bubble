import { FirestoreService } from './../firestore.service';
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogEditProfileComponent } from '../dialog-edit-profile/dialog-edit-profile.component';

@Component({
  selector: 'app-dialog-contact-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-contact-info.component.html',
  styleUrls: ['./dialog-contact-info.component.scss']
})
export class DialogContactInfoComponent implements OnInit{
  constructor(
    private dialogRef: MatDialogRef<DialogContactInfoComponent>,
    private firestore: FirestoreService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

    onlineStatus: Date = new Date();
    formattedDate: string = '';
    lastOnlineMessage: string = '';
    onlineStatusClass: string = '';
    signUpDate: Date = new Date();
    userIsVerified: any;
    myAccount: boolean = false;

    ngOnInit(): void {
      debugger
      console.log(this.data);
      if (this.data) {
        this.convertOnlineStatus(this.data.logIndate, this.data.logOutDate);
        this.convertSignUpDate(this.data.signUpdate);
        this.userIsVerified = this.firestore.auth.currentUser.emailVerified;
        const localStorageUid = localStorage.getItem('uid');
        this.myAccount = this.data.uid === localStorageUid;
      } else {
        console.error('Keine Daten erhalten');
      }
    }

  convertSignUpDate(unixTimestamp: any) {
    if (unixTimestamp.toString().length === 13) {
      this.signUpDate = new Date(unixTimestamp);
    } else {
      this.signUpDate = new Date(unixTimestamp * 1000);
    }
    const year = this.signUpDate.getFullYear();
    const month = this.signUpDate.getMonth() + 1;
    const day = this.signUpDate.getDate();
    this.formattedDate = `${day}.${month}.${year}`;
  }

  closeContactInfoDialog() {
    this.dialogRef.close();
  }

  openEditProfile() {
    this.closeContactInfoDialog();
    this.dialog.open(DialogEditProfileComponent);
  }

  convertOnlineStatus(unixTimestampLogIn: any, unixTimestampLogOut: any): void {
    const currentDate = new Date();
    let onlineStatus: Date;

    if (unixTimestampLogIn.toString().length === 13) {
      onlineStatus = new Date(unixTimestampLogIn);
    } else {
      onlineStatus = new Date(unixTimestampLogIn * 1000);
    }

    if (unixTimestampLogOut === 1) {
      this.lastOnlineMessage = 'Online';
      this.onlineStatusClass = 'online';
      return;
    }

    const diffInMs = currentDate.getTime() - onlineStatus.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 5) {
      this.lastOnlineMessage = 'Zuletzt online gerade eben';
      this.onlineStatusClass = 'offline';
    } else if (diffInMinutes < 60) {
      this.lastOnlineMessage = `Zuletzt online vor ${diffInMinutes} Minuten`;
      this.onlineStatusClass = 'offline';
    } else if (diffInHours < 24) {
      this.lastOnlineMessage = `Zuletzt online vor ${diffInHours} Stunden`;
      this.onlineStatusClass = 'offline';
    } else {
      this.lastOnlineMessage = `Zuletzt online vor ${diffInDays} Tagen`;
      this.onlineStatusClass = 'offline';
    }
  }
}
