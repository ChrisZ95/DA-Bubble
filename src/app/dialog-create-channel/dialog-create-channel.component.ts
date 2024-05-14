import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog'; 
import { DialogAddPeopleToNewChannelComponent } from '../dialog-add-people-to-new-channel/dialog-add-people-to-new-channel.component';
import { Firestore, addDoc, collection, updateDoc, doc } from '@angular/fire/firestore';
import { Channel } from './../../models/channel.class';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../services/channel.service';
import { ChatService } from '../services/chat.service';
import { FirestoreService } from '../firestore.service';


@Component({
  selector: 'app-dialog-create-channel',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './dialog-create-channel.component.html',
  styleUrl: './dialog-create-channel.component.scss'
})
export class DialogCreateChannelComponent {
  channelName: string = '';
  channelDescription: string = '';
  channelAuthor: string = '';
  channel = new Channel();

  constructor(private dialogRef: MatDialogRef<DialogCreateChannelComponent>, public dialog: MatDialog, private channelService: ChannelService, private readonly firestore: Firestore, public chatService: ChatService, public firestoreService: FirestoreService) {}

  closeCreateChannelDialog(): void {
    this.dialogRef.close();
  }

  openAddPeopleToNewChannelDialog(newChannelId: string) {
    this.dialogRef.close();
    this.dialog.open(DialogAddPeopleToNewChannelComponent, {
      data: {
        newChannelId: newChannelId
      }
    });
    this.channelService.setCurrentChannelId(newChannelId);
  }

  async createChannel(): Promise<void> {
    try {
      // Setze den Autor des Kanals
      const authorUid = this.firestoreService.getUid();
  
      // Überprüfe, ob der Autor vorhanden ist
      if (!authorUid) {
        console.error('Benutzer nicht angemeldet.');
        return;
      }
  
      // Setze die Informationen für den Kanal
      const channelData = {
        channelName: this.channelName,
        description: this.channelDescription,
        author: authorUid, // Setze die UID des Autors
        // Weitere Eigenschaften des Kanals hier hinzufügen
      };
  
      // Füge den Kanal zur Datenbank hinzu
      const newChannelId = await this.channelService.addChannel(channelData);
  
      // Erstelle den Chat für den Kanal
      await this.chatService.createChatForChannel(newChannelId);
  
      // Schließe das Dialogfeld
      this.dialogRef.close();
  
      // Öffne das Dialogfeld zum Hinzufügen von Personen zum neuen Kanal
      this.openAddPeopleToNewChannelDialog(newChannelId);
    } catch (error) {
      console.error('Fehler beim Erstellen des Kanals:', error);
      throw error;
    }
  }
}