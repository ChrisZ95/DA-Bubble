import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit,Renderer2} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { Firestore } from '@angular/fire/firestore';
import { ChannelService } from '../../services/channel.service';
import { FirestoreService } from '../../firestore.service';
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
export class TextEditorChannelComponent implements OnInit, AfterViewInit {
  @ViewChild('fileInput', { static: true })
  fileInput!: ElementRef<HTMLInputElement>;
  @Input() componentName!: string;
  @ViewChild('textArea') textArea!: ElementRef;
  message: string = '';
  comment: string = '';
  fileArray: any[] = [];
  allUsers: any[] = [];
  memberData: { username: string }[] = [];
  openEmojiPickerChannel = false;
  openAssociatedUser = false;
  emojiPickerChannelSubscription: Subscription | null = null;
  AssociatedUserSubscription: Subscription | null = null;
  filteredUsersSubscription: Subscription | null = null;
  clearTextEditorValueSubcription: Subscription | null = null;
  associatedUser: any;
  currentDocID: any;
  channelDocumentIDSubsrciption: Subscription | null = null;
  foundUsers: any;
  cursorPosition: number = 0;
  dropdownStyle: any = {};
  dropdownSingleStyle: any = {};
  memberFullData:any;

  constructor(private elementRef: ElementRef,private chatService: ChatService, private firestore: Firestore, public channelService: ChannelService, private firestoreService: FirestoreService,private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.querySelector('textarea').focus();
  }

  ngOnInit(): void {
    this.emojiPickerChannelSubscription = this.chatService.emojiPickerChannel$.subscribe(
      (state: boolean) => {
        this.openEmojiPickerChannel = state;
      }
    );
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
    })

    this.channelDocumentIDSubsrciption = this.channelService.currentChannelId$.subscribe(
      (docID)=> {
        this.currentDocID = docID;
      },
    );
  }

  ngOnDestroy(): void {
    if (this.emojiPickerChannelSubscription) {
      this.emojiPickerChannelSubscription.unsubscribe();
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
    this.allUsers = this.firestoreService.allUsers;
    this.memberFullData = this.allUsers.filter(user => this.channelService.UserName.includes(user.uid)).map(user => (user));
    this.foundUsers = this.memberFullData.filter((user:any) => user.username.toLowerCase());
    this.message += '@';
  }

  openUserMention() {
    this.openAssociatedUser = true;
    this.chatService.associatedUserChat(true);
  }

  closeuserMention() {
    this.openAssociatedUser = false;
    this.chatService.associatedUserChat(false);
  }

  userInserted(user: any) {
    this.message += `@${user}  `;
  }

  openEmojiMartPicker() {
    this.openEmojiPickerChannel = true;
    this.chatService.emojiPickerChannel(true);
  }

  closeEmojiMartPicker() {
    this.openEmojiPickerChannel = false;
    this.chatService.emojiPickerChannel(false);
  }

  submit() {
    if (
      this.fileArray.length === 0 &&
      (!this.message || this.message.trim().length === 0)
    ) {
    } else {
      if (this.componentName === 'channel') {
        this.channelService.sendMessageToDatabase(this.fileArray, this.message, this.currentDocID)
        this.clearInputValue();
      }
      this.chatService.dataURL = null;
      this.openAssociatedUser = false;
      this.fileArray = [];
    }
  }

  clearInputValue() {
    this.openEmojiPickerChannel = false;
    this.message = '';
    this.fileArray = [];
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    this.message = `${this.message}${emoji}`;
  }

  sendMessage() {
    this.openEmojiPickerChannel = false;
    this.message = '';
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
        this.insertImage(file?.type, this.chatService.dataURL, file?.name);
      } catch (error) {
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

  searchUserInInput(event: KeyboardEvent): void {
    this.memberFullData = this.allUsers.filter(user => this.channelService.UserName.includes(user.uid)).map(user => user);
    
    const input: string = (event.target as HTMLTextAreaElement).value;
    this.cursorPosition = (event.target as HTMLTextAreaElement).selectionStart;
    const lastWord: string | undefined = input.slice(0, this.cursorPosition).split(' ').pop();

    if (lastWord?.startsWith('@')) {
      const searchText: string = lastWord.slice(1).toLowerCase();
      this.foundUsers = this.memberFullData.filter((user: any) => user.username.toLowerCase().includes(searchText));
    } else {
      this.foundUsers = [];
    }
  }

  selectUser(user: string): void {
    const textarea = this.elementRef.nativeElement.querySelector('textarea');
    const input: string = textarea.value;
    const atIndex = input.lastIndexOf('@');
    if (atIndex !== -1) {
      this.message = this.message.slice(0, atIndex) + `@${user} `;
      textarea.value = input.slice(0, atIndex) + `${user} `;
      this.cursorPosition = textarea.selectionEnd = textarea.value.length;
      this.foundUsers = [];
      textarea.focus();
    }
  }

  onMouseEnter(index: number) {
    this.dropdownSingleStyle[index] = {
      ...this.dropdownSingleStyle[index],
      backgroundColor: '#ffffff'
    };
  }

  onMouseLeave(index: number) {
    this.dropdownSingleStyle[index] = {
      ...this.dropdownSingleStyle[index],
      backgroundColor: '#eceefe'
    };
  }
}

