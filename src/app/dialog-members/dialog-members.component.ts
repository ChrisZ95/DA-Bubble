import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-members',
  standalone: true,
  imports: [],
  templateUrl: './dialog-members.component.html',
  styleUrl: './dialog-members.component.scss'
})
export class DialogMembersComponent {
  constructor(private dialogRef: MatDialogRef<DialogMembersComponent>) {}

  closeDialogMember(): void {
    this.dialogRef.close();
  }
}
