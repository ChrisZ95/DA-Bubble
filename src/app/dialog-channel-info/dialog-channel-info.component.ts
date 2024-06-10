import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ChannelService } from '../services/channel.service';
import { Firestore, updateDoc, doc, getDoc, deleteDoc } from '@angular/fire/firestore';
import { FirestoreService } from '../firestore.service';

@Component({
  selector: 'app-dialog-channel-info',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './dialog-channel-info.component.html',
  styleUrl: './dialog-channel-info.component.scss'
})
export class DialogChannelInfoComponent implements OnInit {
  channelName!: string
  description!: string
  channelDescription: string | null = null;
  editedChannelName: string | null = null;
  editedDescription: string | null = null;
  editingName: boolean = false;
  editingDescription: boolean = false;
  isEditing: boolean = false;
  authorName!: string;
  isChannelAuthor: boolean = false;

  constructor(private dialogRef: MatDialogRef<DialogChannelInfoComponent>, public channelService: ChannelService, private readonly firestore: Firestore, public firestoreService: FirestoreService) {}

  closeChannelInfoDialog(): void {
  this.dialogRef.close();
  }

  async ngOnInit(): Promise<void> {
    const channelId = this.channelService.getCurrentChannelId();
    if (!channelId) return console.error('channelId ist null.');
    try {
      const authorUid = await this.channelService.getChannelAuthorUid(channelId);
      if (!authorUid) return console.error('Autor ist null.');
      this.isChannelAuthor = this.firestoreService.currentuid === authorUid;
      const authorName = await this.channelService.getAuthorName(authorUid);
      if (authorName !== null) this.authorName = authorName;
      else console.error('Benutzername ist null.');
    } catch (error) {
      console.error('Fehler beim Abrufen des Autors oder des Benutzernamens:', error);
    }
  }
  
  toggleEditing(field: string) {
    if (field === 'name') {
      this.toggleNameEditing();
    } else if (field === 'description') {
      this.toggleDescriptionEditing();
    }
  }
  
  toggleNameEditing() {
    if (!this.editingName) {
      this.editedChannelName = this.channelService.channelName;
    } else {
      this.updateName();
    }
    this.editingName = !this.editingName;
    this.updateIsEditing();
  }
  
  toggleDescriptionEditing() {
    if (!this.editingDescription) {
      this.editedDescription = this.channelService.channelDescription;
    } else {
      this.updateDescription();
    }
    this.editingDescription = !this.editingDescription;
    this.updateIsEditing();
  }
  
  updateIsEditing() {
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

  async leaveChannel() {
    this.channelService.leaveChannel();
    this.dialogRef.close();
  }

  async deleteChannel() {
    try {
      const channelId = this.channelService.getCurrentChannelId();
      if (!channelId) {
        throw new Error('Channel ID is not available.');
      }
      await this.channelService.deleteChannel(channelId);
      this.dialogRef.close();
    } catch (error) {
      console.error('Error deleting the channel:', error);
    }
  }
}