import { Injectable, EventEmitter, OnInit } from '@angular/core';
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
  updateDoc,
  where,
  QueryDocumentSnapshot
} from '@angular/fire/firestore';
import { getStorage, provideStorage, ref, uploadBytes } from '@angular/fire/storage';
import { User } from '../models/user.class';
import { Router } from '@angular/router';
import { log } from 'console';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService{
  public onUserRegistered: EventEmitter<string> = new EventEmitter<string>();
  private resetPasswordUserIdSubject = new BehaviorSubject<any>(null);
  resetPasswordUserId$ = this.resetPasswordUserIdSubject.asObservable();


  public auth: any;
  public firestore: any;
  private storageUserIcon: any;
  public newDate: any;
  public signUpDate : any;
  currentuid: any;

  constructor(private myFirebaseApp: FirebaseApp, public router: Router) {
    this.auth = getAuth(myFirebaseApp);
    this.auth.languageCode = 'de';
    this.firestore = getFirestore(myFirebaseApp);
    const provider = new GoogleAuthProvider();
    this.currentuid = localStorage.getItem('uid');
    const storageUserIcon = getStorage();
    const storageUsericonRef = ref(storageUserIcon, 'user-icon')
    const blobParts: BlobPart[] = [];
    const file = new File(blobParts, 'meinBild.jpg', { type: 'image/jpeg' });
    const storage = getStorage(myFirebaseApp);
    this.storageUserIcon = ref(storage, 'user-icon');
  }

  getStorageUserIconRef() {
    return this.storageUserIcon;
  }

  async uploadUserIcon(storageUsericonRef: any, file: any) {
    try {
      await uploadBytes(storageUsericonRef, file);
      console.log('Datei erfolgreich hochgeladen.');
  } catch (error) {
      console.error('Fehler beim Hochladen der Datei:', error);
      throw error;
  }
  }

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
    privacyPolice: boolean,
    signUpdate: string,
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
        signUpdate: signUpdate
      });
      this.onUserRegistered.emit(user.uid);
      // this.sendEmailAfterSignUp(user);
      return 'auth';
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.code === 'auth/invalid-recipient-email' || error.code === 'auth/invalid-email') {
        console.log('Email-Adresse entspricht nicht den gültigen Vorlagen.');
        return 'auth/invalid-recipient-email';
      }
      if (error.code === 'auth/email-already-in-use') {
        console.log('Email-Adresse wird bereits verwendet.');
        return 'auth/email-already-in-use';
      }
      if (error.code === 'auth/weak-password') {
        console.log('Das Passwort ist zu schwach.');
        return 'weak-password';
      } else {
        return null;
      }
     }
  }



  async logInUser(email: string, password: string, logIndate: string): Promise<string | null> {
    try {
        const userCredential = await signInWithEmailAndPassword(
            this.auth,
            email,
            password
        );
        const userRef = doc(this.firestore, 'users', userCredential.user.uid);
        await updateDoc(userRef, {
          logIndate: logIndate,
        });
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
        throw error;
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

  async signInWithGoogle(auth: any, provider: any, logInDate: string): Promise<void> {
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
        const signUpDate = user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date();
        const signUpDateUnixTimestamp = signUpDate.getTime();
      await setDoc(userRef, {
        email:  user.email,
        username: user.displayName,
        privacyPolice: true,
        uid: user.uid,
        photo: user.photoURL,
        logInDate : logInDate,
        signUpdate: signUpDateUnixTimestamp,
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

  // async sendEmailAfterSignUp(user: any): Promise<void> {
  //   try {
  //     await sendEmailVerification(user);
  //     console.log('E-Mail zur Verifizierung gesendet');
  //   } catch (error) {
  //     console.error('Fehler beim Senden der Verifizierungs-E-Mail:', error);
  //   }
  // }

  async sendEmailResetPasswort(emailData: { email: string; uid: any }): Promise<void> {
    try {
        const auth = getAuth();
        const { email, uid } = emailData;
        const actionCodeSettings = {
            url: `http://localhost:4200/ChangePasswort?userId=${uid}&mode=resetPassword`,
            handleCodeInApp: false,
            expiresIn: 60 * 60 * 1,
        };

        await sendPasswordResetEmail(auth, email, actionCodeSettings);
        console.log('E-Mail zum Zurücksetzen des Passworts gesendet');
    } catch (error) {
        console.error('Fehler beim Senden der E-Mail zum Zurücksetzen des Passworts:', error);
    }
}


  async changePassword(userId: any, newPassword: string): Promise<void> {
    debugger
    console.log(userId, newPassword)
    try {
      await updatePassword(this.auth.currentUser, newPassword);
      this.router.navigate(['']);
      console.log('Passwort erfolgreich aktualisiert');
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Passworts:', error);
      throw error;
    }
  }

  createTimeStamp(): Promise<string> {
    this.newDate = Date.now();
    console.log(this.newDate)
    return this.newDate;
  }
}
