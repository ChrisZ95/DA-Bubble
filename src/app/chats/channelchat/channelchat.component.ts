import { Component, OnInit, ElementRef, ViewChild, OnDestroy, Input, AfterViewChecked } from '@angular/core';
import { DialogMembersComponent } from '../../dialog-members/dialog-members.component';
import { DialogChannelInfoComponent } from '../../dialog-channel-info/dialog-channel-info.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPeopleComponent } from '../../dialog-add-people/dialog-add-people.component';
import { DialogContactInfoComponent } from '../../dialog-contact-info/dialog-contact-info.component';
import { ChatService } from '../../services/chat.service';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'app-channelchat',
  standalone: true,
  imports: [TextEditorChannelComponent, PickerComponent, EmojiComponent, NgFor, TimestampPipe, CommonModule, MatButtonModule, MatIconModule, MatMenuModule, FormsModule, CommonModule],
  templateUrl: './channelchat.component.html',
  styleUrls: ['./channelchat.component.scss', '../chats.component.scss'],
})
export class ChannelchatComponent implements OnInit, OnDestroy {
  constructor( public dialog: MatDialog, public channelService: ChannelService, private readonly firestore: Firestore, public firestoreService: FirestoreService, public chatService: ChatService) {
    this.isEditingArray.push(false);
  }
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
  menuClicked = false;
  currentMessageIndex: number | null = null;
  editingMessageIndex: number | null = null;
  editedMessageText: string = '';
  userForm: any;

  channelDocumentIDSubsrciption: Subscription | null = null;

  currentDocID: any;
  messages: any = [];
  currentUserID:any
  isEditingArray: boolean[] = [];
  openEmojiPickerChannelReaction = false;
  emojiReactionMessageID: any;
  emojiPickerChannelReactionSubscription: Subscription | null = null;

  emoji = [
    {
      id: 'white_check_mark',
      name: 'White Heavy Check Mark',
      colons: ':white_check_mark::skin-tone-3:',
      text: '',
      emoticons: [],
      skin: 3,
      native: '✅',
    },
    {
      id: 'raised_hands',
      name: 'Person Raising Both Hands in Celebration',
      colons: ':raised_hands::skin-tone-3:',
      text: '',
      emoticons: [],
      skin: 3,
      native: '🙌',
    },
  ];

  async ngOnInit(): Promise<void> {
    this.currentChannelId = this.channelService.getCurrentChannelId();
    this.currentUserID = localStorage.getItem('uid');
    console.log(this.currentUserID)
    // await Promise.all([this.loadChannels(), this.loadUsers(), this.loadChannelMessages(this.currentChannelId)]);
    // this.initializeHoverArray();

    this.channelDocumentIDSubsrciption = this.channelService.currentChannelId$.subscribe(
      (channelId)=> {
        console.log(channelId)
        this.messages = []
        this.loadChannelMessages(channelId)
        this.loadUsers()
      },
    );

    this.emojiPickerChannelReactionSubscription = this.chatService.emojiPickerChannelReaction$.subscribe(
      (state: boolean) => {
        this.openEmojiPickerChannelReaction = state;
      }
    );
  }

  ngOnDestroy() {
    if (this.channelDocumentIDSubsrciption) {
      this.channelDocumentIDSubsrciption.unsubscribe();
    }
    if (this.emojiPickerChannelReactionSubscription) {
      this.emojiPickerChannelReactionSubscription.unsubscribe();
    }
  }

