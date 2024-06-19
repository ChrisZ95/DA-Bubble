import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, DocumentReference, DocumentData, doc, updateDoc, getDoc, query, where, getDocs, Query, QuerySnapshot, QueryDocumentSnapshot, deleteDoc} from '@angular/fire/firestore';
import { Channel } from './../../models/channel.class';
import { FirestoreService } from '../firestore.service';
import { EventEmitter } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ChannelchatComponent } from '../chats/channelchat/channelchat.component';

@Injectable({providedIn: 'root'})
export class ChannelService {
  channel = new Channel();
  channelID: string = '';
  channelName: any = '';
  channelListNamesArray: any = [];
  channelDescription = '';
  UserName = '';
  author = '';
  currentChannelId: string = '';
  currentMessageId: string = '';
  showChannelChat: boolean = false;
  showThreadWindow: boolean = false;
  messages: any[] = [];
  comments: any[] = [];
  messagesWithAuthors: any[] = [];
  commentsWithAuthors: any[] = [];
  currentMessage: any;
  channels: any[] = [];
  currentMessageIdChanged: EventEmitter<string> = new EventEmitter<string>();
  currentMessageChanged: EventEmitter<any> = new EventEmitter<any>();
  currentChannelIdChanged: EventEmitter<string> = new EventEmitter<string>();
  currentMessageCommentsChanged: EventEmitter<any[]> = new EventEmitter<any[]>();
  private currentChannelIdSource = new BehaviorSubject<string | null>(null);
  currentChannelId$ = this.currentChannelIdSource.asObservable();

  constructor( private readonly firestore: Firestore, public FirestoreService: FirestoreService) {}

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
      const messagesCollectionRef = collection(this.firestore, `channels/${currentDocID}/messages`);
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

