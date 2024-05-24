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
  signOut,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  verifyBeforeUpdateEmail,
  deleteUser,
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
  deleteField,
  deleteDoc,
} from '@angular/fire/firestore';
import {
  getStorage,
  provideStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
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
  logInUid: any;


  constructor(private myFirebaseApp: FirebaseApp, public router: Router) {
    this.auth = getAuth(myFirebaseApp);
    console.log('Auth dokument',this.auth)
    this.auth.languageCode = 'de';
    this.firestore = getFirestore(myFirebaseApp);
    const provider = new GoogleAuthProvider();
    this.currentuid = localStorage.getItem('uid');
    console.log('ausgeloggte uid',this.currentuid)
    this.initializeAuthState()
  }

  initializeAuthState() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.currentuid = user.uid;
        localStorage.setItem('uid', this.currentuid);
      } else {
        localStorage.removeItem('uid');
      }
    });
  }

  getCurrentAuth() {
    const auth = getAuth();
    const user: any = auth.currentUser;
    return user;
  }

  async deleteAccount(uid: any): Promise<string> {
   try {
    const auth = getAuth();
    const user: any = auth.currentUser;
    await deleteUser(user)
    if(auth) {
      await deleteDoc(doc(this.firestore, "users", uid))
    }
    localStorage.clear;
    localStorage.setItem('userDelete', 'true');
    return 'auth/correct';
   } catch(error: any) {
    console.error('Fehler beim löschen des Accounts', error);
    if(error.code === 'auth/requires-recent-login') {
      return 'auth/requires-recent-login'
    }
    return 'auth/false';
   }
  }

  async deleteUserIcon(currentUserIcon: string, currentUserId: string) {
    debugger
    console.log(currentUserIcon)
    if(currentUserIcon === 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(0).png?alt=media&token=084e1046-d86a-492a-9d3a-d067185b78b3'
     || 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(1).png?alt=media&token=d4ce52b2-3bc9-48fd-9021-912002d298ee'
     || 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(2).png?alt=media&token=e8f80f22-1fef-49ad-91a1-818223fb0d69'
     || 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(3).png?alt=media&token=41950865-ed8c-4797-bf85-942d72833899'
     || 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(4).png?alt=media&token=84f4dfc3-08ba-469e-8792-783b1a504d4b'
     || 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(5).png?alt=media&token=3acc0648-eff2-422a-80c6-a0400a7c0351') {
    } else {
      const storage = getStorage();
      const desertRef = ref(storage, currentUserIcon);
      const userDocRef = doc(this.firestore, 'users', currentUserId);

    try {
      await deleteObject(desertRef);
      await updateDoc(userDocRef, {
        photo: deleteField()
      });
    } catch (error: any) {
      console.log('Fehler beim Löschen des Benutzericons', error);
    }
    }
  }


  async changeName(uid: string, name: string): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      await updateDoc(userDocRef, { username: name });
      console.log('Name erfolgreich geändert');
    } catch (error) {
      console.error('Fehler beim Ändern des Namens: ', error);
    }
  }

  async updateEmail(newMail: string, uid: string): Promise<string> {
    const auth = getAuth();
    try {
        const user = auth.currentUser;
        const allUsers = await this.getAllUsers(); // Stellen Sie sicher, dass getAllUsers() ein Promise zurückgibt
        console.log(allUsers);

        // Prüfen, ob die neue E-Mail-Adresse bereits vergeben ist
        const emailExists = allUsers.some((user: any) => user.email === newMail);
        if (emailExists) {
            console.error('Die E-Mail-Adresse ist bereits vergeben');
            return 'auth/email-already-in-use';
        }

        if (user) {
            console.log(user);
            await verifyBeforeUpdateEmail(user, newMail);
            const userDocRef = doc(this.firestore, 'users', uid);
            await updateDoc(userDocRef, { email: newMail });
            localStorage.setItem('resetEmail', 'true');
            this.router.navigate(['']);
            return 'auth/correct';
        } else {
            console.error('Es ist kein Benutzer angemeldet');
            return 'auth/false';
        }
    } catch (error: any) {
        console.error('Fehler beim Aktualisieren der E-Mail', error);
        if (error.code === 'auth/requires-recent-login') {
            return 'auth/requires-recent-login';
        }
    }
    return 'auth/false';
}

  async getUserEmail(userId: any) {
    try {
        const userDocRef = doc(this.firestore, "users", userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const userEmail = docSnap.data()['email'];
            return userEmail;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
    }
}

  async sendVerificationEmail(user: any): Promise<void> {
    try {
      if (user) {
        await sendEmailVerification(user);
        console.log('Verifizierungs-E-Mail an neue Adresse gesendet');
        alert('Bitte verifizieren Sie Ihre neue E-Mail-Adresse. Überprüfen Sie Ihren Posteingang und klicken Sie auf den Verifizierungslink.');
      } else {
        console.error('Kein angemeldeter Benutzer gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Senden der Verifizierungs-E-Mail: ', error);
    }
  }

  currentAuth() {
    return this.auth;
  }

  getAllVariables() {
    return {
      onUserRegistered: this.onUserRegistered,
      resetPasswordUserId$: this.resetPasswordUserId$,
      auth: this.auth,
      firestore: this.firestore,
      storageUserIcon: this.storageUserIcon,
      newDate: this.newDate,
      signUpDate: this.signUpDate,
      currentuid: this.currentuid,
      storageId: this.storageId,
      signInuid: this.signInuid,
    };
  }

  logOut() {
    signOut(this.auth)
      .then(() => {
        localStorage.clear();
        this.router.navigate(['']);
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  }

  logOutAfterDeleteAccount() {
    signOut(this.auth)
      .then(() => {
        localStorage.setItem('userDelete', 'true');
        this.router.navigate(['']);
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  }


  /* Dokument des Users */
  async getUserData(uid: any): Promise<any | null> {
    const userData = doc(this.firestore, 'users', uid);
    try {
      const docSnap = await getDoc(userData);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log('Komplettes user formular', userData);
        console.log('Der Name lautet:', userData['username']);
        return userData;
      } else {
        console.log('Benutzerdokument nicht gefunden für UID:', uid);
        return null;
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzerdokuments:', error);
      throw error;
    }
  }


  setCurrentUid(uid: string) {
    this.currentuid = uid;
    localStorage.setItem('uid', uid);
  }

  async getCurrentUid(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (user) {
      this.currentuid = user.uid;
      localStorage.setItem('uid', this.currentuid);
      return this.currentuid;
    } else {
      this.currentuid = localStorage.getItem('uid');
      return this.currentuid;
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
      console.log(usersCollection)
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
      console.log('Die User id zum sign up lautet',user.uid)
      await setDoc(userRef, {
        email: email,
        username: username,
        privacyPolice: true,
        uid: user.uid,
        signUpdate: signUpdate,
        password: password,
      });

      this.setuid(user.uid);
      this.sendEmailAfterSignUp(user)
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
      if(!this.auth.currentUser.emailVerified) {
        return 'auth/email-not-verified'
      }
      const userRef = doc(this.firestore, 'users', userCredential.user.uid);
      await updateDoc(userRef, {
        logIndate: logIndate,
      });
      this.setCurrentUid(userCredential.user.uid);
      localStorage.setItem('uid', userCredential.user.uid);
      console.log('User log in erfolgreich');
      this.observeAuthState();
      this.router.navigate(['generalView']);
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
        this.router.navigate(['generalView']);
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
        await this.setCurrentUid(user.uid);
        await localStorage.setItem('uid', user.uid);
        this.router.navigate(['generalView']);
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
  async sendEmailAfterSignUp(user: any): Promise<void> {
    try {
      await sendEmailVerification(user);
      console.log('E-Mail zur Verifizierung gesendet');
    } catch (error) {
      console.error('Fehler beim Senden der Verifizierungs-E-Mail:', error);
    }
  }

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


