import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, DocumentReference, DocumentData, doc, updateDoc, onSnapshot, getDoc, arrayUnion, query, where, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Channel } from './../../models/channel.class';
import { FirestoreService } from '../firestore.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  channel = new Channel();
  channelID: string = ''
  channelName = '';
  channelListNamesArray: any = [];
  channelDescription = '';
  UserName = '';
  author = ''
  private currentChannelId: string = '';
  showChannelChat: boolean = true;

  channelList: any = [];
  channelProfileImagesList: any = []
  
  constructor(private readonly firestore: Firestore, private FirestoreService: FirestoreService) {
   
  }

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  async getChannels(): Promise<Channel[]> {
    try {
      const channelsCollection = collection(this.firestore, 'channels');
      const usersSnapshot = await getDocs(channelsCollection);
      const channels: Channel[] = [];
      usersSnapshot.forEach((doc) => {
        channels.push(doc.data() as Channel);
      });
      return channels;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  getChannelDoc() {
    if (this.channelID) {
        return doc(collection(this.firestore, 'channels'), this.channelID);
    } else {
        throw new Error('Channel-ID fehlt.');
    }
}

  async getChannelIDByField(field: string, value: any): Promise<string | null> {
    const q = query(collection(this.firestore, 'channels'), where(field, '==', value));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size === 0) {
      return null;
    }
    const docSnapshot = querySnapshot.docs[0];
    return docSnapshot.id;
  }

  getChannelDocByID(ID:string) {
    return doc(collection(this.firestore, 'channels'), ID);
  }

  addChannel(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const newChannel = this.channel.toJSON();
      addDoc(collection(this.firestore, 'channels'), newChannel)
      .then((result: any) => {
        newChannel['channelId'] = result.id;
        updateDoc(doc(this.firestore, 'channels', result.id), newChannel)
        .then(() => {
          console.log(result);
          resolve(result.id); // Übergebe die neu erstellte Kanal-ID
        })
        .catch(error => {
          console.error('Fehler beim Aktualisieren des Kanals:', error);
          reject(error);
        });
      })
      .catch(error => {
        console.error('Fehler beim Erstellen des Kanals:', error);
        reject(error);
      });
    });
  }

  async updateChannel(channelRef: DocumentReference<DocumentData>, object: {}) {
    await updateDoc(channelRef, object);
  }
  
  getChannelName(name: string) {
    this.channelName = name;
  }

  getDescription(text: string) {
    this.channelDescription = text;
  }

  getUserName(name: string) {
    this.UserName = name;
  }

  getAuthor(author: string) {
    this.author = author;
  }

  setCurrentChannelId(channelId: string) {
    this.currentChannelId = channelId;
  }

  getCurrentChannelId(): string {
    return this.currentChannelId;
  }
}