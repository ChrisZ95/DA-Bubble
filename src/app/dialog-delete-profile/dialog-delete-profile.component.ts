import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dialog-delete-profile',
  standalone: true,
  imports: [],
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

  ngOnInit(): void {
    const uid = localStorage.getItem('uid');
    this.logInUid = uid;
  }

  closeDeleteProfileDialog(): void {
    this.dialogRef.close();
  }

  async deleteUserAccount() {
    this.succesDelete = await this.firestoreService.deleteAccount(this.logInUid);
    if (this.succesDelete === true) {
      this.closeDeleteProfileDialog()
      this.router.navigate(['']);
    } else {
      console.log('User konnte nicht gelöscht werden')
    }
  }
}
