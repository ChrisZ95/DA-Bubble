import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  DocumentReference,
  DocumentData,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from './../../models/channel.class';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  private channelName: string = '';
  private channelDescription: string = '';
  showChannelChat: boolean = false;
  selectedChannelName: string | null = null;
  selectedChannelDescription: string | null = null;

  constructor(private readonly firestore: Firestore) {}

  addChannel(channelData: Channel): Promise<DocumentReference<DocumentData>> {
    return addDoc(collection(this.firestore, 'channels'), channelData.toJson());
  }

  async updateChannel(channel: Channel): Promise<void> {
    try {
      if (!channel.channelMember) {
        channel.channelMember = [];
      }
      const channelDocRef = doc(this.firestore, 'channels', channel.id);
      await updateDoc(channelDocRef, {
        channelName: channel.channelName,
        channelDescription: channel.channelDescription,
        channelMember: channel.channelMember,
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

  setSelectedChannelDescription(channelDescription: string) {
    this.selectedChannelDescription = channelDescription;
  }

  getSelectedChannelDescription(): string | null {
    return this.selectedChannelDescription;
  }
}
