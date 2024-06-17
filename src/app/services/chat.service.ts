import { Injectable } from '@angular/core';
import {
  Firestore,
  getFirestore,
  onSnapshot,
  DocumentData,
  collectionData,
  docData,
} from '@angular/fire/firestore';
import {
  doc,
  setDoc,
  addDoc,
  collection,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { ChannelService } from './channel.service';
import { FirestoreService } from '../firestore.service';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  map,
  of,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private userInformationSubject = new BehaviorSubject<any>(null);
  userInformation$: Observable<any> = this.userInformationSubject.asObservable();

  private messagesSubject = new BehaviorSubject<any[]>([]);
  public messages$: Observable<any[]> = this.messagesSubject.asObservable();

  private filteredUsersSubject: BehaviorSubject<any[]> = new BehaviorSubject<any>(null);
  public filteredUsers$: Observable<any> = this.filteredUsersSubject.asObservable();

  private documentIDSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public documentID$: Observable<any> = this.documentIDSubject.asObservable();

  private emojiPickerSubjectChat = new BehaviorSubject<boolean>(false);
  emojiPickerChat$ = this.emojiPickerSubjectChat.asObservable();

  private emojiPickerSubjectChatReaction = new BehaviorSubject<boolean>(false);
  emojiPickerChatReaction$ = this.emojiPickerSubjectChatReaction.asObservable();

  private emojiPickerSubjectThread = new BehaviorSubject<boolean>(false);
  emojiPickerThread$ = this.emojiPickerSubjectThread.asObservable();

  private AssociatedUserSubject = new BehaviorSubject<boolean>(false);
  associatedUser$ = this.AssociatedUserSubject.asObservable();

  private clearTextEditorValueSubcription = new BehaviorSubject<boolean>(false);
  clearValue$ = this.clearTextEditorValueSubcription.asObservable();

  private chatDataSubject = new BehaviorSubject<DocumentData | null>(null);
  chatData$ = this.chatDataSubject.asObservable();

  showEmptyChat: boolean = false;
  editMessage: boolean = false;
  focusOnTextEditor: boolean = false;
  showOwnChat: boolean = true;
  allUsers: any;
  filteredUsers: any;
  dataURL: any;
  currentuid: any;
  existingParticipants: any[] = [];
  usersArray: any[] = [];
  chatList: any = [];
  messages: any[] = [];
  participants: any = [];
  userInformation: any[] = [];
  allPotentialChatUsers: any[] = [];
  loadedchatInformation: any = {};
  chatDocId: string | null = null;
  loadCount: number = 0;
  editIndex: number = -1;

  constructor(
    private firestore: Firestore,
    public channelService: ChannelService,
    public FirestoreService: FirestoreService
  ) {
    this.initializeService();
  }

  async checkForExistingChats() {
    const currentUserID: string | null = localStorage.getItem('uid');
    if (!currentUserID) {
      console.log('CurrentUserId ist undefined | null');
      return;
    }

    const usersCollection = collection(this.firestore, 'users');
    const chatsCollection = collection(this.firestore, 'newchats');

    const [querySnapshot, existingChats] = await Promise.all([
      getDocs(usersCollection),
      getDocs(chatsCollection),
    ]);

    // Es wird ein Array erstellt in dem alle anderen User drin sind (nicht der eingeloggte Account)
    const usersArray: string[] = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (
        typeof userData['uid'] === 'string' &&
        userData['uid'] !== currentUserID
      ) {
        usersArray.push(userData['uid']);
      }
    });

    // Die Firestore sammlung newchats durchsuchen um zu prüfen ob bereits ein Chat vorhanden ist
    const existingChatsSet = new Set<string>();
    existingChats.forEach((doc) => {
      const chatData = doc.data();
      const participants = chatData['participants'] as string[];
      if (participants.includes(currentUserID)) {
        participants.forEach((participant) => {
          if (participant !== currentUserID) {
            existingChatsSet.add(participant);
          }
        });
      }
    });

    // Überprüfen, ob es für jeden Benutzer im usersArray bereits einen Chat gibt
    usersArray.forEach((userID) => {
      if (existingChatsSet.has(userID)) {
        // console.log(`Einzelchat zwischen ${currentUserID} und ${userID} existiert bereits.`);
      } else {
        // console.log(`Kein Einzelchat zwischen ${currentUserID} und ${userID} gefunden.`);
        this.createChats(currentUserID, userID);
      }
    });
  }

  async createChats(currentUserID: string, otherUserID: string) {
    try {
      const timestamp = this.FirestoreService.createTimeStamp();
      const newDocRef = doc(collection(this.firestore, 'newchats'));
      const chatData = {
        participants: [currentUserID, otherUserID],
        createdAt: timestamp,
      };
      await setDoc(newDocRef, chatData);
    } catch (error: any) {
      console.error('Fehler beim Erstellen des Chats:', error);
    }
  }

  async searchPrivateChat(userDetails: any) {
    const currentUserID = localStorage.getItem('uid');

    if (userDetails.uid === currentUserID) {
      const querySnapshot = await getDocs(
        query(
          collection(this.firestore, 'newchats'),
          where('participants', '==', [currentUserID])
        )
      );

      querySnapshot.forEach((doc) => {
        const chatData = doc.data();
        const usersInChat = chatData['participants'];
        this.loadChatWithUser(doc.id);
        this.filteredUsersSubject.next(usersInChat);
        this.documentIDSubject.next(doc.id);
      });
    } else {
      console.log('Die IDs sind nicht gleich');
    }
  }

  async searchChatWithUser(userDetails: any) {
    const querySnapshot = await getDocs(collection(this.firestore, 'newchats'));
    const chatsWithBothUsers: any = [];
    let chatDocID: string | undefined;
    querySnapshot.forEach((doc) => {
      const chatData = doc.data();
      const usersInChat = chatData['participants'];
      if (
        usersInChat.includes(this.currentuid) &&
        usersInChat.includes(userDetails)
      ) {
        chatsWithBothUsers.push({ id: doc.id, ...chatData });
        chatDocID = chatsWithBothUsers[0].id;
        this.filteredUsersSubject.next(usersInChat);
        this.documentIDSubject.next(doc.id);
      }
    });
    this.loadChatWithUser(chatDocID);
    return chatDocID;
  }

  async loadChatWithUser(chatDocID: any) {
    const docRef = doc(this.firestore, 'newchats', chatDocID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      this.chatDataSubject.next(docSnap.data());
    } else {
      this.chatDataSubject.next(null);
    }
  }

  async sendMessageToDatabase(imageFile: any, message: any, currentDocID: any) {
    const timestamp = this.FirestoreService.createTimeStamp();
    const currentuserID = localStorage.getItem('uid');
    const currentUserData = await this.loadUserDataFromDatabase(currentuserID);
    if (!currentUserData) {
      console.error('Fehler: Benutzer konnte nicht geladen werden.');
      return;
    }

    try {
      const newThread = {
        createdAt: timestamp,
        createdBy: currentuserID,
        participants: [currentuserID],
      };
      const threadDocRef = await addDoc(collection(this.firestore, 'threads'), newThread);
      const threadCollectionRef = collection(this.firestore, `threads/${threadDocRef.id}/messages`);
      const threadMessage = {
      message: message,
      image: imageFile,
      createdAt: timestamp,
      senderName: currentUserData.username,
      senderID: currentUserData.uid,
    };
    await addDoc(threadCollectionRef, threadMessage);
      const messagesCollectionRef = collection(this.firestore, `newchats/${currentDocID}/messages`);
      const newMessage = {
        message: message,
        image: imageFile,
        createdAt: timestamp,
        senderName: currentUserData.username,
        senderID: currentUserData.uid,
        threadID: threadDocRef.id,
      };
      await addDoc(messagesCollectionRef, newMessage);

    } catch (error) {
      console.error('Fehler beim Speichern der Nachricht:', error);
    }
  }


  async loadUserDataFromDatabase(userID: any) {
    const docRef = doc(this.firestore, 'users', userID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const userDetails = {
        username: userData['username'],
        email: userData['email'],
        photo: userData['photo'],
        uid: userData['uid'],
        signUpdate: userData['signUpdate'],
        logIndate: userData['logIndate'],
        logOutDate: userData['logOutDate'],
      };
      return userDetails;
    } else {
      console.log('No such document!');
      return null;
    }
  }

  emojiPickerChat(state: boolean) {
    console.log('normal picker')
    this.emojiPickerSubjectChat.next(state);
  }

  emojiPickerChatReaction(state: boolean) {
    console.log('normal picker')
    this.emojiPickerSubjectChatReaction.next(state);
  }

  emojiPickerThread(state: boolean) {
    console.log('thread picker')
    this.emojiPickerSubjectThread.next(state);
  }

  associatedUser(state: boolean) {
    this.AssociatedUserSubject.next(state);
  }

  clearInputValue(state: boolean) {
    this.clearTextEditorValueSubcription.next(state);
  }

  async initializeService() {
    this.currentuid = await this.getCurrentUid();
    if (!this.currentuid) {
      console.error('Currentuid nicht gefunden');
    }
  }

  async getCurrentUid(): Promise<string | null> {
    return new Promise((resolve) => {
      const checkUid = () => {
        const uid = this.FirestoreService.currentuid;
        if (uid) {
          resolve(uid);
        } else {
          setTimeout(checkUid, 100);
        }
      };
      checkUid();
    });
  }

  db = getFirestore();
  chatsCollection = collection(this.db, 'chats');
  usersCollection = collection(this.db, 'users');

  async getChatsDocumentIDs(collectionName: string) {
    const docRef = collection(this.db, collectionName);
    const docSnap = await getDocs(docRef);
    return docSnap.docs.map((doc) => doc.id);
  }

  loadUserData(userDetails: any) {
    this.userInformationSubject.next(userDetails);
  }

  async loadUser() {
    let allUsers = await this.FirestoreService.getAllUsers().then(
      (user: any) => {
        return user;
      }
    );
    this.allUsers = allUsers;
    return allUsers;
  }

  getCombinedChatId(uid1: string, uid2: string): string {
    let slicedUid1 = uid1.slice(0, 5);
    let slicedUid2 = uid2.slice(0, 5);
    return [slicedUid1, slicedUid2].sort().join('-');
  }

  async getUserChatDocuments(currentuid: string): Promise<string[]> {
    const chatsRef = collection(this.firestore, 'chats');
    const querySnapshot = await getDocs(chatsRef);
    const chatDocIds: string[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data['participants'] && data['participants'].includes(currentuid)) {
        chatDocIds.push(doc.id);
      }
    });

    return chatDocIds;
  }
}
