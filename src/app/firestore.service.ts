import { Injectable, EventEmitter } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { FirebaseApp } from '@angular/fire/app';
import { appConfig } from './app.config';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  public onUserRegistered: EventEmitter<string> = new EventEmitter<string>();
  private auth: any;

  constructor(private myFirebaseApp: FirebaseApp) {
    this.auth = getAuth(myFirebaseApp);

    this.createUserWithEmailAndPassword('teeeeeeest@email.com', 'password123');
  }

  getAuth(): any {
    return this.auth;
  }

  createUserWithEmailAndPassword(email: string, password: string): void {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        this.onUserRegistered.emit(user.uid);
      })
      .catch((error) => {
        console.error('Error creating user:', error);
      });
  }
}
