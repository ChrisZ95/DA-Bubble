import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ChannelService } from '../services/channel.service';

@Component({
  selector: 'app-dialog-channel-info',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './dialog-channel-info.component.html',
  styleUrl: './dialog-channel-info.component.scss'
})
export class DialogChannelInfoComponent implements OnInit {
    constructor(private dialogRef: MatDialogRef<DialogChannelInfoComponent>, private channelService: ChannelService) {}

    closeChannelInfoDialog(): void {
    this.dialogRef.close();
    }

    ngOnInit(): void {
    this.selectedChannelName = this.channelService.getSelectedChannelName();
    this.selectedChannelDescription = this.channelService.getSelectedChannelDescription();
    this.channelName = this.selectedChannelName;
    this.channelDescription = this.selectedChannelDescription;
    }

    channelName: string | null = null;
    channelDescription: string | null = null;
    editedChannelName: string | null = null;
    editedDescription: string | null = null;
    editingName: boolean = false;
    editingDescription: boolean = false;
    isEditing: boolean = false;
    selectedChannelName: string | null = null;
    selectedChannelDescription: string | null = null;

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
                this.editedDescription = this.channelDescription; 
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
            this.channelDescription = this.editedDescription;
        }
    }
}