import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog'; 


@Component({
  selector: 'app-dialog-create-channel',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './dialog-create-channel.component.html',
  styleUrl: './dialog-create-channel.component.scss'
})
export class DialogCreateChannelComponent {
  constructor(private dialogRef: MatDialogRef<DialogCreateChannelComponent>) {}

  closeCreateChannelDialog(): void {
    this.dialogRef.close();
  }
}
