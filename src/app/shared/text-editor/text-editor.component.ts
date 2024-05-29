import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { GenerateIdsService } from '../../services/generate-ids.service';
import {
  Firestore,
  collection,
  onSnapshot,
  query,
} from '@angular/fire/firestore';
import { ChannelService } from '../../services/channel.service';
import { FirestoreService } from '../../firestore.service';
import { log } from 'console';
import { ThreadService } from '../../services/thread.service';
@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent implements OnInit {
  @ViewChild('fileInput', { static: true })
  fileInput!: ElementRef<HTMLInputElement>;
  message: string = '';
  comment: string = '';
  currentMessageComments: any[] = [];

  constructor(
    private chatService: ChatService,
    private threadService: ThreadService,
    private generateId: GenerateIdsService,
    private firestore: Firestore,
    public channelService: ChannelService,
    private firestoreService: FirestoreService
  ) {}

  @Input() componentName!: string;

  submit() {
    if (this.componentName === 'ownChat') {
      this.sendMessage();
    } else if (this.componentName === 'thread') {
      this.sendReply();
    } else if (this.componentName === 'channel') {
      this.sendMessageToChannel();
    } else if (this.componentName === 'channelthread') {
      this.sendCommentToMessage();
    }
  }

  @HostListener('focusin', ['$event'])
  onFocus(event: FocusEvent) {
    if (this.componentName === 'emptyChat') {
      this.chatService.focusOnTextEditor = true;
      this.chatService.showEmptyChat = false;
      this.chatService.showOwnChat = true;
      this.chatService.createChatWithUsers();
    }
  }

  sendMessage() {
    this.chatService.sendData(this.message);
    this.message = '';
  }
  
  sendReply() {
    this.threadService.sendReply(this.message);
  }

  sendMessageToChannel() {
    const currentChannelId = this.channelService.getCurrentChannelId();
    const currentUid = this.firestoreService.currentuid;
    if (currentChannelId && currentUid) {
      const timestamp: number = Date.now();
      const timestampString: string = timestamp.toString();
      const messageWithoutAuthor = {
        messageId: this.generateId.generateId(),
        message: this.message,
        createdAt: timestampString,
        uid: currentUid,
        comments: [], 
        commentCount: 0, 
        lastCommentTime: null 
      };
      this.channelService
        .getAuthorName(currentUid)
        .then((authorName) => {
          const message = {
            ...messageWithoutAuthor,
            authorName: authorName ?? currentUid,
          };
          this.channelService.messagesWithAuthors.push(message);
          this.channelService.messages.push(message); 
          this.chatService.sendDataToChannel(currentChannelId, message);
          this.message = '';
        })
        .catch((error) => {
          console.error('Error fetching author name:', error);
        });
    } else {
      console.error('Kein aktueller Kanal ausgewählt oder Benutzer nicht angemeldet.');
    }
  }

  async sendCommentToMessage() {
    const currentMessageId = this.channelService.getCurrentMessageId();
    const currentUid = this.firestoreService.currentuid;
    if (currentMessageId) {
      const timestamp: number = Date.now();
      const timestampString: string = timestamp.toString();
      let newComment: any = {
        id: this.generateId.generateId(),
        comment: this.comment,
        createdAt: timestampString,
        uid: currentUid,
        authorName: '',
        authorNameStatus: 'loading',
      };
      const authorName = await this.channelService.getAuthorName(currentUid);
      newComment.authorName = authorName ?? currentUid;
      newComment.authorNameStatus = 'loaded';
      this.chatService.sendCommentToChannel(currentMessageId, newComment);
      this.channelService.updateMessageInMessagesList(currentMessageId, newComment);
      this.updateCommentCount(currentMessageId);
      this.updateLastCommentTime(currentMessageId, timestampString);
      this.comment = '';
    } else {
      console.error('Kein aktueller Kanal ausgewählt.');
    }
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
      this.channelService.updateMessagesWithAuthors(); // Aktualisieren Sie die messagesWithAuthors Liste
    }
  }

  updateCommentCount(messageId: string): void {
    const message = this.channelService.messages.find(
      (msg) => msg.messageId === messageId
    );
    if (message) {
      message.commentCount++;
      this.channelService.updateMessagesWithAuthors(); // Aktualisieren Sie die messagesWithAuthors Liste
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  async customDataURL() {
    const fileInput = this.fileInput.nativeElement;
    const file = fileInput.files?.[0];
    if (file) {
      try {
        this.chatService.dataURL =
          await this.firestoreService.uploadDataIntoStorage(file);
        console.log('dataURL', this.chatService.dataURL);
        this.insertImage(this.chatService.dataURL);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  }

  insertImage(dataUrl: string): void {
    const imageDisplay = document.getElementById('imageDisplay') as HTMLElement;
    if (imageDisplay) {
      imageDisplay.innerHTML = `<img src="${dataUrl}" style="max-width: 100%; height: auto;">`;
    }
  }

  ngOnInit(): void {
    this.subscribeToMessages();
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