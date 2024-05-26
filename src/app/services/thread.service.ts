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
  constructor(private firestore: Firestore) {}
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
  // try {
  //   const docRef = doc(this.firestore, 'messages', this.chatDocId);
  //   const docSnap = await getDoc(docRef);
  //   if (docSnap.exists()) {
  //     const data = docSnap.data() as MessageObject;
  //     const replies = data.replies || [];
  //     replies.push(messageReply);
  //     await updateDoc(docRef, { replies });
  //     console.log('Message reply updated successfully');
  //   } else {
  //     console.log('No such document!');
  //   }
  // } catch (error) {
  //   console.error('Error updating document: ', error);
  // }

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
          const message = messages[messageIndex];
          if (!message.replies) {
            message.replies = [];
          }
          message.replies.push(messageReply);
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
