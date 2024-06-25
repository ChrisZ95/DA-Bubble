import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Firestore } from '@angular/fire/firestore';
import { doc, addDoc, collection, getDoc } from 'firebase/firestore';
import { GenerateIdsService } from './generate-ids.service';
import { FirestoreService } from '../firestore.service';

@Injectable({
  providedIn: 'root',
})
export class ThreadService {
  private messageInformationSubject = new BehaviorSubject<any>(null);
  constructor( private firestore: Firestore, private generateId: GenerateIdsService, private FirestoreService: FirestoreService) {}

  private documentIDSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public threadDocumentID$: Observable<any> = this.documentIDSubject.asObservable();

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
    const timestamp = this.FirestoreService.createTimeStamp();
    const currentuserID = localStorage.getItem('uid');
    const currentUserData = await this.loadUserDataFromDatabase(currentuserID);
    if (!currentUserData) {
      console.error('Fehler: Benutzer konnte nicht geladen werden.');
      return;
    }

    try {
      const messagesCollectionRef = collection(this.firestore, `threads/${currentThreadDocID}/messages`);
      const newMessage = {
        message: message,
        image: imageFile,
        createdAt: timestamp,
        senderName: currentUserData.username,
        senderID: currentUserData.uid,
      };
      await addDoc(messagesCollectionRef, newMessage);

    } catch (error) {
      console.error('Fehler beim Speichern der Nachricht:', error);
    }
  }

  async loadUserDataFromDatabase(userID: any) {
    const docRef = doc(this.firestore, 'users', userID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const userDetails = {
        username: userData['username'],
        email: userData['email'],
        photo: userData['photo'],
        uid: userData['uid'],
        signUpdate: userData['signUpdate'],
        logIndate: userData['logIndate'],
        logOutDate: userData['logOutDate'],
      };
      return userDetails;
    } else {
      console.log('No such document!');
      return null;
    }
  }
}
