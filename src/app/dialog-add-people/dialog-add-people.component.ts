import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-add-people',
  standalone: true,
  imports: [],
  templateUrl: './dialog-add-people.component.html',
  styleUrl: './dialog-add-people.component.scss'
})
export class DialogAddPeopleComponent {
  constructor(private dialogRef: MatDialogRef<DialogAddPeopleComponent>) {}

  closeAddPeopleDialog(): void {
    this.dialogRef.close();
  }
}
