import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ChannelService } from '../services/channel.service';
import { Firestore, updateDoc, doc } from '@angular/fire/firestore';
import { Channel } from './../../models/channel.class';

@Component({
  selector: 'app-dialog-channel-info',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './dialog-channel-info.component.html',
  styleUrl: './dialog-channel-info.component.scss'
})
export class DialogChannelInfoComponent implements OnInit {
    constructor(private dialogRef: MatDialogRef<DialogChannelInfoComponent>, public channelService: ChannelService, private readonly firestore: Firestore) {}

    closeChannelInfoDialog(): void {
    this.dialogRef.close();
    }

    ngOnInit(): void {

    }

    channelName!: string
    description!: string
    channelDescription: string | null = null;
    editedChannelName: string | null = null;
    editedDescription: string | null = null;
    editingName: boolean = false;
    editingDescription: boolean = false;
    isEditing: boolean = false;

    toggleEditing(field: string) {
        if (field === 'name') {
            if (!this.editingName) {
                this.editedChannelName = this.channelService.channelName;
            } else {
                this.updateName();
            }
            this.editingName = !this.editingName;
        } else if (field === 'description') {
            if (!this.editingDescription) {
                this.editedDescription = this.channelService.channelDescription; 
            } else {
                this.updateDescription();
            }
            this.editingDescription = !this.editingDescription;
        }
        this.isEditing = this.editingName || this.editingDescription;
    }

    async updateName() {
        if (this.editedChannelName !== null) {
          const fieldName = 'name';
          const channelID = await this.channelService.getChannelIDByField(fieldName, this.channelService.channelName);
          if (channelID !== null) {
            const channelRef = this.channelService.getChannelDocByID(channelID);
            await this.channelService.updateChannel(channelRef, { name: this.editedChannelName }); 
            this.channelService.channelName = this.editedChannelName; 
          } else {
            console.error('Dokument mit diesem Feldwert wurde nicht gefunden.');
          }
        } else {
          console.error('Bearbeiteter Kanalname ist null.');
        }
      }

      async updateDescription() {
        if (this.editedDescription !== null) { 
          const fieldName = 'description';
          const channelID = await this.channelService.getChannelIDByField(fieldName, this.channelService.channelDescription);
          if (channelID !== null) {
            const channelRef = this.channelService.getChannelDocByID(channelID);
            await this.channelService.updateChannel(channelRef, { description: this.editedDescription }); 
            this.channelService.channelDescription = this.editedDescription; 
          } else {
            console.error('Dokument mit diesem Feldwert wurde nicht gefunden.');
          }
        } else {
          console.error('Bearbeitete Kanalbeschreibung ist null.');
        }
      }
}