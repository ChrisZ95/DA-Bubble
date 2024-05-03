import { Injectable } from '@angular/core';
import {
  Firestore,
  getFirestore,
  provideFirestore,
} from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { doc, setDoc, addDoc, collection, getDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private firestore: Firestore) {}

  db = getFirestore();
  chatsCollection = collection(this.db, 'chats');

  async sendData(text: any) {
    let chat = await setDoc(doc(this.chatsCollection, text.id), text).then(
      () => {
        console.log('data saved');
      }
    );
  }
}