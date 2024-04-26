import { DialogRef } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-profile',
  standalone: true,
  imports: [  ],
  templateUrl: './dialog-profile.component.html',
  styleUrl: './dialog-profile.component.scss'
})
export class DialogProfileComponent {
  constructor(private dialogRef: MatDialogRef<DialogProfileComponent>) {
    
  }

  closeProfileDialog(): void {
    this.dialogRef.close();
  }
}
