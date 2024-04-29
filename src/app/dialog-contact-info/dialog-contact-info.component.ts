import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-contact-info',
  standalone: true,
  imports: [],
  templateUrl: './dialog-contact-info.component.html',
  styleUrl: './dialog-contact-info.component.scss'
})
export class DialogContactInfoComponent {
  constructor(private dialogRef: MatDialogRef<DialogContactInfoComponent>) {}
  
  closeContactInfoDialog(){
    this.dialogRef.close();
  }
}
