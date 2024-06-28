import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { Firestore, doc, getDoc} from '@angular/fire/firestore';
import { ChannelService } from '../../services/channel.service';
import { FirestoreService } from '../../firestore.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [FormsModule, PickerComponent, CommonModule],
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
})

export class TextEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('fileInput', { static: true })
  fileInput!: ElementRef<HTMLInputElement>;
  @Input() componentName!: string;
  openEmojiPickerChat = false;
  openAssociatedUserChat = false;
  message: string = '';
  comment: string = '';
  currentMessageComments: any[] = [];
  fileArray: any[] = [];
  allUsers: any[] = [];
  memberData: { username: string }[] = [];
  associatedUser: any[] = [];
  currentDocID: any;
  emojiPickerChatSubscription: Subscription | null = null;
  AssociatedUserChatSubscription: Subscription | null = null;
  filteredUsersSubscription: Subscription | null = null;
  documentIDSubsrciption: Subscription | null = null;
  clearTextEditorValueSubcription: Subscription | null = null;
  foundUsers: any;
  cursorPosition: number = 0;
  dropdownStyle: any = {};
  dropdownSingleStyle: any = {};
  memberFullData:any;

  constructor(private elementRef: ElementRef, private chatService: ChatService, private firestore: Firestore, public channelService: ChannelService, private firestoreService: FirestoreService) {}

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.querySelector('textarea').focus();
  }

  ngOnInit(): void {
    this.emojiPickerChatSubscription = this.chatService.emojiPickerChat$.subscribe(
      (state: boolean) => {
        this.openEmojiPickerChat = state;
      }
    );

    this.AssociatedUserChatSubscription = this.chatService.associatedUserChat$.subscribe(
      (state: boolean) => {
        this.openAssociatedUserChat = state;
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
    if (this.emojiPickerChatSubscription) {
      this.emojiPickerChatSubscription.unsubscribe();
    }
    if (this.filteredUsersSubscription) {
      this.filteredUsersSubscription.unsubscribe();
    }
    if (this.AssociatedUserChatSubscription) {
      this.AssociatedUserChatSubscription.unsubscribe();
    }
    if (this.clearTextEditorValueSubcription) {
      this.clearTextEditorValueSubcription.unsubscribe();
    }
    if (this.documentIDSubsrciption) {
      this.documentIDSubsrciption.unsubscribe();
    }
  }

  userMention() {
    // this.filteredUsersSubscription = this.chatService.filteredUsers$.subscribe(
    //   (users) => {
    //     this.filterChatParticipantName(users)
    //   },
    // );
    // this.openUserMention();
    this.allUsers = this.firestoreService.allUsers;
    let otherUser = this.chatService.otherParticipant[0].uid;
    otherUser = [otherUser]
      this.memberFullData = this.allUsers.filter(user => otherUser.includes(user.uid)).map(user => (user));
      this.foundUsers = this.memberFullData.filter((user:any) => user.username.toLowerCase());
      this.message += '@';
    
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
      }
    }
  }

  // cursorPosition: number = 0;
  // searchUserInInput(event: KeyboardEvent) {
  //   const input = (event.target as HTMLTextAreaElement).value;
  //   this.cursorPosition = (event.target as HTMLTextAreaElement).selectionStart;
  //   const lastWord = input.slice(0, this.cursorPosition).split(' ').pop();
  // }

  openUserMention() {
    this.openAssociatedUserChat = true;
    this.chatService.associatedUserChat(true);
  }

  closeuserMention() {
    this.openAssociatedUserChat = false;
    this.chatService.associatedUserChat(false);
  }

  userInserted(user: any) {
    this.message += `@${user}  `;
  }

  addEmoji(event: any) {
    const emoji = event.emoji.native;
    this.message = `${this.message}${emoji}`;
  }

  openEmojiMartPicker() {
    this.openEmojiPickerChat = true;
    this.chatService.emojiPickerChat(true);
  }

  closeEmojiMartPicker() {
    this.openEmojiPickerChat = false;
    this.chatService.emojiPickerChat(false);
  }

  submit() {
    if (
      this.fileArray.length === 0 &&
      (!this.message || this.message.trim().length === 0)
    ) {
    } else {
      if (this.componentName === 'ownChat') {
        this.chatService.sendMessageToDatabase(this.fileArray, this.message, this.currentDocID)
        this.clearInputValue();
      }
      this.chatService.dataURL = null;
      this.openAssociatedUserChat = false;
      this.fileArray = [];
    }
  }

  clearInputValue() {
    this.openEmojiPickerChat = false;
    this.message = '';
    this.fileArray = [];
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  async customDataURL() {
    const fileInput = this.fileInput.nativeElement;
    const file = fileInput.files?.[0];
    this.openAssociatedUserChat = false;
    if (file && (this.fileArray.length) <= 2) {
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
    this.allUsers = this.firestoreService.allUsers;
    let otherUser = this.chatService.otherParticipant[0].uid;
    otherUser = [otherUser]
    this.memberFullData = this.allUsers.filter(user =>  otherUser.includes(user.uid)).map(user => user);   

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
