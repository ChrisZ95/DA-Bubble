import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-dialog-delete-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-delete-profile.component.html',
  styleUrl: './dialog-delete-profile.component.scss'
})
export class DialogDeleteProfileComponent implements OnInit{
  constructor(private dialogRef: MatDialogRef<DialogDeleteProfileComponent>,
  public dialog: MatDialog,
  private firestoreService: FirestoreService,
  private router: Router) {}

  succesDelete = false;
  logInUid: any;
  showInputInformationEmail: any;

  ngOnInit(): void {
    const uid = localStorage.getItem('uid');
    this.logInUid = uid;
  }

  closeDeleteProfileDialog(): void {
    this.dialogRef.close();
  }

  async deleteUserAccount() {
    try {
      const result = await this.firestoreService.deleteAccount(this.logInUid);
      this.showInputInformationEmail = false;

      if (result === 'auth/correct') {
        this.closeDeleteProfileDialog();
        await this.firestoreService.logOutAfterDeleteAccount();
        console.log('Der User wurde gelöscht');
      } else if (result === 'auth/requires-recent-login') {
        this.showInputInformationEmail = true;
        console.log('Der User muss sich neu anmelden');
      } else if (result === 'auth/false') {
        console.log('Beim Löschen des Users ist etwas schiefgelaufen');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  }

  logOut() {
    this.closeDeleteProfileDialog();
    this.router.navigate(['']);
    this.firestoreService.logOut()
  }

}
