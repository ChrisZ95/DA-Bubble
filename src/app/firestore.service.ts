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
  sendPasswordResetEmail,
  OAuthProvider,
  Auth,
} from '@angular/fire/auth';
import { FirebaseApp } from '@angular/fire/app';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  getDoc,
} from '@angular/fire/firestore';
import { getStorage, provideStorage, ref, uploadBytes } from '@angular/fire/storage';
import { User } from '../models/user.class';
import { Router } from '@angular/router';
import { log } from 'console';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  public onUserRegistered: EventEmitter<string> = new EventEmitter<string>();
  private resetPasswordUserIdSubject = new BehaviorSubject<any>(null);
  resetPasswordUserId$ = this.resetPasswordUserIdSubject.asObservable();


  public auth: any;
  public firestore: any;
  private storageUserIcon: any;

  constructor(private myFirebaseApp: FirebaseApp, public router: Router) {
    this.auth = getAuth(myFirebaseApp);
    this.auth.languageCode = 'de';
    this.firestore = getFirestore(myFirebaseApp);
    const provider = new GoogleAuthProvider();
    const storageUserIcon = getStorage();
    const storageUsericonRef = ref(storageUserIcon, 'user-icon')
    this.currentuid = localStorage.getItem('uid');
    // const file = new File([blob] as BlobPart[], 'meinBild.jpg', { type: 'image/jpeg' });

  }

  async uploadUserIcon(storageUsericonRef: any, file: any) {
    try {
      // Datei hochladen
      await uploadBytes(storageUsericonRef, file);
      console.log('Datei erfolgreich hochgeladen.');
  } catch (error) {
      console.error('Fehler beim Hochladen der Datei:', error);
      throw error;
  }
  }

  currentuid: any;

  async getAllUsers(): Promise<User[]> {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const users: User[] = usersSnapshot.docs.map((doc) => doc.data() as User);
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
        localStorage.setItem('logedIn', 'true');
        this.router.navigate(['generalView']);
      } else {
        // User ist abgemeldet
        console.log('User is signed out');
        localStorage.clear();
        this.router.navigate(['']);
      }
    });
  }

  async signUpUser(
    email: string,
    password: string,
    username: string,
    privacyPolice: boolean
  ): Promise<string | null> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;
      const userRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userRef, {
        email: email,
        username: username,
        privacyPolice: true,
        uid: user.uid,
      });
      this.onUserRegistered.emit(user.uid);
      this.sendEmailAfterSignUp(user);
      return null;
    } catch (error: any) {
      console.error('Error creating user:', error);
      // if (error.code === 'auth/invalid-recipient-email' || 'auth/invalid-email') {
      //   console.log('Email-Adresse entspricht nicht den gültigen Vorlagen.');
      //   return 'auth/invalid-recipient-email';
      // }
      // else if (error.code === 'auth/email-already-in-use') {
      //   console.log('Email-Adresse wird bereits verwendet.');
      //   return 'auth/email-already-in-use';
      // }
      //  else if (error.code === 'auth/weak-password') {
      //   console.log('Das Passwort ist zu schwach.');
      //   return 'weak-password';
      // } else {
        return null;
      // }
    }
  }



  async logInUser(email: string, password: string): Promise<string | null> {
    try {
        const userCredential = await signInWithEmailAndPassword(
            this.auth,
            email,
            password
        );
        localStorage.setItem('uid', userCredential.user.uid);
        console.log('User log in erfolgreich');
        this.observeAuthState();
        return null;
    } catch (error: any) {
        console.error('Error signing in:', error);
        if (error.code === 'auth/invalid-credential') {
            console.log('Email-Adresse entspricht nicht den gültigen Vorlagen.');
            return 'auth/invalid-credential';
        }
        // Handle other errors here if needed
        throw error; // Throw the error if it's not handled
    }
}

  async signInWithApple(auth: any, provider: any): Promise<void> {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = OAuthProvider.credentialFromResult(result);
      if (credential !== null) {
        const token = credential.accessToken;
        const user = result.user;
        this.observeAuthState();
      } else {
        console.error('Credential is null');
      }
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = OAuthProvider.credentialFromError(error);
      console.log(errorCode);
    }
  }

  async signInWithGoogle(auth: any, provider: any): Promise<void> {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential !== null) {
        const token = credential.accessToken;
        const user = result.user;
        this.observeAuthState();
        console.log(user)
        console.log('Google login user name:', user.displayName);
        console.log('Google login user email:', user.email);
        console.log('Google login user photo:', user.photoURL);
        console.log('Google login user uid:',user.uid);
        console.log('Google user wurde erstellt am', user.metadata.creationTime)
        console.log('Google user wurde zuletzt gesehen am', user.metadata.lastSignInTime)
        console.log('Google login user handy nummer', user.phoneNumber)
        const userRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userRef, {
        email:  user.email,
        username: user.displayName,
        privacyPolice: true,
        uid: user.uid,
        photo: user.photoURL
      });
      } else {
        console.error('Credential is null');
      }
    } catch (error: any) {
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

  async sendEmailResetPasswort(emailData: {
    email: string;
    uid: any;
  }): Promise<void> {

    try {
      const auth = getAuth();
      const { email, uid } = emailData;
      console.log('email zum resten des Passworts lautet', email);
      console.log('Die ID des Users zum zurücksetzen des Passworts lautet',uid);
      this.resetPasswordUserIdSubject.next(uid);
      await sendPasswordResetEmail(auth, email);
      console.log('E-Mail zum Zurücksetzen des Passworts gesendet');
    } catch (error) {
      console.error(
        'Fehler beim Senden der E-Mail zum Zurücksetzen des Passworts:',
        error
      );
    }
  }

  async changePassword(userId: any, newPassword: string): Promise<void> {
    console.log(userId, newPassword)
    try {
      await updatePassword(this.auth.currentUser, newPassword);
      console.log('Passwort erfolgreich aktualisiert');
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Passworts:', error);
      throw error;
    }
  }

}
