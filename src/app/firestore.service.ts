import { Injectable } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { Firestore, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';

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

}
