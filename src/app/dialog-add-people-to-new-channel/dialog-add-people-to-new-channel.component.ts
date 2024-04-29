import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-add-people-to-new-channel',
  standalone: true,
  imports: [],
  templateUrl: './dialog-add-people-to-new-channel.component.html',
  styleUrl: './dialog-add-people-to-new-channel.component.scss'
})
export class DialogAddPeopleToNewChannelComponent {
  constructor(private dialogRef: MatDialogRef<DialogAddPeopleToNewChannelComponent>){}

  closeAddPeopleToNewChannelDialog(): void {
    this.dialogRef.close();
  }
}
