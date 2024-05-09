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
import { GenerateIdsService } from './generate-ids.service';

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

  async createChat(userDetails: any) {
    let chatDocIds: any;
    this.getChatsDocumentIDs('chats').then((ids) => {
      chatDocIds = ids;
    });
    let currentuid = this.FirestoreService.currentuid;

    if (currentuid == userDetails.uid) {
      setTimeout(() => {
        let ownChatDocId = chatDocIds.filter((ids: any) => {
          if (currentuid == ids) {
            return ids;
          }
        });
        if (ownChatDocId.length == 0) {
          ownChatDocId = currentuid;
          const chatData = {
            chatId: currentuid,
          };
          setDoc(doc(this.firestore, 'chats', currentuid), chatData);
        }
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
    console.log('ownChatDocId123', docId);
    let chatRef = doc(this.chatsCollection, docId[0]);
    let chatData = await getDoc(chatRef);
    this.loadedchatInformation = chatData.data();
    console.log('chat', this.loadedchatInformation);
  }

  async sendData(text: any) {
    console.log('loadedchatInformation', this.loadedchatInformation);
    let id = this.generateIdServie.generateId();
    let date = new Date().getTime().toString();
    let currentuid = this.FirestoreService.currentuid;
    let message = {
      message: text,
      id: id,
      creator: currentuid,
      createdAt: date,
    };
    console.log('message', message);

    if (this.loadedchatInformation.messages) {
      console.log('exist');
    } else {
      console.log('DONT exist');
    }

    // let chat = await setDoc(doc(this.chatsCollection, text.id), text).then(
    //   () => {
    //     console.log('data saved');
    //   }
    // );
  }

  async createChatForChannel(channelId: string): Promise<void> {
    try {
      const chatId = this.generateIdServie.generateId();

      const chatData = {
        channelId: channelId,
      };

      await setDoc(doc(this.firestore, 'chats', chatId), chatData);

      console.log('Chat erfolgreich erstellt für Kanal:', channelId);
    } catch (error) {
      console.error(
        'Fehler beim Erstellen des Chats für Kanal:',
        channelId,
        error
      );
      throw error; // Fehler weiterwerfen, um ihn in der Aufruferkomponente zu behandeln
    }
  }
}
