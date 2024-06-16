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
    console.log(messageInformation)
    console.log(chatDocId)
    // this.MessageObject.message = messageInformation.message
  }
}
