import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-channel-info',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './dialog-channel-info.component.html',
  styleUrl: './dialog-channel-info.component.scss'
})
export class DialogChannelInfoComponent {
  constructor(private dialogRef: MatDialogRef<DialogChannelInfoComponent>) {}

  closeChannelInfoDialog(): void {
    this.dialogRef.close();
  }

    channelName = "# Entwicklerteam";
    description = "Dieser Channel ist für alles rund um #dfsdf vorgesehen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen.";
    editedChannelName: string = '';
    editedDescription: string = '';
    editingName: boolean = false;
    editingDescription: boolean = false;
    isEditing: boolean = false;

    toggleEditing(field: string) {
        if (field === 'name') {
            if (!this.editingName) {
                this.editedChannelName = this.channelName;
            } else {
                this.saveChanges('name');
            }
            this.editingName = !this.editingName;
        } else if (field === 'description') {
            if (!this.editingDescription) {
                this.editedDescription = this.description; 
            } else {
                this.saveChanges('description');
            }
            this.editingDescription = !this.editingDescription;
        }
        this.isEditing = this.editingName || this.editingDescription;
    }
    
    saveChanges(field: string) {
        if (field === 'name') {
            this.channelName = this.editedChannelName;
        } else if (field === 'description') {
            this.description = this.editedDescription;
        }
    }
}