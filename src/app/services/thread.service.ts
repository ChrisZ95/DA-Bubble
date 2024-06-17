import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Firestore, getFirestore, onSnapshot, DocumentData,} from '@angular/fire/firestore';
import { doc, setDoc, addDoc, collection, getDoc, getDocs, updateDoc, query, where,} from 'firebase/firestore';
import { GenerateIdsService } from './generate-ids.service';
import { FirestoreService } from '../firestore.service';

@Injectable({
  providedIn: 'root',
})
export class ThreadService {
  private messageInformationSubject = new BehaviorSubject<any>(null);
  constructor( private firestore: Firestore, private generateId: GenerateIdsService, private firestoreService: FirestoreService) {}

  private documentIDSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public documentID$: Observable<any> = this.documentIDSubject.asObservable();

  displayThread: boolean = false;
  messageInformation: any;
  chatDocId: string = '';

  getMessage(messageInformation: any, chatDocId: any) {
    this.messageInformation = messageInformation;
    this.chatDocId = chatDocId;
    if(this.displayThread) {
      this.displayThread = false;
    } else {
      this.displayThread = true;
    }
    this.documentIDSubject.next(messageInformation.threadID);
  }

  async sendThreadMessageToDatabase(imageFile: any, message: any, currentThreadDocID: any) {
    console.log(imageFile)
    console.log(message)
    console.log(currentThreadDocID)

  }
}
