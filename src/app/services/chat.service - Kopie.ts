import { Injectable, OnInit } from '@angular/core';
import {
  Firestore,
  getFirestore,
  provideFirestore,
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
import { debug, log } from 'console';
import { GenerateIdsService } from './generate-ids.service';
import { DocumentReference } from 'firebase/firestore';
// import { Message } from 'protobufjs';
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
  chatDocId: any;
  allPotentialChatUsers: any[] = [];
  showOwnChat: boolean = true;
  showEmptyChat: boolean = false;

  focusOnTextEditor: boolean = false;

  constructor(
    private firestore: Firestore,
    public channelService: ChannelService,
    public FirestoreService: FirestoreService,
    public generateIdServie: GenerateIdsService
  ) {}

  db = getFirestore();
  chatsCollection = collection(this.db, 'chats');
  usersCollection = collection(this.db, 'users');

  // Function to get documents from a collection
  async getChatsDocumentIDs(collectionName: string) {
    const docRef = collection(this.db, collectionName);
    const docSnap = await getDocs(docRef);
    return docSnap.docs.map((doc) => doc.id);
  }

  async createChat(userDetails: any) {
    userDetails = Array.isArray(userDetails) ? userDetails : [userDetails];
    try {
      let date = new Date().getTime().toString();
      let chatDocIds = await this.getChatsDocumentIDs('chats');
      this.currentuid = this.FirestoreService.currentuid;

      userDetails.forEach(async (user: any) => {
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
          // Change Here
          let slicedOwnUid = this.currentuid.slice(0, 5);
          let slicedOtherUid = user.uid.slice(0, 5);
          let combinedShortedId: any = [];
          combinedShortedId.push(slicedOwnUid);
          combinedShortedId.push(slicedOtherUid);
          combinedShortedId = combinedShortedId.sort().join('-');

          const chatDocRef = doc(this.firestore, 'chats', combinedShortedId);
          const chatDoc = await getDoc(chatDocRef);

          // Check if the chat document already exists
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
      });
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  }

  async createChatWithUsers(): Promise<void> {
    this.currentuid = this.FirestoreService.currentuid;
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

  messages: any[] = [];
  async loadMessages(userDetails: any) {
    await this.createChat(userDetails);
    const currentuid = this.FirestoreService.currentuid;
    const messages: any[] = [];
    let chatDocIds: string[] = [];

    // Check if userDetails contains another user
    if (userDetails.uid && userDetails.uid !== currentuid) {
      // Generate combined document ID for two-user chat
      const slicedOwnUid = currentuid.slice(0, 5);
      const slicedOtherUid = userDetails.uid.slice(0, 5);
      const combinedShortedId = [slicedOwnUid, slicedOtherUid].sort().join('-');
      chatDocIds = [combinedShortedId];
    } else {
      // Get chat document IDs for single-user chat
      chatDocIds = await this.getUserChatDocuments(currentuid);
    }

    for (const chatDocId of chatDocIds) {
      const chatDoc = await getDoc(doc(this.firestore, 'chats', chatDocId));
      if (chatDoc.exists()) {
        const data = chatDoc.data();
        if (Array.isArray(data['messages'])) {
          const userMessages = data['messages'].filter((message: any) => {
            return (
              message.creator === currentuid ||
              message.creator === userDetails.uid
            );
          });
          messages.push(...userMessages);
        }
      }
    }

    this.messagesSubject.next(messages);
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

  async sendData(text: any) {
    let id = this.generateIdServie.generateId();
    let date = new Date().getTime().toString();
    let currentuid = this.FirestoreService.currentuid;
    let message = {
      message: text,
      id: id,
      creator: currentuid,
      createdAt: date,
    };
    const docRef = doc(this.firestore, 'chats', this.currentuid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      this.loadedchatInformation = docSnap.data();
    } else {
      this.loadedchatInformation = {
        chatId: this.currentuid,
        createdAt: date,
        messages: [],
        participants: [this.currentuid],
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
      console.error('Error updating chat document:', error);
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
        console.error('Chat document not found for channelId:', channelId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async sendCommentToChannel(messageId: string, comment: any) {
    try {
      const chatsRef = collection(this.firestore, 'chats');
      const q = query(chatsRef); // keine spezifische Abfrage, um die gesamte Sammlung zu erhalten
      const querySnapshot = await getDocs(q);
      console.log('Query Snapshot:', querySnapshot.docs);

      querySnapshot.forEach(async (doc) => {
        const messages = doc.data()['messages'] || [];
        const message = messages.find(
          (message: any) => message.messageId === messageId
        );
        if (message) {
          // Nachricht mit der gesuchten messageId gefunden
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
      console.log('Chat erfolgreich erstellt für Kanal:', channelId);
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
