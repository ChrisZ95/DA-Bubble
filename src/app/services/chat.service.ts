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
import { Message } from 'protobufjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
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

  // async createChat(userDetails: any) {
  //   Array.isArray(userDetails) ? userDetails : [userDetails];
  //   try {
  //     let date = new Date().getTime().toString();
  //     let chatDocIds = await this.getChatsDocumentIDs('chats');

  //     this.currentuid = this.FirestoreService.currentuid;

  //     if (this.currentuid === userDetails.uid) {
  //       let ownChatDocId = chatDocIds.filter(
  //         (id: any) => this.currentuid === id
  //       );
  //       if (ownChatDocId.length === 0) {
  //         ownChatDocId = [this.currentuid];
  //         const chatData = {
  //           createdAt: date,
  //           chatId: this.currentuid,
  //           messages: [],
  //         };
  //         await setDoc(doc(this.firestore, 'chats', this.currentuid), chatData);
  //       }
  //       await this.loadMessages(ownChatDocId);
  //     } else {
  //       // this.createChatWithTwoUsers();
  //       let slicedOwnUid = this.currentuid.slice(0, 5);
  //       let slicedOtherUid = userDetails.uid.slice(0, 5);
  //       let combinedShortedId: any = [];
  //       combinedShortedId.push(slicedOwnUid);
  //       combinedShortedId.push(slicedOtherUid);
  //       combinedShortedId = combinedShortedId.sort().join('-');

  //       const chatData = {
  //         createdAt: date,
  //         chatId: combinedShortedId,
  //         messages: [],
  //       };
  //       await setDoc(doc(this.firestore, 'chats', combinedShortedId), chatData);
  //     }
  //   } catch (error) {
  //     console.error('Error creating chat:', error);
  //   }
  // }
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
          // await this.loadMessages(ownChatDocId);
        } else {
          let slicedOwnUid = this.currentuid.slice(0, 5);
          let slicedOtherUid = user.uid.slice(0, 5);
          let combinedShortedId: any = [];
          combinedShortedId.push(slicedOwnUid);
          combinedShortedId.push(slicedOtherUid);
          combinedShortedId = combinedShortedId.sort().join('-');

          const chatData = {
            createdAt: date,
            chatId: combinedShortedId,
            participants: [this.currentuid, user.uid],
            messages: [],
          };
          await setDoc(
            doc(this.firestore, 'chats', combinedShortedId),
            chatData
          );
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

  // async loadMessages(docId: any) {
  //   try {
  //     this.chatDocId = docId;
  //     let chatRef = doc(this.chatsCollection, docId[0]);
  //     let chatData = await getDoc(chatRef);
  //     this.loadedchatInformation = chatData.data();
  //   } catch (error) {
  //     console.error('Error loading messages:', error);
  //   }
  // }
  messages: any[] = [];
  async loadMessages(userDetails: any) {
    this.createChat(userDetails);
    this.currentuid = this.FirestoreService.currentuid;
    this.messages = [];

    const chatDocIds = await this.getUserChatDocuments();
    console.log('User Chat Document IDs:', chatDocIds);

    const chatsRef = collection(this.db, 'chats');
    for (const chatDocId of chatDocIds) {
      const chatDoc = await getDoc(doc(this.firestore, 'chats', chatDocId));
      if (chatDoc.exists()) {
        const data = chatDoc.data();
        console.log('Chat Document Data:', data);

        if (Array.isArray(data['messages'])) {
          const userMessages = data['messages'].filter((message: any) => {
            return message.senderId === this.currentuid;
          });
          this.messages.push(...userMessages);
        }
      }
    }
    this.loadedchatInformation = userDetails;
    console.log('Filtered Messages:', this.messages);
  }

  getCombinedChatId(uid1: string, uid2: string): string {
    let slicedUid1 = uid1.slice(0, 5);
    let slicedUid2 = uid2.slice(0, 5);
    return [slicedUid1, slicedUid2].sort().join('-');
  }

  async getUserChatDocuments(): Promise<string[]> {
    const chatsRef = collection(this.db, 'chats');
    const querySnapshot = await getDocs(chatsRef);
    const chatDocIds: string[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data['participants'] &&
        data['participants'].includes(this.currentuid)
      ) {
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

    // Fetch the existing document
    const docRef = doc(this.firestore, 'chats', this.currentuid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      this.loadedchatInformation = docSnap.data();
    } else {
      console.log('No such document!');
      this.loadedchatInformation = {
        chatId: this.currentuid,
        createdAt: date,
        messages: [],
        participants: [this.currentuid],
      };
    }

    // Ensure messages is an array within loadedchatInformation
    if (!Array.isArray(this.loadedchatInformation.messages)) {
      this.loadedchatInformation.messages = [];
    }

    // Push the new message into the messages array
    this.loadedchatInformation.messages.push(message);

    // Update only the messages field in the Firestore document
    try {
      await updateDoc(docRef, {
        messages: this.loadedchatInformation.messages,
      });
      console.log('Message sent and chat document updated');
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
