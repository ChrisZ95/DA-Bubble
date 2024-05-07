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
  
  showChannelChat: boolean = true;

  channelList: any = [];
  channelProfileImagesList: any = []
  
  constructor(private readonly firestore: Firestore, private FirestoreService: FirestoreService) {
    
  }

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  getChannelDoc() {
    return doc(collection(this.firestore, 'channels'), this.channelID);
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

  addChannel() {
    addDoc(collection(this.firestore, 'channels'), this.channel.toJSON());
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

  async addUserToChannel(channelDoc: string) {
    let channelRef = this.getChannelDocByID(channelDoc)
    const channelDocSnapshot = await getDoc(channelRef);
    const userData = channelDocSnapshot.data()?.['users'] || [];
    await this.updateChannel(channelRef, {
      users: userData
    })
  }
}