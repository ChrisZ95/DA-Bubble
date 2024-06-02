import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-contact-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-contact-info.component.html',
  styleUrl: './dialog-contact-info.component.scss'
})
export class DialogContactInfoComponent implements OnInit{
  constructor(
    private dialogRef: MatDialogRef<DialogContactInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

    ngOnInit(): void {
      console.log(this.data)
    }

  closeContactInfoDialog(){
    this.dialogRef.close();
  }
}
