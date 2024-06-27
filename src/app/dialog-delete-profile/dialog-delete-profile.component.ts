import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@Component({
  selector: 'app-dialog-delete-profile',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  templateUrl: './dialog-delete-profile.component.html',
  styleUrl: './dialog-delete-profile.component.scss'
})
export class DialogDeleteProfileComponent implements OnInit{
  constructor(private dialogRef: MatDialogRef<DialogDeleteProfileComponent>,
  public dialog: MatDialog,
  private firestoreService: FirestoreService,
  private router: Router) {}

  succesDelete = false;
  loadingScreen = false;
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
    this.loadingScreen = true;
    try {
      const result = await this.firestoreService.deleteAccount(this.logInUid);
      this.showInputInformationEmail = false;

      if (result === 'auth/correct') {
        this.closeDeleteProfileDialog();
        await this.firestoreService.logOutAfterDeleteAccount();
      } else if (result === 'auth/requires-recent-login') {
        this.showInputInformationEmail = true;
      }
    } catch (error) {
    }
    this.loadingScreen = false;
  }

  logOut() {
    this.closeDeleteProfileDialog();
    this.router.navigate(['']);
    this.firestoreService.logOut()
  }
}
