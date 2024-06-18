import {AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild,} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { GenerateIdsService } from '../../services/generate-ids.service';
import { Firestore, collection, onSnapshot, query,} from '@angular/fire/firestore';
import { ChannelService } from '../../services/channel.service';
import { FirestoreService } from '../../firestore.service';
import { ThreadService } from '../../services/thread.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-text-editor-channel',
  standalone: true,
  imports: [FormsModule, PickerComponent, CommonModule],
  templateUrl: './text-editor-channel.component.html',
  styleUrl: './text-editor-channel.component.scss'
})
export class TextEditorChannelComponent implements OnInit {
  @ViewChild('fileInput', { static: true })
  fileInput!: ElementRef<HTMLInputElement>;
  message: string = '';
  comment: string = '';
  currentMessageComments: any[] = [];
  fileArray: any[] = [];
  openEmojiPicker = false;
  emojiPickerSubscription: Subscription | null = null;
  openAssociatedUser = false;
  AssociatedUserSubscription: Subscription | null = null;
  filteredUsersSubscription: Subscription | null = null;
  clearTextEditorValueSubcription: Subscription | null = null;
  associatedUser: any;
  allUsers: any[] = [];
  memberData: { username: string }[] = [];

  constructor(
    private chatService: ChatService,
    private threadService: ThreadService,
    private generateId: GenerateIdsService,
    private firestore: Firestore,
    public channelService: ChannelService,
    private firestoreService: FirestoreService
  ) {}

  @Input() componentName!: string;

  ngOnInit(): void {
    this.subscribeToMessages();
    // this.emojiPickerSubscription = this.chatService.emojiPicker$.subscribe(
    //   (state: boolean) => {
    //     this.openEmojiPicker = state;
    //   }
    // );
    this.AssociatedUserSubscription = this.chatService.associatedUserChat$.subscribe(
      (state: boolean) => {
        this.openAssociatedUser = state;
      }
    );
    this.clearTextEditorValueSubcription = this.chatService.clearValue$.subscribe(
      (state: boolean) => {
        this.message = '';
        this.memberData.length = 0;
      }
    );
    this.firestoreService.getAllUsers().then(users => {
      this.allUsers = users;
      this.updateMemberData();
    }).catch(error => {
      console.error('Error fetching users:', error);
    });
  }

  ngOnDestroy(): void {
    if (this.emojiPickerSubscription) {
      this.emojiPickerSubscription.unsubscribe();
    }
    if (this.filteredUsersSubscription) {
      this.filteredUsersSubscription.unsubscribe();
    }
    if (this.AssociatedUserSubscription) {
      this.AssociatedUserSubscription.unsubscribe();
    }
    if (this.clearTextEditorValueSubcription) {
      this.clearTextEditorValueSubcription.unsubscribe();
    }
  }

  updateMemberData(): void {
    this.memberData = this.allUsers.filter(user => this.channelService.UserName.includes(user.uid)).map(user => ({ username: user.username}));
  }

  userMention() {
    this.updateMemberData();
    this.filteredUsersSubscription = this.chatService.filteredUsers$.subscribe(
      (users) => {
        this.associatedUser = users;
        console.log('geöffnet')
      }
    );
    this.openUserMention();
  }

  openUserMention() {
    console.log(this.allUsers, this.memberData)
    this.openAssociatedUser = true;
    this.chatService.associatedUserChat(true);
  }

  closeuserMention() {
    console.log(this.allUsers, this.memberData)
    this.openAssociatedUser = false;
    this.chatService.associatedUserChat(false);
  }

  userInserted(user: any) {
    this.message += `@${user}  `;
  }

  openEmojiMartPicker() {
    // this.openEmojiPicker = true;
    // this.chatService.emojiPicker(true);
  }

  closeEmojiMartPicker() {
    // this.openEmojiPicker = false;
    // this.chatService.emojiPicker(false);
  }

  submit() {
    if (
      this.fileArray.length === 0 &&
      (!this.message || this.message.trim().length === 0)
    ) {
      console.log('wähle ein bild oder nachricht');
    } else {
      if (this.componentName === 'ownChat') {
        this.sendMessage();
      } else if (this.componentName === 'thread') {
        this.sendReply();
      } else if (this.componentName === 'channel') {
        this.sendMessageToChannel();
      } else if (this.componentName === 'channelthread') {
        this.sendCommentToMessage();
      }
      this.chatService.dataURL = null;
      this.openAssociatedUser = false;
      this.fileArray = [];
    }
  }

  @HostListener('focusin', ['$event'])
  onFocus(event: FocusEvent) {
    if (this.componentName === 'emptyChat') {
      this.chatService.focusOnTextEditor = true;
      this.chatService.showEmptyChat = false;
      this.chatService.showOwnChat = true;
      this.chatService.focusOnTextEditor = false;
    }
  }

  addEmoji(event: any) {
    console.log('Emoji selected', event);
    const emoji = event.emoji.native;
    this.message = `${this.message}${emoji}`;
  }

  sendMessage() {
    this.openEmojiPicker = false;
    this.message = '';
  }
  sendGroupMessage() {
    console.log('Participants', this.chatService.participants);
    console.log('message', this.message);
    console.log('chatDocId', this.chatService.chatDocId);
  }

  sendReply() {
    // this.threadService.sendReply(this.message);
  }

