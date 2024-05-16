import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { log } from 'console';
import { GenerateIdsService } from '../../services/generate-ids.service';
import {
  Firestore,
  doc,
  collection,
  addDoc,
  onSnapshot,
  query,
} from '@angular/fire/firestore';
import { ChannelService } from '../../services/channel.service';
import { FirestoreService } from '../../firestore.service';
import { EventEmitter } from 'stream';

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.scss',
})
export class TextEditorComponent implements OnInit {
  @ViewChild('fileInput', { static: true })
  fileInput!: ElementRef<HTMLInputElement>;
  message: string = '';

  constructor(
    private chatService: ChatService,
    private generateId: GenerateIdsService,
    private firestore: Firestore,
    public channelService: ChannelService,
    private firestoreService: FirestoreService
  ) {}
  @Input() componentName!: string;

  submit() {
    if (this.componentName == 'ownChat') {
      this.sendMessage();
    }
    if (this.componentName == 'channel') {
      this.sendMessageToChannel();
    }
  }
  @HostListener('focusin', ['$event'])
  onFocus(event: FocusEvent) {
    if (this.componentName == 'emptyChat') {
      this.chatService.focusOnTextEditor = true;
      this.chatService.createChatWithUsers();
    }
  }

  sendMessage() {
    this.chatService.sendData(this.message);
    this.message = '';
  }

  sendMessageToChannel() {
    const currentChannelId = this.channelService.getCurrentChannelId();
    const currentUid = this.firestoreService.currentuid;

    if (currentChannelId && currentUid) {
      const timestamp: number = Date.now();
      const timestampString: string = timestamp.toString();
      const message = {
        messageId: this.generateId.generateId(),
        message: this.message,
        createdAt: timestampString,
        uid: currentUid,
      };
      this.chatService.sendDataToChannel(currentChannelId, message);
      this.channelService.messagesWithAuthors.push(message);
      this.message = '';
    } else {
      console.error(
        'Kein aktueller Kanal ausgewählt oder Benutzer nicht angemeldet.'
      );
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  async customDataURL() {
    const fileInput = document.getElementById('data-input') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      try {
        const dataURL = await this.firestoreService.uploadDataIntoStorage(file);
        console.log('dataURL', dataURL);
        this.insertImage(dataURL);
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
