import { Injectable } from '@angular/core';
import { Firestore, getFirestore, DocumentData } from '@angular/fire/firestore';
import { doc, setDoc, addDoc, collection, getDoc, getDocs, query, where } from 'firebase/firestore';
import { ChannelService } from './channel.service';
import { FirestoreService } from '../firestore.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private firestore: Firestore, public channelService: ChannelService, public FirestoreService: FirestoreService) {
    this.initializeService();
  }

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

  private emojiPickerSubjectThreadReaction = new BehaviorSubject<boolean>(false);
  emojiPickerThreadRection$ = this.emojiPickerSubjectThreadReaction.asObservable();

  private emojiPickerSubjectChannel = new BehaviorSubject<boolean>(false);
  emojiPickerChannel$ = this.emojiPickerSubjectChannel.asObservable();

  private emojiPickerSubjectChannelReaction = new BehaviorSubject<boolean>(false);
  emojiPickerChannelReaction$ = this.emojiPickerSubjectChannelReaction.asObservable();

  private AssociatedUserSubjectChat = new BehaviorSubject<boolean>(false);
  associatedUserChat$ = this.AssociatedUserSubjectChat.asObservable();

  private AssociatedUserSubjectChatThread = new BehaviorSubject<boolean>(false);
  associatedUserChatThread$ = this.AssociatedUserSubjectChatThread.asObservable();

  private clearTextEditorValueSubcription = new BehaviorSubject<boolean>(false);
  clearValue$ = this.clearTextEditorValueSubcription.asObservable();

  private chatDataSubject = new BehaviorSubject<DocumentData | null>(null);
  chatData$ = this.chatDataSubject.asObservable();

  showEmptyChat: boolean = true;
  editMessage: boolean = false;
  focusOnTextEditor: boolean = false;
  showOwnChat: boolean = false;
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
  currentChatParticipants: any = '';
  otherParticipant: any;
  lastOpenedChat: any;

  async checkForExistingChats() {
    const currentUserID: string | null = localStorage.getItem('uid');
    if (!currentUserID) {
      return;
    }

    const usersCollection = collection(this.firestore, 'users');
    const chatsCollection = collection(this.firestore, 'newchats');

    const [querySnapshot, existingChats] = await Promise.all([getDocs(usersCollection), getDocs(chatsCollection)]);

    const usersArray: string[] = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (typeof userData['uid'] === 'string' && userData['uid'] !== currentUserID) {
        usersArray.push(userData['uid']);
      }
    });

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

    usersArray.forEach((userID) => {
      if (existingChatsSet.has(userID)) {
      } else {
        this.createChats(currentUserID, userID);
      }
    });
  }

  async createChats(currentUserID: string, otherUserID: string) {
    try {
      const timestamp = this.FirestoreService.createTimeStamp();
      const newDocRef = doc(collection(this.firestore, 'newchats'));
      const chatData = { participants: [currentUserID, otherUserID], createdAt: timestamp };
      await setDoc(newDocRef, chatData);
    } catch (error: any) {
    }
  }

  async searchPrivateChat(userDetails: any) {
    const currentUserID = localStorage.getItem('uid');

    if (userDetails.uid === currentUserID) {
      const querySnapshot = await getDocs(query(collection(this.firestore, 'newchats'), where('participants', '==', [currentUserID])));

      querySnapshot.forEach((doc) => {
        const chatData = doc.data();
        const usersInChat = chatData['participants'];
        this.loadChatWithUser(doc.id);
        this.filteredUsersSubject.next(usersInChat);
        this.documentIDSubject.next(doc.id);
      });
    } else {
    }
    this.checkAndSetParticipants(userDetails);
  }

  allChats: any[] = [];
  async loadAllChats() {
    try {
      const chatCollection = collection(this.firestore, 'newchats');
      const querySnapshot = await getDocs(chatCollection);

      const chats = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const chatData = { id: doc.id, ...(doc.data() as any) };
        const messagesCollection = collection(this.firestore, 'newchats', doc.id, 'messages');
        const messagesSnapshot = await getDocs(messagesCollection);

        return { ...chatData, hasMessages: !messagesSnapshot.empty };
      }));

      this.allChats = chats.filter((chat) => (chat.participants as any[]).includes(this.FirestoreService.currentuid));
    } catch (error) {
    }
  }
