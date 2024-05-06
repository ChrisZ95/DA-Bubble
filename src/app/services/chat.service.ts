import { Injectable } from '@angular/core';
import {
  Firestore,
  getFirestore,
  provideFirestore,
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

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private firestore: Firestore) {}

  db = getFirestore();
  chatsCollection = collection(this.db, 'chats');
  usersCollection = collection(this.db, 'users');

  async createChat() {
    let allChats: any = await getDocs(this.chatsCollection);
    allChats = allChats.data();

    // 1. Load all Chats
    const dbRef = collection(this.db, 'chats');

    // 2. Iterate if Chat is existing
    // 3. Yes -> Load Chat
    // 4. No -> Create new Chat
  }

  async sendData(text: any) {
    let chat = await setDoc(doc(this.chatsCollection, text.id), text).then(
      () => {
        console.log('data saved');
      }
    );
  }
}
