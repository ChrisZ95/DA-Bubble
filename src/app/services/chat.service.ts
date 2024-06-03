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
} from 'firebase/firestore';
import { ChannelService } from './channel.service';
import { FirestoreService } from '../firestore.service';
import { GenerateIdsService } from './generate-ids.service';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  map,
  of,
} from 'rxjs';
import { log } from 'console';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private userInformationSubject = new BehaviorSubject<any>(null);
  userInformation$: Observable<any> =
    this.userInformationSubject.asObservable();

  private messagesSubject = new BehaviorSubject<any[]>([]);
  public messages$: Observable<any[]> = this.messagesSubject.asObservable();
  private filteredUsersSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public filteredUsers$: Observable<any[]> = this.filteredUsersSubject.asObservable();

  private emojiPickerSubject = new BehaviorSubject<boolean>(false);
  emojiPicker$ = this.emojiPickerSubject.asObservable();

  private AssociatedUserSubject = new BehaviorSubject<boolean>(false);
  associatedUser$ = this.AssociatedUserSubject.asObservable();

  private clearTextEditorValueSubcription = new BehaviorSubject<boolean>(false);
  clearValue$ = this.clearTextEditorValueSubcription.asObservable();

  currentuid: any;
  chatList: any = [];
  loadedchatInformation: any = {};
  chatDocId: string | null = null;
  allPotentialChatUsers: any[] = [];
  showOwnChat: boolean = true;
  showEmptyChat: boolean = false;

  focusOnTextEditor: boolean = false;
  messages: any[] = [];
  dataURL: any;
  participants: any = [];
  allUsers: any;
  filteredUsers: any;
  loadCount: number = 0;
  userInformation: any[] = [];

  constructor(
    private firestore: Firestore,
    public channelService: ChannelService,
    public FirestoreService: FirestoreService,
    public generateIdServie: GenerateIdsService,
  ) {
    this.initializeService();
  }

  emojiPicker(state: boolean) {
    this.emojiPickerSubject.next(state);
  }

  associatedUser(state: boolean) {
    this.AssociatedUserSubject.next(state);
  }

  clearInputValue(state: boolean) {
    debugger
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

  async createChat(userDetails: any, retryCount: number = 0) {
    userDetails = Array.isArray(userDetails) ? userDetails : [userDetails];
    try {
      let date = new Date().getTime().toString();
      let chatDocIds = await this.getChatsDocumentIDs('chats');

      if (!this.currentuid) {
        if (retryCount < 3) {
          setTimeout(() => this.createChat(userDetails, retryCount + 1), 1000);
        } else {
          console.error('Currentuid nicht gefunden');
        }
        return;
      }

      for (const user of userDetails) {
        if (this.currentuid === user.uid) {
          let ownChatDocId = chatDocIds.filter(
            (id: any) => this.currentuid === id
          );
          if (ownChatDocId.length === 0) {
            ownChatDocId = [this.currentuid];
            const chatData = {
              createdAt: date,
              chatId: this.currentuid,
              participants: [this.currentuid],
              messages: [],
            };
            await setDoc(
              doc(this.firestore, 'chats', this.currentuid),
              chatData
            );
          }
        } else {
          const combinedShortedId = this.getCombinedChatId(
            this.currentuid,
            user.uid
          );
          const chatDocRef = doc(this.firestore, 'chats', combinedShortedId);
          const chatDoc = await getDoc(chatDocRef);

          if (!chatDoc.exists()) {
            const chatData = {
              createdAt: date,
              chatId: combinedShortedId,
              participants: [this.currentuid, user.uid],
              messages: [],
            };
            await setDoc(chatDocRef, chatData);
          }
        }
      }
    } catch (error) {
      console.error('Error createChat:', error);
    }
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

  async createChatWithUsers(retryCount: number = 0): Promise<void> {
    if (!this.currentuid) {
      if (retryCount < 3) {
        setTimeout(() => this.createChatWithUsers(retryCount + 1), 1000);
      } else {
        console.error('Currentuid nicht gefunden');
      }
      return;
    }
    let allUsers = await this.FirestoreService.getAllUsers();
    const currentUser = allUsers.find((user) => user.uid === this.currentuid);
    if (currentUser) {
      this.allPotentialChatUsers = [
        currentUser,
        ...this.allPotentialChatUsers.filter(
          (user) => user.uid !== this.currentuid
        ),
      ];
    }
    let uniqueShortIds = new Set(
      this.allPotentialChatUsers.map((user) => user.uid.slice(0, 5))
    );
    let combinedShortedId = Array.from(uniqueShortIds).sort().join('-');
    let existingChatIDs = await this.getChatsDocumentIDs('chats');
    let filteredChats = existingChatIDs.filter(
      (id) => id === combinedShortedId
    );
    let ascending = true;
    let extractedUid = this.allPotentialChatUsers
      .map((user) => user.uid)
      .sort((a, b) => (ascending ? a.localeCompare(b) : b.localeCompare(a)));

    const chatData = {
      createdAt: 'date',
      chatId: combinedShortedId,
      participants: extractedUid,
      messages: [],
    };
    if (filteredChats.length == 0) {
      await setDoc(doc(this.firestore, 'chats', combinedShortedId), chatData);
    }
    this.loadGroupChatMessages(combinedShortedId);
  }

  async loadGroupChatMessages(
    concatenatedDocId: string,
    retryCount: number = 0
  ) {
    this.chatDocId = concatenatedDocId;
    const messages: any[] = [];

    if (concatenatedDocId) {
      const chatDoc = await getDoc(
        doc(this.firestore, 'chats', concatenatedDocId)
      );
      if (chatDoc.exists()) {
        const data = chatDoc.data();
        this.participants = data['participants'];

        if (Array.isArray(data['messages'])) {
          const userMessages = data['messages'].filter((message: any) => {
            return this.participants.includes(message.creator);
          });
          messages.push(...userMessages);
        }
      }
    }

    const filteredUsers = this.allUsers.filter((user: any) =>
      this.participants.includes(user.uid)
    );
    this.filteredUsersSubject.next(filteredUsers);
    this.messagesSubject.next(messages);
  }

  // async loadMessages(userDetails: any, retryCount: number = 0) {
  //     this.loadCount = 1;
  //     if (Array.isArray(userDetails)) {
  //       userDetails = userDetails[0];
  //     }
  //     await this.createChat(userDetails);
  //     let currentuid = this.FirestoreService.currentuid;

  //     if (!currentuid) {
  //       if (retryCount < 3) {
  //         setTimeout(() => {
  //           currentuid = this.FirestoreService.currentuid;
  //           this.loadMessages(userDetails, retryCount + 1);
  //         }, 1000);
  //       } else {
  //         console.error('Currentuid nicht gefunden');
  //       }
  //       return;
  //     }
  //     const messages: any[] = [];
  //     if (userDetails.uid && userDetails.uid !== currentuid) {
  //       const combinedShortedId = this.getCombinedChatId(
  //         currentuid,
  //         userDetails.uid
  //       );
  //       this.chatDocId = combinedShortedId;
  //     } else {
  //       this.chatDocId = currentuid;
  //     }

  //     if (this.chatDocId) {
  //       const chatDoc = await getDoc(
  //         doc(this.firestore, 'chats', this.chatDocId)
  //       );
  //       if (chatDoc.exists()) {
  //         const data = chatDoc.data();
  //         this.participants = data['participants'];

  //         if (Array.isArray(data['messages'])) {
  //           const userMessages = data['messages'].filter((message: any) => {
  //             if (this.chatDocId === currentuid) {
  //               return message.creator === currentuid;
  //             } else {
  //               return (
  //                 message.creator === currentuid ||
  //                 (userDetails.uid && message.creator === userDetails.uid)
  //               );
  //             }
  //           });
  //           messages.push(...userMessages);
  //         }
  //       }
  //     }
  //     const filteredUsers = this.allUsers.filter((user: any) =>
  //       this.participants.includes(user.uid)
  //     );
  //     this.filteredUsersSubject.next(filteredUsers);
  //     this.messagesSubject.next(messages);
  // }

  //noch viel zu lang
  async loadMessages(input: string | any, retryCount: number = 0) {
    let currentuid = this.FirestoreService.currentuid;
    let concatenatedDocId: string | undefined;
    let userDetails: any;
    let messages: any[] = [];

    if (typeof input === 'string') {
      concatenatedDocId = input;
      userDetails = null;
      if (concatenatedDocId) {
        this.chatDocId = concatenatedDocId;
        const chatDoc = await getDoc(
          doc(this.firestore, 'chats', concatenatedDocId)
        );
        if (chatDoc.exists()) {
          const data = chatDoc.data();
          this.participants = data['participants'];
          if (Array.isArray(data['messages'])) {
            messages = data['messages'].filter((message: any) => {
              return this.participants.includes(message.creator);
            });
          }
        }
        const filteredUsers = this.allUsers.filter((user: any) =>
          this.participants.includes(user.uid)
        );

        this.filteredUsersSubject.next(filteredUsers);
        this.messagesSubject.next(messages);
      }
    } else if (typeof input === 'object') {
      userDetails = input;
      if (Array.isArray(userDetails)) {
        userDetails = userDetails[0];
      }
      if (!currentuid) {
        if (retryCount < 3) {
          setTimeout(() => {
            this.loadMessages(userDetails, retryCount + 1);
          }, 1000);
        } else {
          console.error('Currentuid not found');
        }
        return;
      }

      if (userDetails.uid && userDetails.uid !== currentuid) {
        concatenatedDocId = this.getCombinedChatId(currentuid, userDetails.uid);
      } else {
        concatenatedDocId = currentuid;
      }

      if (concatenatedDocId) {
        this.chatDocId = concatenatedDocId;
        const chatDoc = await getDoc(
          doc(this.firestore, 'chats', concatenatedDocId)
        );
        if (chatDoc.exists()) {
          const data = chatDoc.data();
          this.participants = data['participants'];
          if (Array.isArray(data['messages'])) {
            messages = data['messages'].filter((message: any) => {
              return (
                message.creator === currentuid ||
                message.creator === userDetails.uid
              );
            });
          }
        }

        const filteredUsers = this.allUsers.filter((user: any) =>
          this.participants.includes(user.uid)
        );
        this.filteredUsersSubject.next(filteredUsers);
        this.messagesSubject.next(messages);
      }
    }
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

  async sendData(text: any, retryCount: number = 0) {
    let id = this.generateIdServie.generateId();
    let date = new Date().getTime().toString();
    let currentuid = this.FirestoreService.currentuid;

    let message = {
      message: text,
      image: this.dataURL ? this.dataURL : '',
      id: id,
      creator: currentuid,
      createdAt: date,
    };

    const docId = this.chatDocId || currentuid;
    const docRef = doc(this.firestore, 'chats', docId);

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      this.loadedchatInformation = docSnap.data();
    } else {
      this.loadedchatInformation = {
        chatId: docId,
        createdAt: date,
        messages: [],
        participants: [currentuid],
      };
    }
    if (!Array.isArray(this.loadedchatInformation.messages)) {
      this.loadedchatInformation.messages = [];
    }
    this.loadedchatInformation.messages.push(message);
    try {
      await updateDoc(docRef, {
        messages: this.loadedchatInformation.messages,
      });
      const filteredMessages = this.loadedchatInformation.messages.filter(
        (msg: any) => msg.creator === currentuid
      );
      this.messagesSubject.next(filteredMessages);
    } catch (error) {
      console.error('Error sendData:', error);
    }
  }

  async sendDataToChannel(channelId: string, message: any) {
    try {
      const chatsRef = collection(this.firestore, 'chats');
      const q = query(chatsRef, where('channelId', '==', channelId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const chatDocRef = doc.ref;
        const currentMessages = doc.data()?.['messages'] || [];
        const updatedMessages = [...currentMessages, message];
        await updateDoc(chatDocRef, { messages: updatedMessages });
      } else {
        console.error('Error channelId:', channelId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async sendCommentToChannel(messageId: string, comment: any) {
    try {
      const chatsRef = collection(this.firestore, 'chats');
      const q = query(chatsRef);
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        const messages = doc.data()['messages'] || [];
        const message = messages.find(
          (message: any) => message.messageId === messageId
        );
        if (message) {
          const chatDocRef = doc.ref;
          const updatedMessages = messages.map((msg: any) => {
            if (msg.messageId === messageId) {
              return {
                ...msg,
                comments: [...(msg.comments || []), comment],
              };
            }
            return msg;
          });
          await updateDoc(chatDocRef, { messages: updatedMessages });
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async createChatForChannel(channelId: string): Promise<void> {
    try {
      const createdAt = Date.now();
      const chatId = this.generateIdServie.generateId();
      const chatData = {
        createdAt: createdAt,
        channelId: channelId,
        id: chatId,
      };
      await setDoc(doc(this.firestore, 'chats', chatId), chatData);
    } catch (error) {
      console.error(
        'Fehler beim Erstellen des Chats für Kanal:',
        channelId,
        error
      );
      throw error;
    }
  }
}
