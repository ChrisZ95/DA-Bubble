import { Injectable } from '@angular/core';
import {
  Firestore,
  getFirestore,
  onSnapshot,
  DocumentData,
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
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private messagesSubject = new BehaviorSubject<any[]>([]);
  public messages$: Observable<any[]> = this.messagesSubject.asObservable();
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

  constructor(
    private firestore: Firestore,
    public channelService: ChannelService,
    public FirestoreService: FirestoreService,
    public generateIdServie: GenerateIdsService
  ) {
    this.initializeService();
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
  }

  async loadMessages(userDetails: any, retryCount: number = 0) {
    if (Array.isArray(userDetails)) {
      userDetails = userDetails[0];
    }
    await this.createChat(userDetails);
    let currentuid = this.FirestoreService.currentuid;

    if (!currentuid) {
      if (retryCount < 3) {
        setTimeout(() => {
          currentuid = this.FirestoreService.currentuid;
          this.loadMessages(userDetails, retryCount + 1);
        }, 1000);
      } else {
        console.error('Currentuid nicht gefunden');
      }
      return;
    }
    const messages: any[] = [];
    if (userDetails.uid && userDetails.uid !== currentuid) {
      const combinedShortedId = this.getCombinedChatId(
        currentuid,
        userDetails.uid
      );
      this.chatDocId = combinedShortedId;
    } else {
      this.chatDocId = currentuid;
    }

    if (this.chatDocId) {
      const chatDoc = await getDoc(
        doc(this.firestore, 'chats', this.chatDocId)
      );
      if (chatDoc.exists()) {
        const data = chatDoc.data();
        if (Array.isArray(data['messages'])) {
          const userMessages = data['messages'].filter((message: any) => {
            if (this.chatDocId === currentuid) {
              return message.creator === currentuid;
            } else {
              return (
                message.creator === currentuid ||
                (userDetails.uid && message.creator === userDetails.uid)
              );
            }
          });
          messages.push(...userMessages);
        }
      }
    }
    this.messagesSubject.next(messages);
  }

  // async loadUser(userDetails: any) {
  //   if (Array.isArray(userDetails)) {
  //     userDetails = userDetails[0];
  //   }
  //   let currentuid = this.FirestoreService.currentuid;
  //   if (userDetails.uid && userDetails.uid !== currentuid) {
  //     const combinedShortedId = this.getCombinedChatId(
  //       currentuid,
  //       userDetails.uid
  //     );
  //     this.chatDocId = combinedShortedId;
  //   } else {
  //     this.chatDocId = currentuid;
  //   }
  //   if (this.chatDocId) {
  //     const chatDoc = await getDoc(
  //       doc(this.firestore, 'users', this.chatDocId)
  //     );
  //     if (chatDoc.exists()) {
  //       const data = chatDoc.data();
  //       console.log('data', data);
  //     }
  //   }
  // }

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

    if (!currentuid) {
      if (retryCount < 3) {
        setTimeout(() => {
          currentuid = this.FirestoreService.currentuid;
          this.sendData(text, retryCount + 1);
        }, 1000);
      } else {
        console.error('Currentuid nicht gefunden');
      }
      return;
    }

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
