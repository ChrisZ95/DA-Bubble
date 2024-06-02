import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-contact-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-contact-info.component.html',
  styleUrl: './dialog-contact-info.component.scss'
})
export class DialogContactInfoComponent implements OnInit{
  constructor(
    private dialogRef: MatDialogRef<DialogContactInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

    logIndate: any;
    formattedDate: any;
    lastOnlineMessage: any;

    ngOnInit(): void {
      console.log(this.data)
      this.lastOnlineMessage = this.convertSignUpDate(this.data.logIndate);
    }

  closeContactInfoDialog(){
    this.dialogRef.close();
  }

  convertSignUpDate(unixTimestamp: any): string {
    const now = new Date();
    this.logIndate;

    if (unixTimestamp.toString().length === 13) {
      this.logIndate = new Date(unixTimestamp);
    } else {
      this.logIndate = new Date(unixTimestamp * 1000);
    }

    const diffInMs = now.getTime() - this.logIndate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `vor ${diffInMinutes} Minuten`;
    } else if (diffInHours < 24) {
      return `vor ${diffInHours} Stunden`;
    } else {
      return `vor ${diffInDays} Tagen`;
    }
  }

}
