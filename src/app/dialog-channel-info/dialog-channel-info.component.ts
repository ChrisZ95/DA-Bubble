import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-channel-info',
  standalone: true,
  imports: [],
  templateUrl: './dialog-channel-info.component.html',
  styleUrl: './dialog-channel-info.component.scss'
})
export class DialogChannelInfoComponent {
  constructor(private dialogRef: MatDialogRef<DialogChannelInfoComponent>) {}

  closeChannelInfoDialog(): void {
    this.dialogRef.close();
  }
}