  updateMessageInMessagesList(messageId: string, newComment: any): void {
    const messageIndex = this.messages.findIndex(
      (msg) => msg.messageId === messageId
    );
    if (messageIndex > -1) {
      if (!this.messages[messageIndex].comments) {
        this.messages[messageIndex].comments = [];
      }
      this.messages[messageIndex].comments.push(newComment);
      this.updateMessagesWithAuthors();
      this.currentMessageCommentsChanged.emit(
        this.messages[messageIndex].comments
      );
    }
  }

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
      this.createNewChannel(channelData)
        .then(channelId => this.updateChannelData(channelId, channelData)
          .then(() => resolve(channelId))
          .catch(reject))
        .catch(reject);
    });
  }

  createNewChannel(channelData: any): Promise<string> {
    return addDoc(collection(this.firestore, 'channels'), channelData)
      .then((result: any) => result.id)
      .catch(error => {
        console.error('Fehler beim Erstellen des Kanals:', error);
        throw error;
      });
  }

  updateChannelData(channelId: string, channelData: any): Promise<void> {
    const channelDocRef = doc(this.firestore, 'channels', channelId);
    return updateDoc(channelDocRef, { ...channelData, channelId })
      .catch(error => {
        console.error('Fehler beim Aktualisieren des Kanals:', error);
        throw error;
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
      const userDocRef = this.getUserDocumentReference(uid);
      const userData = await this.getUserData(userDocRef);
      if (userData) {
        return this.extractUsername(userData);
      } else {
        console.error('Benutzerdaten nicht gefunden.');
        return null;
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzernamens:', error);
      throw error;
    }
  }

  getUserDocumentReference(uid: string): DocumentReference {
    return doc(this.firestore, 'users', uid);
  }

  async getUserData(userDocRef: DocumentReference): Promise<DocumentData | null> {
    const userSnapshot = await getDoc(userDocRef);
    if (userSnapshot.exists()) {
      return userSnapshot.data() as DocumentData;
    } else {
      console.error('Benutzer nicht gefunden.');
      return null;
    }
  }

  extractUsername(userData: DocumentData): string | null {
    if (userData && userData['username']) {
      return userData['username'];
    } else {
      console.error('Benutzername nicht gefunden.');
      return null;
    }
  }

  async getChannelAuthorUid(channelId: string): Promise<string | null> {
    try {
      const channelDocRef = this.getChannelDocumentReference(channelId);
      const channelData = await this.getChannelData(channelDocRef);
      return this.extractChannelAuthor(channelData);
    } catch (error) {
      console.error('Fehler beim Abrufen des Autors des Kanals:', error);
      throw error;
    }
  }

  getChannelDocumentReference(channelId: string): DocumentReference {
    return doc(this.firestore, 'channels', channelId);
  }

  async getChannelData(channelDocRef: DocumentReference): Promise<DocumentData | null> {
    const channelSnapshot = await getDoc(channelDocRef);
    if (channelSnapshot.exists()) {
      return channelSnapshot.data();
    } else {
      console.error('Kanal nicht gefunden.');
      return null;
    }
  }

  extractChannelAuthor(channelData: DocumentData | null): string | null {
    if (channelData && channelData['author']) {
      return channelData['author'];
    } else {
      console.error('Autor des Kanals nicht gefunden.');
      return null;
    }
  }

  setCurrentChannelId(channelId: string) {
    this.currentChannelId = channelId;
    console.log('Current channel ID changed to:', channelId);
    this.currentChannelIdChanged.emit(channelId);
    this.currentChannelIdSource.next(channelId);
  }

  setCurrentMessageId(messageId: string) {
    this.currentMessageId = messageId;
    this.currentMessageIdChanged.emit(messageId);
    const currentMessage = this.messages.find(message => message.messageId === messageId);
    this.currentMessageChanged.emit(currentMessage);
  }

  getCurrentChannelId(): string {
    return this.currentChannelId;
  }

  getCurrentMessageId(): string {
    return this.currentMessageId;
  }

  setCurrentMessage(message: any) {
    this.currentMessage = message;
  }

  getCurrentMessage() {
    return this.currentMessage;
  }

  async loadMessagesForChannel(channelId: string): Promise<any[]> {
    try {
      const querySnapshot = await this.queryChannelMessages(channelId);
      this.processQuerySnapshot(querySnapshot);
      return this.messages;
    } catch (error) {
      console.error('Error loading messages for channel:', error);
      return [];
    }
  }

  private async queryChannelMessages(channelId: string): Promise<QuerySnapshot<DocumentData>> {
    const chatsRef = collection(this.firestore, 'chats');
    const q: Query<DocumentData> = query(chatsRef, where('channelId', '==', channelId));
    return await getDocs(q);
  }

  private processQuerySnapshot(querySnapshot: QuerySnapshot<DocumentData>): void {
    this.messages = [];
    querySnapshot.forEach((doc) => {
      const chatData = doc.data();
      this.processChatDataMessages(chatData);
    });
  }

  private processChatDataMessages(chatData: DocumentData): void {
    if (chatData['messages'] && Array.isArray(chatData['messages'])) {
      const messagesWithCommentCount = chatData['messages'].map((message: any) => {
        return this.processMessageWithCommentCount(message);
      });
      this.messages.push(...messagesWithCommentCount);
    }
  }

  private processMessageWithCommentCount(message: any): any {
    const commentCount = message.comments ? message.comments.length : 0;
    const lastCommentTime = message.comments
      ? message.comments.reduce((latest: number, comment: any) => {
          const commentTime = parseInt(comment.createdAt);
          return commentTime > latest ? commentTime : latest;
        }, 0)
      : 0;
    return { ...message, commentCount, lastCommentTime };
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

  async updateMessagesWithAuthors() {
    this.messagesWithAuthors = await Promise.all(
      this.messages.map(async (message: any) => {
        const authorName = await this.getAuthorName(message.uid);
        return {
          ...message,
          authorName: authorName ?? message.uid,
        };
      })
    );
  }

  async updateMessage(messageId: string, newMessageText: string): Promise<void> {
    try {
      const querySnapshot = await this.getChatsSnapshot();
      const messageFound = this.findAndUpdateMessage(querySnapshot, messageId, newMessageText);
      if (!messageFound) {
        console.error('No chat document found containing the specified message.');
      }
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  async getChatsSnapshot(): Promise<QuerySnapshot<DocumentData>> {
    const chatsRef = collection(this.firestore, 'chats');
    return await getDocs(chatsRef);
  }

  findAndUpdateMessage(snapshot: QuerySnapshot<DocumentData>, messageId: string, newMessageText: string): boolean {
    for (const chatDoc of snapshot.docs) {
      const chatData = chatDoc.data();
      if (chatData['messages'] && Array.isArray(chatData['messages'])) {
        const messages = chatData['messages'];
        const messageIndex = messages.findIndex((msg: any) => msg.messageId === messageId);
        if (messageIndex !== -1) {
          this.updateMessageInChatDocument(chatDoc, messages, messageIndex, newMessageText);
          return true;
        }
      }
    }
    return false;
  }

  async updateMessageInChatDocument(chatDoc: QueryDocumentSnapshot<DocumentData>, messages: any[], messageIndex: number, newMessageText: string): Promise<void> {
    messages[messageIndex].message = newMessageText;
    await updateDoc(doc(this.firestore, 'chats', chatDoc.id), { messages });
  }

  async updateComment(messageId: string, commentId: string, newCommentText: string): Promise<void> {
    try {
      const querySnapshot = await this.getChatsSnapshot();
      const commentFound = this.findAndUpdateComment(querySnapshot, messageId, commentId, newCommentText);
      if (!commentFound) {
        console.error('No chat document found containing the specified comment.');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  private async findAndUpdateComment(snapshot: QuerySnapshot<DocumentData>, messageId: string, commentId: string, newCommentText: string): Promise<boolean> {
    for (const chatDoc of snapshot.docs) {
      const chatData = chatDoc.data();
      if (chatData['messages'] && Array.isArray(chatData['messages'])) {
        const messages = chatData['messages'];
        const commentFound = this.updateCommentInMessages(messages, messageId, commentId, newCommentText);
        if (commentFound) {
          await this.updateMessagesInChatDocument(chatDoc, messages);
          return true;
        }
      }
    }
    return false;
  }

  updateCommentInMessages(messages: any[], messageId: string, commentId: string, newCommentText: string): boolean {
    for (const message of messages) {
      if (message.messageId === messageId && message.comments && Array.isArray(message.comments)) {
        const commentIndex = message.comments.findIndex((comment: any) => comment.commentId === commentId);
        if (commentIndex !== -1) {
          message.comments[commentIndex].comment = newCommentText;
          return true;
        }
      }
    }
    return false;
  }

  async updateMessagesInChatDocument(chatDoc: QueryDocumentSnapshot<DocumentData>, messages: any[]): Promise<void> {
    await updateDoc(doc(this.firestore, 'chats', chatDoc.id), { messages });
  }

  async leaveChannel() {
    try {
      const channelId = this.getCurrentChannelId();
      if (!channelId) {
        throw new Error('Channel ID is not available.');
      }
      const channelDocRef = this.getChannelDocByID(channelId);
      const currentUsers = await this.getCurrentChannelUsers(channelDocRef);
      const updatedUsers = this.filterCurrentUser(currentUsers);
      await this.updateChannelUsers(channelDocRef, updatedUsers);
    } catch (error) {
      console.error('Error leaving the channel:', error);
    }
  }

  async deleteChannel(channelId: string) {
    const channelDocRef = this.getChannelDocByID(channelId);
    await deleteDoc(channelDocRef);
    await this.loadChannels();
    this.setCurrentChannelId('');
    this.channelName = null;
  }

  async loadChannels() {
    const channelsSnapshot = await getDocs(collection(this.firestore, 'channels'));
    this.channels = channelsSnapshot.docs.map(doc => doc.data());
  }

  async getCurrentChannelUsers(channelDocRef: any): Promise<string[]> {
    const channelSnap = await getDoc(channelDocRef);
    if (!channelSnap.exists()) {
      throw new Error('Channel document does not exist.');
    }
    const currentChannelData = channelSnap.data() as { users: string[] };
    return currentChannelData.users || [];
  }

  filterCurrentUser(users: string[]): string[] {
    return users.filter(userId => userId !== this.FirestoreService.currentuid);
  }

  async updateChannelUsers(channelDocRef: any, updatedUsers: string[]) {
    await this.updateChannel(channelDocRef, { users: updatedUsers });
  }
}
