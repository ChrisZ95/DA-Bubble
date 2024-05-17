import { DialogRef } from '@angular/cdk/dialog';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogEditProfileComponent } from '../dialog-edit-profile/dialog-edit-profile.component';
import { FirestoreService } from '../firestore.service';

@Component({
  selector: 'app-dialog-profile',
  standalone: true,
  imports: [  ],
  templateUrl: './dialog-profile.component.html',
  styleUrl: './dialog-profile.component.scss'
})
export class DialogProfileComponent implements OnInit{
  constructor(private dialogRef: MatDialogRef<DialogProfileComponent>, public dialog: MatDialog, private firestoreService: FirestoreService) {}

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
    console.log('username header (localstorage)',this.userForm['username']);
  }

  closeProfileDialog(): void {
    this.dialogRef.close();
  }

  openDialogEditProfile(){
    this.dialog.open(DialogEditProfileComponent);
    this.dialogRef.close();
  }
}
