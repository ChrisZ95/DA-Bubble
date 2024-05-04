import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, DocumentReference, DocumentData, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from './../../models/channel.class';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private channelName: string = '';
  private channelDescription: string = '';
  showChannelChat: boolean = true;
  selectedChannelName: string | null = null;
  
  constructor(private readonly firestore: Firestore) {}

  addChannel(channelData: Channel): Promise<DocumentReference<DocumentData>> {
    return addDoc(collection(this.firestore, 'channels'), channelData.toJson());
  }

  async updateChannel(channel: Channel): Promise<void> {
    try {
      // Überprüfen, ob channelMember vorhanden ist und initialisieren, falls nicht
      if (!channel.channelMember) {
        channel.channelMember = [];
      }
  
      // Annahme: Sie haben eine Methode, um den Kanal im Firestore zu aktualisieren
      // Hier ein Beispiel, wie Sie den Kanal im Firestore aktualisieren könnten
      const channelDocRef = doc(this.firestore, 'channels', channel.id);
      await updateDoc(channelDocRef, {
        channelName: channel.channelName,
        channelDescription: channel.channelDescription,
        channelMember: channel.channelMember
      });
      console.log('Kanal aktualisiert:', channel);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Kanals:', error);
      throw error;
    }
  }

  setChannelData(name: string, description: string): void {
    this.channelName = name;
    this.channelDescription = description;
  }

  getChannelName(): string {
    return this.channelName;
  }

  getChannelDescription(): string {
    return this.channelDescription;
  }

  setSelectedChannelName(channelName: string) {
    this.selectedChannelName = channelName;
  }

  getSelectedChannelName(): string | null {
    return this.selectedChannelName;
  }
}