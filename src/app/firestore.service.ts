import { Injectable, EventEmitter } from '@angular/core';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { FirebaseApp } from '@angular/fire/app';
import { getFirestore, doc, setDoc, collection, getDocs, getDoc } from '@angular/fire/firestore';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  public onUserRegistered: EventEmitter<string> = new EventEmitter<string>();
  public auth: any;
  public firestore: any;

  constructor(private myFirebaseApp: FirebaseApp) {
    this.auth = getAuth(myFirebaseApp);
    this.firestore = getFirestore(myFirebaseApp);
  }

  private observeAuthState(): void {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        // User ist angemeldet
        console.log('User is signed in:', user.uid);
        // Hier können Sie weitere Aktionen für angemeldete Benutzer ausführen
      } else {
        // User ist abgemeldet
        console.log('User is signed out');
      }
    });
  }

  async getAllUsers(): Promise<User[]> {
    try {
        const usersCollection = collection(this.firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const users: User[] = [];
        usersSnapshot.forEach((doc) => {
            users.push(doc.data() as User);
        });
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

  async createUserWithEmailAndPassword(
    email: string,
    password: string,
    username: string
  ): Promise<void> {
    try {
      debugger;
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;
      const userRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userRef, { email: email, username: username });
      this.onUserRegistered.emit(user.uid);
    }  catch (error) {
      console.error('Error creating user:', error);
    }
  }



  async signInWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      console.log('User log in erfolgreich');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  }
}
