import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, DocumentReference, DocumentData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from './../../models/channel.class';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  constructor(private readonly firestore: Firestore) {}

  addChannel(channelData: Channel): Promise<DocumentReference<DocumentData>> {
    return addDoc(collection(this.firestore, 'channels'), channelData.toJson());
  }
}