import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog'; 
import { DialogAddPeopleToNewChannelComponent } from '../dialog-add-people-to-new-channel/dialog-add-people-to-new-channel.component';
import { Firestore, addDoc, collection, updateDoc, doc } from '@angular/fire/firestore';
import { Channel } from './../../models/channel.class';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../services/channel.service';
import { ChatService } from '../services/chat.service';


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
  channel = new Channel();

  constructor(private dialogRef: MatDialogRef<DialogCreateChannelComponent>, public dialog: MatDialog, private channelService: ChannelService, private readonly firestore: Firestore, public chatService: ChatService) {}

  closeCreateChannelDialog(): void {
    this.dialogRef.close();
  }

  openAddPeopleToNewChannelDialog(newChannelId: string) {
    // Öffne die Dialogkomponente zum Hinzufügen von Personen zum neuen Kanal
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
      this.channelService.channel.name = this.channelName;
      this.channelService.channel.description = this.channelDescription;
  
      // Kanal erstellen
      const newChannelId = await this.channelService.addChannel();
  
      // Chat für den neuen Kanal erstellen
      await this.chatService.createChatForChannel(newChannelId);
  
      this.dialogRef.close();
      this.openAddPeopleToNewChannelDialog(newChannelId);
    } catch (error) {
      console.error('Fehler beim Erstellen des Kanals:', error);
      throw error; // Fehler weiterwerfen, um ihn in der Aufruferkomponente zu behandeln
    }
  }
}