import { Injectable } from '@angular/core';
import {
  Firestore,
  getFirestore,
  provideFirestore,
  onSnapshot,
} from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';
import {
  doc,
  setDoc,
  addDoc,
  collection,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { ChannelService } from './channel.service';
import { FirestoreService } from '../firestore.service';
import { log } from 'console';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  chatList: any = [];

  constructor(
    private firestore: Firestore,
    public channelService: ChannelService,
    public FirestoreService: FirestoreService
  ) {}

  db = getFirestore();
  chatsCollection = collection(this.db, 'chats');
  usersCollection = collection(this.db, 'users');

  // Function to get documents from a collection
  async getChatsDocumentIDs(collectionName: string) {
    const docRef = collection(this.db, collectionName);
    const docSnap = await getDocs(docRef);
    return docSnap.docs.map((doc) => doc.id);
  }

  async createChat(userDetails: any) {
    let currentuid = this.FirestoreService.currentuid;
    if (currentuid == userDetails.uid) {
      return 1;
    }
    if (userDetails.uid) {
      //if Nur solange die gespeichert Daten unterschiedlich sind

      let chatDocIds: any;
      this.getChatsDocumentIDs('chats').then((ids) => {
        chatDocIds = ids;
      });
      setTimeout(() => {
        console.log('chatDocIds', chatDocIds);
      }, 250);

      let allChats: any = await getDocs(this.chatsCollection);
      // 1. Load all Chats
      const dbRef = collection(this.db, 'chats');

      // 2. Iterate if Chat is existing
      // 3. Yes -> Load Chat
      // 4. No -> Create new Chat
      return '2';
    }
    return '3';
  }

  async sendData(text: any) {
    let chat = await setDoc(doc(this.chatsCollection, text.id), text).then(
      () => {
        console.log('data saved');
      }
    );
  }
}