  async loadChannelMessages(docID: any) {
    const docRef = doc(this.firestore, "channels", docID);
    this.currentDocID = docID;

    onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const messagesRef = collection(this.firestore, "channels", docID, "messages");
        const reactionsRef = collection(this.firestore, "channels", docID, "messages");
        onSnapshot(messagesRef, async (messagesSnap) => {
        const messagesMap = new Map();
        const messagePromises = messagesSnap.docs.map(async (messageDoc) => {
          let messageData = messageDoc.data();
          messageData['id'] = messageDoc.id;

          if (messageData['createdAt']) {
            if (messageData['senderID']) {
              const senderID = messageData['senderID'];
              const senderData = await this.loadSenderData(senderID);
              messageData['senderName'] = senderData ? senderData.username : "Unknown";
              messageData['senderPhoto'] = senderData ? senderData.photo : null;
              console.log('nachrichten erfolgreich geladen ')
            }
            const reactionsRef = collection(this.firestore, "channels", docID, "messages", messageData['id'], "emojiReactions");
            const reactionsSnap = await getDocs(reactionsRef);
            const reactions = reactionsSnap.docs.map(doc => doc.data());
            messageData['emojiReactions'] = reactions;
            messagesMap.set(messageData['id'], messageData);
            console.log('nachrichten reaktionen erfolgreich geladen ')
          } else {
            console.error("Invalid timestamp format:", messageData['createdAt']);
          }
        });
        await Promise.all(messagePromises);
        this.messages = Array.from(messagesMap.values()).sort((a: any, b: any) => a.createdAt - b.createdAt);
        console.log(this.messages)
      });
      } else {
        console.log("No such document!");
      }
    });
  }

  async loadSenderData(senderID: any) {
    const docRef = doc(this.firestore, "users", senderID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const senderData = docSnap.data();
      return { username: senderData['username'], photo: senderData['photo'] };
    } else {
      console.log("No such document!");
      return null;
    }
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

  async openContactInfoDialog(uid: any) {
    let allUsers = await this.firestoreService.getAllUsers();
    let userDetails = allUsers.filter(
      (user) => user.uid == uid
    );
    this.dialog.open(DialogContactInfoComponent, {
      data: userDetails[0],
    });
  }

  async getMessageForSpefifiedEmoji(emoji: any, currentUserID:any, messageID:any) {
    const emojiReactionID = emoji.id;
    const emojiReactionDocRef = doc( this.firestore, 'newchats', this.currentDocID, 'messages', messageID, 'emojiReactions', emojiReactionID);

    this.uploadNewEmojiReaction(emoji, currentUserID, emojiReactionDocRef)
  }

  async uploadNewEmojiReaction(emoji: any, currentUserID: any, emojiReactionDocRef: any) {
      const docSnapshot = await getDoc(emojiReactionDocRef);

      if (docSnapshot.exists()) {
        const reactionDocData: any = docSnapshot.data();
        reactionDocData.emojiCounter++;
        reactionDocData.reactedBy.push(currentUserID);

        await updateDoc(emojiReactionDocRef, {
          emojiCounter: reactionDocData.emojiCounter,
          reactedBy: reactionDocData.reactedBy
        });
      } else {
        const emojiReactionData = {
          emojiIcon: emoji.native,
          reactedBy: [currentUserID],
          emojiCounter: 1,
          emoji: emoji
        };
        await setDoc(emojiReactionDocRef, emojiReactionData);
      }
      this.loadChannelMessages(this.currentDocID)
    }

    openEmojiMartPicker(messageID: any) {
      this.openEmojiPickerChannelReaction = true;
      this.emojiReactionMessageID = messageID;
      this.chatService.emojiPickerChannelReaction(true);
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

  addEmoji(event: any) {
    // const currentUserID = localStorage.getItem('uid');
    // this.getMessageForSpefifiedEmoji(event.emoji, currentUserID, this.emojiReactionMessageID)
  }

  // async loadMessages(): Promise<void> {
  //   console.log('loadMessages wird aufgerufen')
  //   try {
  //     const messages = await this.channelService.loadMessagesForChannel(this.currentChannelId);
  //     this.channelService.messagesWithAuthors = await Promise.all(
  //       messages.map(async (message) => {
  //         const authorName = await this.channelService.getAuthorName(message.uid);
  //         return { ...message, authorName };
  //       })
  //     );
  //   } catch (error) {
  //     console.error('Error loading messages:', error);
  //   }
  // }

  initializeHoverArray(): void {
    this.isHoveredArray = new Array(this.channelService.messagesWithAuthors.length).fill(false);
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
