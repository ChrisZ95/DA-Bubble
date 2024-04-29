import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog'; 
import { DialogAddPeopleToNewChannelComponent } from '../dialog-add-people-to-new-channel/dialog-add-people-to-new-channel.component';


@Component({
  selector: 'app-dialog-create-channel',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './dialog-create-channel.component.html',
  styleUrl: './dialog-create-channel.component.scss'
})
export class DialogCreateChannelComponent {
  constructor(private dialogRef: MatDialogRef<DialogCreateChannelComponent>, public dialog: MatDialog) {}

  closeCreateChannelDialog(): void {
    this.dialogRef.close();
  }

  openAddPeopleToNewChannelDialog() {
    this.dialog.open(DialogAddPeopleToNewChannelComponent);
    this.dialogRef.close();
  }
}
