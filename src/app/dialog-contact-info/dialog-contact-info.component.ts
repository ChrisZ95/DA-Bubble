import { FirestoreService } from './../firestore.service';
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogEditProfileComponent } from '../dialog-edit-profile/dialog-edit-profile.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

    onlineStatus: Date = new Date();
    formattedDate: string = '';
    lastOnlineMessage: string = '';
    onlineStatusClass: string = '';
    signUpDate: Date = new Date();
    userIsVerified: any;
    myAccount: boolean = false;

  ngOnInit(): void {
    this.convertOnlineStatus(this.data.logIndate, this.data.logOutDate);
    this.convertSignUpDate(this.data.signUpdate);
    this.userIsVerified = this.firestore.auth.currentUser.emailVerified;
    const localStorageUid = localStorage.getItem('uid')
    if (this.data.uid === 'qahY57hYK6a7PQfEdc7KRCfUEcQ2') {
      this.myAccount = false;
    } else if(this.data.uid === localStorageUid) {
      this.myAccount = true;
    } else {
      this.myAccount = false;
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
    const onlineStatus = this.getOnlineStatusDate(unixTimestampLogIn);
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
    } else if (diffInMinutes < 60) {
      this.lastOnlineMessage = `Zuletzt online vor ${diffInMinutes} Minuten`;
    } else if (diffInHours < 24) {
      this.lastOnlineMessage = `Zuletzt online vor ${diffInHours} Stunden`;
    } else {
      this.lastOnlineMessage = `Zuletzt online vor ${diffInDays} Tagen`;
    }
    this.onlineStatusClass = 'offline';
  }

  getOnlineStatusDate(unixTimestamp: any): Date {
    const millisecondsInSecond = 1000;
    const timestamp = parseInt(unixTimestamp.toString(), 10);
    const timestampInMilliseconds = unixTimestamp.toString().length === 13 ? timestamp : timestamp * millisecondsInSecond;
    return new Date(timestampInMilliseconds);
  }

  getFormattedEmail(email: string): SafeHtml {
    const formattedEmail = email.replace('@', '\u200B@');
    return this.sanitizer.bypassSecurityTrustHtml(formattedEmail);
  }
}