participantID:any;
  async checkAndSetParticipants(input: any) {
    this.participantID = input
    this.currentChatParticipants = '';
    try {
      let filteredChats: any[] = [];
      if (typeof input === 'object' && input !== null) {
        filteredChats = this.allChats.filter((chat) => chat.participants && chat.participants.length === 1 && chat.participants.includes(input.uid));
      } else if (typeof input === 'string') {
        const currentUserUid = this.FirestoreService.currentuid;
        filteredChats = this.allChats.filter((chat) => chat.participants && chat.participants.length === 2 && chat.participants.includes(input) && chat.participants.includes(currentUserUid));
        this.otherParticipant = this.FirestoreService.allUsers.filter((user: any) => { return user.uid == input; });
      } else {
        throw new Error('Invalid input');
      }
      for (const chat of filteredChats) {
        if (!chat.hasMessages) {
          if (typeof input === 'object' && input !== null) {
            this.currentChatParticipants = 1;
          } else if (typeof input === 'string') {
            this.currentChatParticipants = 2;
          }
        } else {
          this.currentChatParticipants = 0;
        }
      }
    } catch (error) {
    }
  }

  async searchChatWithUser(userDetails: any) {
    const querySnapshot = await getDocs(collection(this.firestore, 'newchats'));
    const chatsWithBothUsers: any = [];
    let chatDocID: string | undefined;
    querySnapshot.forEach((doc) => {
      const chatData = doc.data();
      const usersInChat = chatData['participants'];
      if (usersInChat.includes(this.currentuid) && usersInChat.includes(userDetails)) {
        chatsWithBothUsers.push({ id: doc.id, ...chatData });
        chatDocID = chatsWithBothUsers[0].id;
        this.filteredUsersSubject.next(usersInChat);
        this.documentIDSubject.next(doc.id);
      }
    });
    this.loadChatWithUser(chatDocID);
    this.checkAndSetParticipants(userDetails);
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
      const threadMessage = { message: message, image: imageFile, createdAt: timestamp, senderName: currentUserData.username, senderID: currentUserData.uid };
      await addDoc(threadCollectionRef, threadMessage);
      const messagesCollectionRef = collection(this.firestore, `newchats/${currentDocID}/messages`);
      const newMessage = { message: message, image: imageFile, createdAt: timestamp, senderName: currentUserData.username, senderID: currentUserData.uid, threadID: threadDocRef.id };
      await addDoc(messagesCollectionRef, newMessage);
    } catch (error) {
    }
  }

  async loadUserDataFromDatabase(userID: any) {
    const docRef = doc(this.firestore, 'users', userID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const userDetails = { username: userData['username'], email: userData['email'], photo: userData['photo'], uid: userData['uid'], signUpdate: userData['signUpdate'], logIndate: userData['logIndate'], logOutDate: userData['logOutDate'] };
      return userDetails;
    } else {
      return null;
    }
  }

  emojiPickerChat(state: boolean) {
    this.emojiPickerSubjectChat.next(state);
  }

  emojiPickerChatReaction(state: boolean) {
    this.emojiPickerSubjectChatReaction.next(state);
  }

  emojiPickerThread(state: boolean) {
    this.emojiPickerSubjectThread.next(state);
  }

  emojiPickerThreadReaction(state: boolean) {
    this.emojiPickerSubjectThreadReaction.next(state);
  }

  emojiPickerChannel(state: boolean) {
    this.emojiPickerSubjectChannel.next(state);
  }

  emojiPickerChannelReaction(state: boolean) {
    this.emojiPickerSubjectChannelReaction.next(state);
  }

  associatedUserChat(state: boolean) {
    this.AssociatedUserSubjectChat.next(state);
  }

  associatedUserChatThread(state: boolean) {
    this.AssociatedUserSubjectChatThread.next(state);
  }

  clearInputValue(state: boolean) {
    this.clearTextEditorValueSubcription.next(state);
  }

  async initializeService() {
    this.currentuid = await this.getCurrentUid();
    this.loadAllChats();
  }

  async getCurrentUid(): Promise<string | null> {
    return new Promise((resolve) => {
      const checkUid = () => {
        const uid = this.FirestoreService.currentuid;
        if (uid) { resolve(uid); }
        else { setTimeout(checkUid, 100); }
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

  loadUserData(userDetails: any) { this.userInformationSubject.next(userDetails); }
  async loadUser() {
    let allUsers = await this.FirestoreService.getAllUsers().then((user: any) => { return user; });
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