  sendMessageToChannel() {
    const currentChannelId = this.channelService.getCurrentChannelId();
    const currentUid = this.firestoreService.currentuid;
    if (this.isChannelAndUserValid(currentChannelId, currentUid)) {
      const message = this.createMessage(currentUid);
      this.addAuthorNameToMessage(message, currentChannelId);
    } else {
      console.error('Kein aktueller Kanal ausgewählt oder Benutzer nicht angemeldet.');
    }
  }

  isChannelAndUserValid(channelId: string | null, uid: string | null): boolean {
    return !!channelId && !!uid;
  }

  createMessage(uid: string) {
    const timestamp = Date.now().toString();
    return {
      messageId: this.generateId.generateId(),
      message: this.message,
      createdAt: timestamp,
      uid: uid,
      comments: [],
      commentCount: 0,
      lastCommentTime: null,
    };
  }

  async addAuthorNameToMessage(messageWithoutAuthor: any, channelId: string) {
    try {
      const authorName = await this.channelService.getAuthorName(messageWithoutAuthor.uid);
      const message = {
        ...messageWithoutAuthor,
        authorName: authorName ?? messageWithoutAuthor.uid,
      };
      this.addMessageToChannel(message, channelId);
      this.message = '';
    } catch (error) {
      console.error('Error fetching author name:', error);
    }
  }

  addMessageToChannel(message: any, channelId: string) {
    this.channelService.messagesWithAuthors.push(message);
    this.channelService.messages.push(message);
  }

  async sendCommentToMessage() {
    const currentMessageId = this.channelService.getCurrentMessageId();
    const currentUid = this.firestoreService.currentuid;

    if (!currentMessageId) {
      console.error('Kein aktueller Kanal ausgewählt.');
      return;
    }

    const newComment = await this.createComment(currentUid);
    this.updateMessageWithComment(currentMessageId, newComment);
  }

  async createComment(uid: string) {
    const timestamp = Date.now().toString();
    const newComment = {
      id: this.generateId.generateId(),
      comment: this.comment,
      createdAt: timestamp,
      uid: uid,
      authorName: '',
      authorNameStatus: 'loading',
    };
    try {
      const authorName = await this.channelService.getAuthorName(uid);
      newComment.authorName = authorName ?? uid;
      newComment.authorNameStatus = 'loaded';
    } catch (error) {
      console.error('Error fetching author name:', error);
      newComment.authorName = uid;
      newComment.authorNameStatus = 'error';
    }
    return newComment;
  }

  updateMessageWithComment(messageId: string, comment: any) {
    this.channelService.updateMessageInMessagesList(messageId, comment);
    this.updateCommentCount(messageId);
    this.updateLastCommentTime(messageId, comment.createdAt);
    this.comment = '';
  }

  updateMessageInMessagesList(messageId: string, newComment: any): void {
    const messageIndex = this.channelService.messages.findIndex(
      (msg) => msg.messageId === messageId
    );
    if (messageIndex > -1) {
      if (!this.channelService.messages[messageIndex].comments) {
        this.channelService.messages[messageIndex].comments = [];
      }
      this.channelService.messages[messageIndex].comments.push(newComment);
      this.channelService.updateMessagesWithAuthors();
    }
  }

  updateLastCommentTime(messageId: string, timestamp: string): void {
    const message = this.channelService.messages.find(
      (msg) => msg.messageId === messageId
    );
    if (message) {
      message.lastCommentTime = timestamp;
      this.channelService.updateMessagesWithAuthors();
    }
  }

  updateCommentCount(messageId: string): void {
    const message = this.channelService.messages.find(
      (msg) => msg.messageId === messageId
    );
    if (message) {
      message.commentCount++;
      this.channelService.updateMessagesWithAuthors();
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  async customDataURL() {
    const fileInput = this.fileInput.nativeElement;
    const file = fileInput.files?.[0];
    this.openAssociatedUser = false;
    if (file && (this.fileArray.length) <= 4) {
      try {
        this.chatService.dataURL =
          await this.firestoreService.uploadDataIntoStorage(file);
        console.log('dataURL', this.chatService.dataURL);
        this.insertImage(file?.type, this.chatService.dataURL, file?.name);
        // if(file.type === 'image/png') {
        //   this.insertImage(file?.type,this.chatService.dataURL ,file?.name);
        //   console.log('Bild hochgeladen')
        // } else if(file.type === 'video/mp4') {
        //   this.insertImage(file?.type,this.chatService.dataURL ,file?.name);
        //   console.log('Video hochgeladen')
        // }  else if(file.type === 'audio/wav') {
        //   this.insertImage(file?.type, this.chatService.dataURL ,file?.name);
        //   console.log('audio hochgeladen')
        // }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  }

  insertImage(dataType: any, dataUrl: string, dataName: any): void {
    this.fileArray.push({
      type: dataType,
      url: dataUrl,
      name: dataName,
    });
  }

  deleteFile(index: number): void {
    this.fileArray.splice(index, 1);
  }

  subscribeToMessages() {
    const currentChannelId = this.channelService.getCurrentChannelId();
    if (currentChannelId) {
      const q = query(
        collection(this.firestore, 'channels', currentChannelId, 'messages')
      );
      onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const messageData = change.doc.data();
            this.channelService.messagesWithAuthors.push(messageData);
          }
        });
      });
    }
  }
}

