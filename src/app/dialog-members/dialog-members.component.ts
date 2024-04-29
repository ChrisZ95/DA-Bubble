import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogAddPeopleComponent } from '../dialog-add-people/dialog-add-people.component';

@Component({
  selector: 'app-dialog-members',
  standalone: true,
  imports: [],
  templateUrl: './dialog-members.component.html',
  styleUrl: './dialog-members.component.scss'
})
export class DialogMembersComponent {
  constructor(private dialogRef: MatDialogRef<DialogMembersComponent>, public dialog: MatDialog) {}

  closeDialogMember(): void {
    this.dialogRef.close();
  }

  openAddPeopleDialog() {
    this.dialog.open(DialogAddPeopleComponent);
    this.dialogRef.close();
  }
}
