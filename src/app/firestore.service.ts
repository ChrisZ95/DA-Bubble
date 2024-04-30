import { Injectable } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { Firestore, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { doc, setDoc, addDoc , collection, getDoc } from "firebase/firestore";
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) { }

  firebaseConfig = {
    apiKey: "AIzaSyD1QIosifbrMmf2Cis-tPblgDMk1JJmgGE",
    authDomain: "dabubble-180.firebaseapp.com",
    databaseURL: "https://dabubble-180-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "dabubble-180",
    storageBucket: "dabubble-180.appspot.com",
    messagingSenderId: "1063885758156",
    appId: "1:1063885758156:web:55d61b46dbc48905ac6c69"
  };

   myFirebaseApp = initializeApp(this.firebaseConfig, "myApp");

   async signUpNewUser(userData: User) {
    let docRef = await addDoc(collection(this.firestore, 'users'), userData.toJson());
    let docId = docRef.id;
    console.log('Dokumenten ID vom registrierten Benutzer', docId);

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      this.getUserByDocId(docId);
    } else {
      console.log("Kein Dokument gefunden");
    }
  }


  async getUserByDocId(docId: string): Promise<User | undefined> {
    const docSnap = await getDoc(doc(this.firestore, 'users', docId));
    if (docSnap.exists()) {
      const userData = docSnap.data();
      console.log('user dokument mit id gefunden',userData)
      return new User({ ...userData, docId });
    } else {
      console.log("Dokument nicht gefunden");
      return undefined;
    }
  }
}
