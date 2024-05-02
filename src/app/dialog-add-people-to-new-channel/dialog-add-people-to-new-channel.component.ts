import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-add-people-to-new-channel',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './dialog-add-people-to-new-channel.component.html',
  styleUrl: './dialog-add-people-to-new-channel.component.scss'
})
export class DialogAddPeopleToNewChannelComponent {
  selectedOption: string = '';
  buttonColor: string = '#686868';
  personName: string = '';

  constructor(private dialogRef: MatDialogRef<DialogAddPeopleToNewChannelComponent>){}

  closeAddPeopleToNewChannelDialog(): void {
    this.dialogRef.close();
  }

  toggleButtonColor(): void {
    this.buttonColor = !this.selectedOption ? '#686868' : '#444DF2';
  }

  createChannel(): void {
  // Logik zum Erstellen des Kanals hier
  }
}