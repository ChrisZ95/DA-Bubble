import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-edit-profile',
  standalone: true,
  imports: [],
  templateUrl: './dialog-edit-profile.component.html',
  styleUrl: './dialog-edit-profile.component.scss'
})
export class DialogEditProfileComponent {
  constructor(private dialogRef: MatDialogRef<DialogEditProfileComponent>) {}

  closeEditProfileDialog(){
    this.dialogRef.close();
  }
}
