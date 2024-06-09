import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Firestore,
  getFirestore,
  onSnapshot,
  DocumentData,
} from '@angular/fire/firestore';
import {
  doc,
  setDoc,
  addDoc,
  collection,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { log } from 'console';
import { GenerateIdsService } from './generate-ids.service';
import { FirestoreService } from '../firestore.service';
interface MessageObject {
  id: string;
  image: string;
  createdAt: string;
  message: string;
  creator: string;
  replies?: any[];
}

interface ChatDocument {
  messages: MessageObject[];
}

@Injectable({
  providedIn: 'root',
})
export class ThreadService {
  private messageInformationSubject = new BehaviorSubject<any>(null);
  constructor(
    private firestore: Firestore,
    private generateId: GenerateIdsService,
    private firestoreService: FirestoreService,
  ) {}
  displayThread: boolean = false;
  messageInformation: any;
  chatDocId: string = '';

  getMessage(messageInformation: any, chatDocId: any) {
    this.messageInformation = messageInformation;
    this.chatDocId = chatDocId;
    this.messageInformationSubject.next(messageInformation);
  }

  getMessageInformation() {
    return this.messageInformationSubject.asObservable();
  }

  async sendReply(messageReply: any) {
    try {
      const docRef = doc(this.firestore, 'chats', this.chatDocId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as ChatDocument;
        const messages = data.messages || [];
        const messageIndex = messages.findIndex((message) =>
          message.id.includes(this.messageInformation.id)
        );
        if (messageIndex !== -1) {
          const timestamp = new Date().getTime();
          const id = this.generateId.generateId();
          let reply = {
            createdAt: timestamp,
            creator: this.firestoreService.currentuid,
            id: id,
            reply: messageReply,
          };
          const message = messages[messageIndex];
          if (!message.replies) {
            message.replies = [];
          }
          message.replies.push(reply);
          await updateDoc(docRef, { messages });
        } else {
          console.log('No such message!');
        }
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  }
}
