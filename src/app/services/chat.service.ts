import { Injectable, OnInit } from '@angular/core';
import {
  Firestore,
  getFirestore,
  provideFirestore,
  onSnapshot,
  DocumentData
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
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { ChannelService } from './channel.service';
import { FirestoreService } from '../firestore.service';
import { log } from 'console';
import { GenerateIdsService } from './generate-ids.service';
import { DocumentReference } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  chatList: any = [];
  loadedchatInformation: any;
  chatDocId: any;

  constructor(
    private firestore: Firestore,
    public channelService: ChannelService,
    public FirestoreService: FirestoreService,
    public generateIdServie: GenerateIdsService
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

  currentuid: any;

  async createChat(userDetails: any) {
    let chatDocIds: any;
    this.getChatsDocumentIDs('chats').then((ids) => {
      chatDocIds = ids;
    });
    this.currentuid = this.FirestoreService.currentuid;
    if (this.currentuid == userDetails.uid) {
      setTimeout(() => {
        let ownChatDocId = chatDocIds.filter((ids: any) => {
          if (this.currentuid == ids) {
            return ids;
          }
        });
        if (ownChatDocId.length == 0) {
          ownChatDocId = this.currentuid;
          const chatData = {
            chatId: this.currentuid,
          };
          setDoc(doc(this.firestore, 'chats', this.currentuid), chatData);
        }
        console.log('ownChatDocId', ownChatDocId);
        this.loadMessages(ownChatDocId);
      }, 250);
    }

    if (userDetails.uid) {
      //if Nur solange die gespeichert Daten unterschiedlich sind

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

  async loadMessages(docId: any) {
    this.chatDocId = docId;
    let chatRef = doc(this.chatsCollection, docId[0]);
    let chatData = await getDoc(chatRef);
    this.loadedchatInformation = chatData.data();
  }

  async sendData(text: any) {
    let id = this.generateIdServie.generateId();
    let date = new Date().getTime().toString();
    let currentuid = this.FirestoreService.currentuid;
    let message = {
      message: text,
      id: id,
      creator: currentuid,
      createdAt: date,
    };
    if (this.loadedchatInformation?.messages) {
      this.loadedchatInformation.messages.push(message);
      console.log('exist');
    } else {
      console.log('DONT exist');
    }

    let chat = await setDoc(
      doc(this.chatsCollection, this.currentuid),
      this.loadedchatInformation
    );
  }

  async sendDataToChannel(channelId: string, message: any) {
    try {
      const chatsRef = collection(this.firestore, 'chats');
      const q = query(chatsRef, where('channelId', '==', channelId));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const chatDocRef = doc.ref;
        const currentMessages = doc.data()?.['messages'] || [];
        const updatedMessages = [...currentMessages, message];
        await updateDoc(chatDocRef, { messages: updatedMessages });
      } else {
        console.error('Chat document not found for channelId:', channelId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async createChatForChannel(channelId: string): Promise<void> {
    try {
      const createdAt = Date.now();
      const chatId = this.generateIdServie.generateId();
      const chatData = {
        createdAt: createdAt, 
        channelId: channelId, 
        id: chatId, 
      };
      await setDoc(doc(this.firestore, 'chats', chatId), chatData);
      console.log('Chat erfolgreich erstellt für Kanal:', channelId);
    } catch (error) {
      console.error(
        'Fehler beim Erstellen des Chats für Kanal:',
        channelId,
        error
      );
      throw error;
    }
  }
}