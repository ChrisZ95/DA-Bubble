import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogAddPeopleComponent } from '../dialog-add-people/dialog-add-people.component';
import { ChannelService } from '../services/channel.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-members',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './dialog-members.component.html',
  styleUrl: './dialog-members.component.scss'
})
export class DialogMembersComponent {
  constructor(private dialogRef: MatDialogRef<DialogMembersComponent>, public dialog: MatDialog, public channelService: ChannelService) {}

  closeDialogMember(): void {
    this.dialogRef.close();
  }

  openAddPeopleDialog() {
    this.dialog.open(DialogAddPeopleComponent);
    this.dialogRef.close();
  }
}
