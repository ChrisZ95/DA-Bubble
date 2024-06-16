import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild,} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { GenerateIdsService } from '../../services/generate-ids.service';
import { Firestore, collection, onSnapshot, query, doc, getDoc} from '@angular/fire/firestore';
import { ChannelService } from '../../services/channel.service';
import { FirestoreService } from '../../firestore.service';
import { ThreadService } from '../../services/thread.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-text-editor-thread',
  standalone: true,
  imports: [FormsModule, PickerComponent, CommonModule],
  templateUrl: './text-editor-thread.component.html',
  styleUrl: './text-editor-thread.component.scss'
})
export class TextEditorThreadComponent implements OnInit{
  @ViewChild('fileInput', { static: true })
  fileInput!: ElementRef<HTMLInputElement>;
  @Input() componentName!: string;
  openEmojiPicker = false;
  openAssociatedUser = false;
  message: string = '';
  comment: string = '';
  currentMessageComments: any[] = [];
  fileArray: any[] = [];
  allUsers: any[] = [];
  memberData: { username: string }[] = [];
  associatedUser: any[] = [];
  currentDocID: any;
  emojiPickerSubscription: Subscription | null = null;
  AssociatedUserSubscription: Subscription | null = null;
  filteredUsersSubscription: Subscription | null = null;
  documentIDSubsrciption: Subscription | null = null;
  clearTextEditorValueSubcription: Subscription | null = null;

  constructor( private chatService: ChatService, private threadService: ThreadService, private generateId: GenerateIdsService, private firestore: Firestore, public channelService: ChannelService, private firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.emojiPickerSubscription = this.chatService.emojiPicker$.subscribe(
      (state: boolean) => {
        this.openEmojiPicker = state;
      }
    );

    this.AssociatedUserSubscription = this.chatService.associatedUser$.subscribe(
      (state: boolean) => {
        this.openAssociatedUser = state;
      }
    );

    this.clearTextEditorValueSubcription = this.chatService.clearValue$.subscribe(
      (state: boolean) => {
        this.message = '';
        this.fileArray = [];
      }
    );

    this.documentIDSubsrciption = this.chatService.documentID$.subscribe(
      (docID)=> {
        this.currentDocID = docID;
      },
    );
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
    if (this.documentIDSubsrciption) {
      this.documentIDSubsrciption.unsubscribe();
    }
  }

  async userMention() {
    this.filteredUsersSubscription = this.chatService.filteredUsers$.subscribe(
      (users) => {
        this.filterChatParticipantName(users)
      },
    );
    this.openUserMention();
  }

  async filterChatParticipantName(users: any) {
    this.associatedUser = []
    for (let i = 0; i < users.length; i++) {
      const userID = users[i];
      const docRef = doc(this.firestore, "users", userID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
         const user = docSnap.data()
         this.associatedUser.push(user['username']);
      } else {
        console.log("No such document!");
      }
    }
  }

  openUserMention() {
    this.openAssociatedUser = true;
    this.chatService.associatedUser(true);
  }

  closeuserMention() {
    this.openAssociatedUser = false;
    this.chatService.associatedUser(false);
  }

  userInserted(user: any) {
    this.message += `@${user}  `;
  }

  addEmoji(event: any) {
    console.log('Emoji selected', event);
    const emoji = event.emoji.native;
    this.message = `${this.message}${emoji}`;
  }

  openEmojiMartPicker() {
    this.openEmojiPicker = true;
    this.chatService.emojiPicker(true);
  }

  closeEmojiMartPicker() {
    this.openEmojiPicker = false;
    this.chatService.emojiPicker(false);
  }

  submit() {
    if (
      this.fileArray.length === 0 &&
      (!this.message || this.message.trim().length === 0)
    ) {
      console.log('wähle ein bild oder nachricht');
    } else {
      if (this.componentName === 'ownChat') {
        this.chatService.sendMessageToDatabase(this.fileArray, this.message, this.currentDocID)
        this.clearInputValue();
      } else if (this.componentName === 'thread') {
        // this.sendReply();
      } else if (this.componentName === 'channel') {
        // this.sendMessageToChannel();
      } else if (this.componentName === 'channelthread') {
        // this.sendCommentToMessage();
      }
      this.chatService.dataURL = null;
      this.openAssociatedUser = false;
      this.fileArray = [];
    }
  }

  onFocus(event: FocusEvent) {
    if (this.componentName === 'emptyChat') {
      this.chatService.focusOnTextEditor = true;
      this.chatService.showEmptyChat = false;
      this.chatService.showOwnChat = true;
      this.chatService.focusOnTextEditor = false;
    }
  }

  clearInputValue() {
    this.openEmojiPicker = false;
    this.message = '';
    this.fileArray = [];
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  async customDataURL() {
    const fileInput = this.fileInput.nativeElement;
    const file = fileInput.files?.[0];
    this.openAssociatedUser = false;
    if (file && (this.fileArray.length) <= 2) {
      try {
        this.chatService.dataURL =
          await this.firestoreService.uploadDataIntoStorage(file);
        this.insertImage(file?.type, this.chatService.dataURL, file?.name);
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
}
