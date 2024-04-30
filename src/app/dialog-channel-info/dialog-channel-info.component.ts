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
            this.editingName = !this.editingName;
        } else if (field === 'description') {
            this.editingDescription = !this.editingDescription;
        }
        this.isEditing = this.editingName || this.editingDescription;
    }

    saveChanges() {
        if (this.editingName) {
            this.channelName = this.editedChannelName;
        }
        if (this.editingDescription) {
            this.description = this.editedDescription;
        }
        this.toggleEditing('');
    }
}
