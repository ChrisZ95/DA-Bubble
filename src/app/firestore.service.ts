import { Injectable, EventEmitter } from '@angular/core';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  updatePassword,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { FirebaseApp } from '@angular/fire/app';
import { getFirestore, doc, setDoc, collection, getDocs, getDoc } from '@angular/fire/firestore';
import { getStorage, provideStorage, ref } from '@angular/fire/storage';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  currentUser!: any;
  public onUserRegistered: EventEmitter<string> = new EventEmitter<string>();
  public auth: any;
  public firestore: any;

  constructor(private myFirebaseApp: FirebaseApp) {
    this.auth = getAuth(myFirebaseApp);
    this.auth.languageCode = 'de';
    this.firestore = getFirestore(myFirebaseApp);
    const provider = new GoogleAuthProvider();
    // const storage = getStorage();
    // const storageRef = ref(storage);
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

  observeAuthState(): void {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        // User ist angemeldet
        console.log('User is signed in:', user.uid);
      } else {
        // User ist abgemeldet
        console.log('User is signed out');
      }
    });
  }


  async signUpUser(email: string, password: string, username: string, privacyPolice: boolean): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;
      const userRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userRef, { email: email, username: username , privacyPolice: true});
      this.onUserRegistered.emit(user.uid);
      this.sendEmailAfterSignUp(user);
    }
    catch (error) {
      console.error('Error creating user:', error);
    }
  }

  async logInUser(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      console.log('User log in erfolgreich');
      this.observeAuthState();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  }

  async signInWithPopup(auth:any, provider:any): Promise<void> {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential !== null) {
        const token = credential.accessToken;
        const user = result.user;
      } else {
        console.error('Credential is null');
      }
    } catch (error:any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
    }
  }

  async sendEmailAfterSignUp(user: any): Promise<void> {
    try {
      await sendEmailVerification(user);
      console.log('E-Mail zur Verifizierung gesendet');
    } catch (error) {
      console.error('Fehler beim Senden der Verifizierungs-E-Mail:', error);
    }
  }

  async sendEmailResetPasswort(auth:any, email:any) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch(error) {
      console.error('Fehler beim senden der Email zum reseten des passworts')
    }
  }

  sortArray(array: any[]) {
    return array.sort(function (x: any, y: any) {
      const dateX = new Date(x.date).getTime();
      const dateY = new Date(y.date).getTime();
      const timeX = new Date(x.time).getTime();
      const timeY = new Date(y.time).getTime();

      if (dateX === dateY) {
        return timeX - timeY;
      } else {
        return dateX - dateY;
      }
    });
  }

}
