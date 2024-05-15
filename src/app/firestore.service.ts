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
  signOut
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
  QueryDocumentSnapshot,
} from '@angular/fire/firestore';
import {
  getStorage,
  provideStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from '@angular/fire/storage';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';
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
  public newDate: any;
  public signUpDate: any;
  currentuid: any;
  storageId: any;
  signInuid: any;


  constructor(private myFirebaseApp: FirebaseApp, public router: Router) {
    this.auth = getAuth(myFirebaseApp);
    this.auth.languageCode = 'de';
    this.firestore = getFirestore(myFirebaseApp);
    const provider = new GoogleAuthProvider();
    this.currentuid = localStorage.getItem('uid');
  }

  currentAuth() {
    return this.auth;
  }

  logOut() {
    debugger
    signOut(this.auth) // Beendet die aktuelle Authentifizierungssitzung
      .then(() => {
        localStorage.clear(); // Löscht alle im localStorage gespeicherten Daten
        this.router.navigate(['']); // Navigiert zur Startseite
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  }


  /* Name des Users für die sign-up-choose-avatar.component*/
  async getUserName(uid: any) {
    const userData = doc(this.firestore, 'users', uid);
    try {
      const docSnap = await getDoc(userData);

      if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log('Der Name lautet:', userData['username']);
          return userData['username'];
      } else {
          console.log('Benutzerdokument nicht gefunden für UID:', uid);
      }
  } catch (error) {
      console.error('Fehler beim Abrufen des Benutzerdokuments:', error);
  }
  }

  /* Speichert die uid  beim signup (function signUpUser)*/
  setuid(uid: string) {
    this.signInuid = uid;
    console.log(this.signInuid)
  }

  /* Gibt die in setuid gespeicherte uid zurück */
  getUid(): string {
    return this.signInuid;
  }

  /* ? */
  getStorageUserIconRef() {
    return this.storageUserIcon;
  }

  /* Wird in der  sign-up-choose-avatar.component aufgerufen und speichert die URL des icons in der Datenbank*/
  async uploadUserIconIntoDatabase(uid: string, userIconTokenURL: string): Promise<void> {
    console.log(uid)
    console.log(userIconTokenURL)
    try {
      const userRef = doc(this.firestore, 'users', uid);
      await updateDoc(userRef, {
        photo: userIconTokenURL,
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Benutzerdokuments:', error);
    }
  }

  async downloadUserIcon(uid: any) {
    const userData = doc(this.firestore, 'users', uid);
    try {
      const docSnap = await getDoc(userData);

      if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log('Die URL des Bildes lautet:', userData['photo']);
          return userData['photo'];
      } else {
          console.log('Benutzerdokument nicht gefunden für UID:', uid);
      }
  } catch (error) {
      console.error('Fehler beim Abrufen des Benutzerdokuments:', error);
  }
  }

  /* Speichert das Bild im Storage Ordner user-icon/ */
  async uploadUserIconIntoStorage(userId: any, file: any) {
    const storage = getStorage();
    const storageRef = ref(storage, 'user-icon/' + file.name);
    await uploadBytes(storageRef, file);
    const token = await getDownloadURL(storageRef);
    console.log('Die URL zum Bild lautet',token)
    console.log('User icon uploaded and access token saved.');
    return token;
  }

  async uploadDataIntoStorage(file: any){
    const storage = getStorage();
    const storageRef = ref(storage, 'testData/' + file.name);
    await uploadBytes(storageRef, file);
    const token = await getDownloadURL(storageRef);
    return token;
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

  /* Alle Channels werden ausgegeben */
  async getAllChannels(): Promise<Channel[]> {
    try {
      const channelsCollection = collection(this.firestore, 'channels');
      const channelsSnapshot = await getDocs(channelsCollection);
      const channels: Channel[] = channelsSnapshot.docs.map(
        (doc) => doc.data() as Channel
      );
      return channels;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /* Überwacht den Status des Users (Angemeldet / Abgemeldet) */
  observeAuthState(): void {
    onAuthStateChanged(this.auth, (user) => {
      console.log('Der aktuelle user',user)
      console.log(this.auth)
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

  /* Regristiert neue Nutzer */
  async signUpUser(
    email: string,
    password: string,
    username: string,
    privacyPolice: boolean,
    signUpdate: string
  ): Promise<string | null> {
    debugger
    const auth = getAuth(this.myFirebaseApp);
    console.log(this.auth)
    console.log(auth)
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
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
        signUpdate: signUpdate,
      });

      this.setuid(user.uid);
      return 'auth';
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (
        error.code === 'auth/invalid-recipient-email' ||
        error.code === 'auth/invalid-email'
      ) {
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



  /* Nutzer wird eingeloggt */
  async logInUser(
    email: string,
    password: string,
    logIndate: string
  ): Promise<string | null> {
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

  /* FUNKTIONIERT AKTUELL NICHT! SignUp / LogIn mit Apple*/
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

  /* SignUp / LogIn mit Google */
  async signInWithGoogle(
    auth: any,
    provider: any,
    logInDate: string
  ): Promise<void> {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential !== null) {
        const token = credential.accessToken;
        const user = result.user;
        this.observeAuthState();
        console.log(user);
        console.log('Google login user name:', user.displayName);
        console.log('Google login user email:', user.email);
        console.log('Google login user photo:', user.photoURL);
        console.log('Google login user uid:', user.uid);
        console.log(
          'Google user wurde erstellt am',
          user.metadata.creationTime
        );
        console.log(
          'Google user wurde zuletzt gesehen am',
          user.metadata.lastSignInTime
        );
        console.log('Google login user handy nummer', user.phoneNumber);
        const userRef = doc(this.firestore, 'users', user.uid);
        const signUpDate = user.metadata.creationTime
          ? new Date(user.metadata.creationTime)
          : new Date();
        const signUpDateUnixTimestamp = signUpDate.getTime();
        await setDoc(userRef, {
          email: user.email,
          username: user.displayName,
          privacyPolice: true,
          uid: user.uid,
          photo: user.photoURL,
          logInDate: logInDate,
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

  /* AKTUELL NICHT IN GEBRAUCH / verschickt nach dem sign up eine email an den User */
  // async sendEmailAfterSignUp(user: any): Promise<void> {
  //   try {
  //     await sendEmailVerification(user);
  //     console.log('E-Mail zur Verifizierung gesendet');
  //   } catch (error) {
  //     console.error('Fehler beim Senden der Verifizierungs-E-Mail:', error);
  //   }
  // }

  /* Verschickt eine email an den user zum Passwort ändern */
  async sendEmailResetPasswort(emailData: {
    email: string;
    uid: any;
  }): Promise<void> {
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
      console.error(
        'Fehler beim Senden der E-Mail zum Zurücksetzen des Passworts:',
        error
      );
    }
  }

  /* Funktionalität um das Passwort zu ändern */
  async changePassword(userId: any, newPassword: string): Promise<void> {
    console.log(userId, newPassword);
    try {
      await updatePassword(this.auth.currentUser, newPassword);
      this.router.navigate(['']);
      console.log('Passwort erfolgreich aktualisiert');
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Passworts:', error);
      throw error;
    }
  }

  /* Erstellt einen Timestamp , wird beim login / signup benutzt */
  createTimeStamp(): Promise<string> {
    this.newDate = Date.now();
    console.log(this.newDate);
    return this.newDate;
  }
}
