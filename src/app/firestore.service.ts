import { Injectable, EventEmitter } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { FirebaseApp } from '@angular/fire/app';
import { appConfig } from './app.config';
import { getFirestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  public onUserRegistered: EventEmitter<string> = new EventEmitter<string>();
  private auth: any;
  private firestore: any;

  constructor(private myFirebaseApp: FirebaseApp) {
    this.auth = getAuth(myFirebaseApp);
    this.firestore = getFirestore(myFirebaseApp);

    this.createUserWithEmailAndPassword('c.zwick95@gmail.com', 'password123', 'Christopher Zwick');
  }

  getAuth(): any {
    return this.auth;
  }

  async createUserWithEmailAndPassword(email: string, password: string, username: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);

      const user = userCredential.user;
      const userRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userRef, { email: email, username: username });

      this.onUserRegistered.emit(user.uid);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }
}
