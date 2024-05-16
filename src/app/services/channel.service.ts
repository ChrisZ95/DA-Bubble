import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  DocumentReference,
  DocumentData,
  doc,
  updateDoc,
  onSnapshot,
  getDoc,
  arrayUnion,
  query,
  where,
  getDocs,
  Query,
} from '@angular/fire/firestore';
import { Observable, Subject } from 'rxjs';
import { Channel } from './../../models/channel.class';
import { FirestoreService } from '../firestore.service';
import { EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  channel = new Channel();
  channelID: string = '';
  channelName = '';
  channelListNamesArray: any = [];
  channelDescription = '';
  UserName = '';
  author = '';
  private currentChannelId: string = '';
  currentMessageId: string = '';
  showChannelChat: boolean = false;
  showThreadWindow: boolean = false;
  messages: any[] = [];
  comments: any[] = [];
  currentMessageIdChanged: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private readonly firestore: Firestore,
    private FirestoreService: FirestoreService
  ) {}

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  async getChannels(): Promise<Channel[]> {
    try {
      const channelsCollection = collection(this.firestore, 'channels');
      const usersSnapshot = await getDocs(channelsCollection);
      const channels: Channel[] = [];
      usersSnapshot.forEach((doc) => {
        channels.push(doc.data() as Channel);
      });
      return channels;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  getChannelDoc() {
    if (this.channelID) {
      return doc(collection(this.firestore, 'channels'), this.channelID);
    } else {
      throw new Error('Channel-ID fehlt.');
    }
  }

  async getChannelIDByField(field: string, value: any): Promise<string | null> {
    const q = query(
      collection(this.firestore, 'channels'),
      where(field, '==', value)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size === 0) {
      return null;
    }
    const docSnapshot = querySnapshot.docs[0];
    return docSnapshot.id;
  }

  getChannelDocByID(ID: string) {
    return doc(collection(this.firestore, 'channels'), ID);
  }

  addChannel(channelData: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const newChannel = channelData; // Verwende das übergebene channelData
      addDoc(collection(this.firestore, 'channels'), newChannel)
        .then((result: any) => {
          newChannel['channelId'] = result.id;
          updateDoc(doc(this.firestore, 'channels', result.id), newChannel)
            .then(() => {
              console.log(result);
              resolve(result.id);
            })
            .catch((error) => {
              console.error('Fehler beim Aktualisieren des Kanals:', error);
              reject(error);
            });
        })
        .catch((error) => {
          console.error('Fehler beim Erstellen des Kanals:', error);
          reject(error);
        });
    });
  }

  async updateChannel(channelRef: DocumentReference<DocumentData>, object: {}) {
    await updateDoc(channelRef, object);
  }

  getChannelName(channelName: string) {
    this.channelName = channelName;
  }

  getDescription(text: string) {
    this.channelDescription = text;
  }

  getUserName(name: string) {
    this.UserName = name;
  }

  getAuthor(author: string) {
    this.author = author;
  }

  async getAuthorName(uid: string): Promise<string | null> {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data() as DocumentData;
        if (userData && userData['username']) {
          return userData['username'];
        } else {
          console.error('Benutzername nicht gefunden.');
          return null;
        }
      } else {
        console.error('Benutzer nicht gefunden.');
        return null;
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzernamens:', error);
      throw error;
    }
  }

  async getChannelAuthorUid(channelId: string): Promise<string | null > {
    try {
      const channelDocRef = doc(this.firestore, 'channels', channelId);
      const channelSnapshot = await getDoc(channelDocRef);
      if (channelSnapshot.exists()) {
        const channelData = channelSnapshot.data() as DocumentData;
        if (channelData && channelData['author']) {
          return channelData['author'];
        } else {
          console.error('Autor des Kanals nicht gefunden.');
          return null;
        }
      } else {
        console.error('Kanal nicht gefunden.');
        return null;
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Autors des Kanals:', error);
      throw error;
    }
  }

  setCurrentChannelId(channelId: string) {
    this.currentChannelId = channelId;
  }

  setCurrentMessageId(messageId: string) {
    this.currentMessageId = messageId;
    this.currentMessageIdChanged.emit(messageId);
  }

  getCurrentChannelId(): string {
    return this.currentChannelId;
  }

  getCurrentMessageId(): string {
    return this.currentMessageId;
  }

  async loadMessagesForChannel(channelId: string): Promise<any[]> {
  this.messages = [];
  try {
    const chatsRef = collection(this.firestore, 'chats');
    const q: Query<DocumentData> = query(
      chatsRef,
      where('channelId', '==', channelId)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const chatData = doc.data();
      if (chatData['messages'] && Array.isArray(chatData['messages'])) {
        const messagesWithCommentCount = chatData['messages'].map((message: any) => {
          const commentCount = message.comments ? message.comments.length : 0;
          const lastCommentTime = message.comments ? message.comments.reduce((latest: number, comment: any) => {
            const commentTime = parseInt(comment.createdAt);
            return commentTime > latest ? commentTime : latest;
          }, 0) : 0;
          return { ...message, commentCount, lastCommentTime };
        });
        this.messages.push(...messagesWithCommentCount);
      }
    });
    return this.messages;
    } catch (error) {
      console.error('Error loading messages for channel:', error);
      return [];
    }
  }

  async getUserById(userId: string): Promise<any> {
    try {
      const userDoc = doc(this.firestore, 'users', userId);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        return userSnapshot.data();
      } else {
        console.error('User document does not exist');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
}