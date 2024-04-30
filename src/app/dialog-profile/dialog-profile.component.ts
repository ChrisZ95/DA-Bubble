import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogEditProfileComponent } from '../dialog-edit-profile/dialog-edit-profile.component';

@Component({
  selector: 'app-dialog-profile',
  standalone: true,
  imports: [  ],
  templateUrl: './dialog-profile.component.html',
  styleUrl: './dialog-profile.component.scss'
})
export class DialogProfileComponent {
  constructor(private dialogRef: MatDialogRef<DialogProfileComponent>, public dialog: MatDialog) {
    
  }

  closeProfileDialog(): void {
    this.dialogRef.close();
  }

  openDialogEditProfile(){
    this.dialog.open(DialogEditProfileComponent);
    this.dialogRef.close();
  }
}
