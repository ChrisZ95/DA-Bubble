import { Component, OnInit, ElementRef, ViewChild, OnDestroy, Input, AfterViewChecked } from '@angular/core';
import { DialogMembersComponent } from '../../dialog-members/dialog-members.component';
import { DialogChannelInfoComponent } from '../../dialog-channel-info/dialog-channel-info.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPeopleComponent } from '../../dialog-add-people/dialog-add-people.component';
import { DialogContactInfoComponent } from '../../dialog-contact-info/dialog-contact-info.component';
import { ChatService } from '../../services/chat.service';
import { collection } from 'firebase/firestore';
import { CommonModule, NgFor } from '@angular/common';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { Channel } from './../../../models/channel.class';
import { ChannelService } from '../../services/channel.service';
import { Firestore, onSnapshot, Unsubscribe } from '@angular/fire/firestore';
import { FirestoreService } from '../../firestore.service';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { TextEditorChannelComponent } from '../../shared/text-editor-channel/text-editor-channel.component';

@Component({
  selector: 'app-channelchat',
  standalone: true,
  imports: [TextEditorChannelComponent, NgFor, TimestampPipe, CommonModule, MatButtonModule, MatIconModule, MatMenuModule, FormsModule, CommonModule],
  templateUrl: './channelchat.component.html',
  styleUrls: ['./channelchat.component.scss', '../chats.component.scss'],
})
export class ChannelchatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @Input() userDialogData: any;
  currentChannel: Channel | null = null;
  allChannels: any = [];
  allChats: any = [];
  channel = new Channel();
  selectedChannelName: string | null = null;
  selectedChannelDescription: string | null = null;
  currentChannelId: string = '';
  allUsers: any[] = [];
  currentMessageComments: { id: string, comment: string, createdAt: string }[] = [];
  isHoveredArray: boolean[] = [];
  private channelSubscription: Subscription | undefined;
  menuClicked = false;
  currentMessageIndex: number | null = null;
  editingMessageIndex: number | null = null;
  editedMessageText: string = '';
  userForm: any;
  private channelSnapshotUnsubscribe: Unsubscribe | undefined;
  private chatSnapshotUnsubscribe: Unsubscribe | undefined;
  private unsubscribe: Unsubscribe | undefined;

  constructor(
    public dialog: MatDialog,
    public channelService: ChannelService,
    private readonly firestore: Firestore,
    public firestoreService: FirestoreService,
    public chatService: ChatService
  ) {
    this.channelSnapshotUnsubscribe = onSnapshot(collection(this.firestore, 'channels'), (list) => {
      this.allChannels = list.docs.map((doc) => doc.data());
    });
    this.chatSnapshotUnsubscribe = onSnapshot(collection(this.firestore, 'chats'), (list) => {
      this.allChats = list.docs.map((doc) => doc.data());
    });

    for (let i = 0; i < this.channelService.messages.length; i++) {
      this.isHoveredArray.push(false);
    }
    this.channelSubscription = this.channelService.currentChannelIdChanged.subscribe((channelId: string) => {
      this.onChannelChange(channelId);
    });
  }

  ngOnChanges() {
    this.scrollToBottom();
  }

  updateHoverState(index: number, isHovered: boolean) {
    if (!this.menuClicked) {
      this.isHoveredArray[index] = isHovered;
    }
  }

  openMemberDialog() {
    this.dialog.open(DialogMembersComponent);
  }

  openChannelInfoDialog() {
    this.dialog.open(DialogChannelInfoComponent);
  }

  openAddPeopleDialog() {
    this.dialog.open(DialogAddPeopleComponent);
    this.currentChannelId = this.channelService.getCurrentChannelId();
  }

  openContactInfoDialog(userDetails: any) {
    const userDocRef = this.firestoreService.getUserDocRef(userDetails);
    this.unsubscribe = onSnapshot(userDocRef, (doc) => this.handleUserDocSnapshot(doc));
  }
  
  handleUserDocSnapshot(doc: any) {
    if (doc.exists()) {
      const userData = doc.data();
      this.populateUserForm(doc.id, userData);
      this.setUserDialogData();
      this.openUserDialog();
    }
  }
  
  populateUserForm(id: string, userData: any) {
    this.userForm = { id, ...userData };
  }
  
  setUserDialogData() {
    this.userDialogData = {
      username: this.userForm['username'],
      email: this.userForm['email'],
      photo: this.userForm['photo'],
      uid: this.userForm['uid'],
      logIndate: this.userForm['logIndate'],
      logOutDate: this.userForm['logOutDate'],
      signUpdate: this.userForm['signUpdate'],
      emailVerified: this.firestoreService.auth.currentUser.emailVerified
    };
  }
  
  openUserDialog() {
    this.dialog.open(DialogContactInfoComponent, { data: this.userDialogData });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
  }

  async ngOnInit(): Promise<void> {
    this.currentChannelId = this.channelService.getCurrentChannelId();
    await Promise.all([this.loadChannels(), this.loadUsers(), this.loadMessages()]);
    this.initializeHoverArray();
  }

  async loadChannels(): Promise<void> {
    try {
      this.allChannels = await this.channelService.getChannels();
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  }
  
  async loadUsers(): Promise<void> {
    try {
      this.allUsers = await this.firestoreService.getAllUsers();
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
  
  async loadMessages(): Promise<void> {
    try {
      const messages = await this.channelService.loadMessagesForChannel(this.currentChannelId);
      this.channelService.messagesWithAuthors = await Promise.all(
        messages.map(async (message) => {
          const authorName = await this.channelService.getAuthorName(message.uid);
          return { ...message, authorName };
        })
      );
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }
  
  initializeHoverArray(): void {
    this.isHoveredArray = new Array(this.channelService.messagesWithAuthors.length).fill(false);
  }

  ngOnDestroy() {
    if (this.channelSnapshotUnsubscribe) {
      this.channelSnapshotUnsubscribe();
    }
    if (this.chatSnapshotUnsubscribe) {
      this.chatSnapshotUnsubscribe();
    }
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  async onChannelChange(channelId: string) {
    const messages = await this.channelService.loadMessagesForChannel(channelId);
    this.channelService.messagesWithAuthors = await Promise.all(messages.map(async message => {
      const authorName = await this.channelService.getAuthorName(message.uid);
      return { ...message, authorName };
    }));
  }

  openThreadWindow(message: any, messageId: any) {
    this.channelService.setCurrentMessage(message);
    this.channelService.setCurrentMessageId(messageId);
    this.channelService.showThreadWindow = true;
    if(window.innerWidth <= 850) {
      this.channelService.showChannelChat = false;
    }
  }

  getMemberAvatar(memberId: string): string {
    const member = this.allUsers.find(user => user.uid === memberId);
    return member ? member.photo : '';
  }

  menuClosed() {
    if (this.currentMessageIndex !== null && !this.menuClicked) {
      this.isHoveredArray[this.currentMessageIndex] = true;
    }
    this.menuClicked = false;
    this.currentMessageIndex = null;
  }

  menuOpened(index: number) {
    this.menuClicked = true;
    this.currentMessageIndex = index;
    this.isHoveredArray[index] = true;
  }

  startEditingMessage(index: number, message: string) {
    this.editingMessageIndex = index;
    this.editedMessageText = message;
  }

  saveEditedMessage(index: number) {
    if (this.editedMessageText.trim()) {
      this.channelService.messagesWithAuthors[index].message = this.editedMessageText;
      this.channelService.updateMessage(this.channelService.messagesWithAuthors[index].messageId, this.editedMessageText);
    }
    this.editingMessageIndex = null;
    this.editedMessageText = '';
  }

  cancelEditingMessage() {
    this.editingMessageIndex = null;
    this.editedMessageText = '';
  }

  shouldShowSeparator(index: number): boolean {
    if (index === 0) return true;
    return this.isDifferentDay(index);
  }
  
  isDifferentDay(index: number): boolean {
    const { currentMessage, previousMessage } = this.getMessagesAt(index);
    const { currentDate, previousDate } = this.getDates(currentMessage, previousMessage);
    if (this.isInvalidDate(currentDate, previousDate, currentMessage, previousMessage)) return false;
    return currentDate.toDateString() !== previousDate.toDateString();
  }
  
  getMessagesAt(index: number) {
    return {
      currentMessage: this.channelService.messagesWithAuthors[index],
      previousMessage: this.channelService.messagesWithAuthors[index - 1]
    };
  }
  
  getDates(currentMessage: any, previousMessage: any) {
    return {
      currentDate: new Date(Number(currentMessage.createdAt)),
      previousDate: new Date(Number(previousMessage.createdAt))
    };
  }
  
  isInvalidDate(currentDate: Date, previousDate: Date, currentMessage: any, previousMessage: any): boolean {
    const invalid = isNaN(currentDate.getTime()) || isNaN(previousDate.getTime());
    if (invalid) {
      console.error(`Invalid Date - Current Message: ${JSON.stringify(currentMessage)}, Previous Message: ${JSON.stringify(previousMessage)}`);
    }
    return invalid;
  }
}