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
import { QuillModule } from 'ngx-quill';
import { log } from 'console';

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [FormsModule, QuillModule],
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('fileInput', { static: true })
  fileInput!: ElementRef<HTMLInputElement>;
  message: string = '';

  quillConfig = {
    toolbar: {
      container: [
        ['link', 'image'],
        ['send'], // Custom button
      ],
      handlers: {
        send: this.submit.bind(this), // Bind the sendMessage method to the custom button
      },
    },
  };
  ngAfterViewInit() {
    const customButton = document.querySelector('.ql-send') as HTMLElement;
    if (customButton) {
      customButton.innerHTML = 'Send'; // Change button text to 'Send'
      customButton.style.backgroundColor = '#007bff'; // Set button background color
      customButton.style.color = '#fff'; // Set button text color
      customButton.style.border = 'none'; // Remove button border
      customButton.style.borderRadius = '5px'; // Add border radius
      customButton.style.padding = '5px 10px'; // Add padding
      customButton.style.cursor = 'pointer'; // Add pointer cursor on hover
      customButton.style.marginLeft = '10px'; // Adjust margin if needed
    }
  }
  // ngAfterViewInit() {
  //   // Move the toolbar to the bottom
  //   const editorElement = document.querySelector('.ql-container');
  //   const toolbarElement = document.querySelector('.ql-toolbar');
  //   if (editorElement && toolbarElement) {
  //     editorElement.parentNode?.insertBefore(
  //       toolbarElement,
  //       editorElement.nextSibling
  //     );
  //   }
  // }

  constructor(
    private chatService: ChatService,
    private generateId: GenerateIdsService,
    private firestore: Firestore,
    public channelService: ChannelService,
    private firestoreService: FirestoreService
  ) {}

  @Input() componentName!: string;

  submit() {
    if (this.componentName === 'ownChat') {
      this.sendMessage();
    } else if (this.componentName === 'channel') {
      this.sendMessageToChannel();
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
      };
      this.channelService
        .getAuthorName(currentUid)
        .then((authorName) => {
          const message = {
            ...messageWithoutAuthor,
            authorName: authorName ?? currentUid,
          };
          this.channelService.messagesWithAuthors.push(message);
          this.chatService.sendDataToChannel(currentChannelId, message);
          this.message = '';
        })
        .catch((error) => {
          console.error('Error fetching author name:', error);
        });
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
    const fileInput = this.fileInput.nativeElement;
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
