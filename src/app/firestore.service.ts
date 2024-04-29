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

   async signUpNewUser(userData: User): Promise<any> {
    try {
      let docRef = await addDoc(collection(this.firestore, 'users'), userData.toJson());
      let docId = docRef.id;
      console.log('Dokumenten ID vom registrierten Benutzer', docId);

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        return docSnap.data();
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Fehler beim Erstellen des Benutzers:", error);
      return null;
    }
  }


}
