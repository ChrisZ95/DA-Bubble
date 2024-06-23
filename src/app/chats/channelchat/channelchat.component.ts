import { Component, OnInit, ElementRef, ViewChild, OnDestroy, Input, AfterViewChecked } from '@angular/core';
import { DialogMembersComponent } from '../../dialog-members/dialog-members.component';
import { DialogChannelInfoComponent } from '../../dialog-channel-info/dialog-channel-info.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPeopleComponent } from '../../dialog-add-people/dialog-add-people.component';
import { DialogContactInfoComponent } from '../../dialog-contact-info/dialog-contact-info.component';
import { ChatService } from '../../services/chat.service';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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
import { ThreadService } from '../../services/thread.service';

@Component({
  selector: 'app-channelchat',
  standalone: true,
  imports: [TextEditorChannelComponent, PickerComponent, EmojiComponent, NgFor, TimestampPipe, CommonModule, MatButtonModule, MatIconModule, MatMenuModule, FormsModule, CommonModule],
  templateUrl: './channelchat.component.html',
  styleUrls: ['./channelchat.component.scss', '../chats.component.scss'],
})
export class ChannelchatComponent implements OnInit, OnDestroy {
  constructor( public dialog: MatDialog, public channelService: ChannelService, private readonly firestore: Firestore, public firestoreService: FirestoreService, public chatService: ChatService, public threadService: ThreadService) {
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
  originalMessageContent = '';

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
    const emojiReactionDocRef = doc( this.firestore, 'channels', this.currentDocID, 'messages', messageID, 'emojiReactions', emojiReactionID);

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

    openThread(message: any) {
      this.threadService.getMessage(message, this.currentDocID);
      this.channelService.lastOpenedChannel = true;
      if(!this.firestoreService.isScreenWide) {
        this.channelService.showChannelChat = false;
      }
    }

    currentTime(currentMessageTime: any): boolean {
      const currentDate = new Date();
      const currentDateMilliseconds = currentDate.getTime();
      const timestampMilliseconds = currentMessageTime;
      const differenceMilliseconds =
        currentDateMilliseconds - timestampMilliseconds;
      const thirtyMinutesMilliseconds = 60 * 24 * 60 * 1000;
      if (differenceMilliseconds <= thirtyMinutesMilliseconds) {
        return true;
      } else {
        return false;
      }
    }

    async addOrDeleteReaction(emoji: any, currentUserID: any, messageID: any) {
      const docRef = doc(this.firestore, "channels", this.currentDocID, "messages", messageID, "emojiReactions", emoji.id);
      const docSnap = await getDoc(docRef)

      const threadDocRef = doc(this.firestore, "channels", this.currentDocID, "messages", messageID);
      const threadDocSnap = await getDoc(threadDocRef)

      if(threadDocSnap.exists()) {
        const messageData = threadDocSnap.data();
        if(messageData) {
          const threadID = messageData['threadID'];
        }
      }

      if (docSnap.exists()) {
          const reactionData = docSnap.data();
          const reactedByArray = reactionData['reactedBy'] || [];

          if (reactedByArray.includes(currentUserID)) {
           console.log('user hat bereits reagiert')
           this.deleteEmojireaction(emoji, currentUserID, messageID)
          } else {
            this.getMessageForSpefifiedEmoji(emoji, currentUserID, messageID)
          }
        }
  }

  async deleteEmojireaction(emoji: any, currentUserID: any, messageID: any) {
    const docRef = doc(this.firestore, "channels", this.currentDocID, "messages", messageID, "emojiReactions", emoji.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const reactionData = docSnap.data();
      reactionData['emojiCounter'] --
      reactionData['reactedBy'].splice(currentUserID)

      await updateDoc(docRef, {
        emojiCounter: reactionData['emojiCounter'],
        reactedBy: reactionData['reactedBy']
      });

      await this.loadChannelMessages(this.currentDocID)
    }
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
    const currentUserID = localStorage.getItem('uid');
    this.getMessageForSpefifiedEmoji(event.emoji, currentUserID, this.emojiReactionMessageID)
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

  menuClosed(index: any) {
    if (this.currentMessageIndex !== null && !this.menuClicked) {
      this.isHoveredArray[this.currentMessageIndex] = true;
    }
    this.menuClicked = false;
    this.currentMessageIndex = null;
    this.chatService.editMessage = true;
    this.chatService.editIndex = index;
  }

  editMessage(index: number) {
    this.originalMessageContent = this.messages[index].message;
    this.isEditingArray[index] = true;
  }

  cancelEdit(index: number) {
    this.messages[index].message = this.originalMessageContent;
    this.isEditingArray[index] = false;
  }

  async saveEdit(index: number, editMessage: any, messageID: any) {
    this.isEditingArray[index] = false;
    const messageDoc = doc( this.firestore, 'channels', this.currentDocID, 'messages', messageID);
    const messageDocSnapshot = await getDoc(messageDoc);

    if(messageDocSnapshot.exists()) {
      await updateDoc(messageDoc, {
        message: editMessage
      });
      this.menuClosed(index)
      await this.loadChannelMessages(this.currentDocID)
    }
  }

  async deleteMessage(index: any, messageID: any) {
    try {
      if (!this.firestore) {
        throw new Error("Firestore instance is not defined.");
      }
      if (!this.currentDocID) {
        throw new Error("CurrentDocID is not defined.");
      }
      if (!messageID) {
        throw new Error("Message ID is not defined.");
      }
      const messageDocRef = doc(this.firestore, 'channels', this.currentDocID, 'messages', messageID);
      const messageDocSnap = await getDoc(messageDocRef);

      if (messageDocSnap.exists()) {
        const messageData = messageDocSnap.data();
        const threadDocRef = doc(this.firestore, 'threads', messageData['threadID']);
        const threadDocSnap = await getDoc(threadDocRef);

        if (threadDocSnap.exists()) {
          const threadMessagesCollectionRef = collection(this.firestore, `threads/${messageData['threadID']}/messages`);
          const threadMessagesSnap = await getDocs(threadMessagesCollectionRef);
          for (const doc of threadMessagesSnap.docs) {
            await deleteDoc(doc.ref);
          }
          await deleteDoc(threadDocRef);
          this.threadService.displayThread = false;
        } else {
          console.log('Thread not found with ID:', messageData['threadID']);
        }
        await deleteDoc(messageDocRef);
      } else {
        console.log('No document found with the ID:', messageID);
      }

      this.menuClosed(index);
    } catch (error) {
      console.error('Error deleting document:', error);
      this.menuClosed(index);
    }
  }


  menuOpened(index: number) {
    this.menuClicked = true;
    this.currentMessageIndex = index;
    this.isHoveredArray[index] = true;
  }

  shouldShowSeparator(index: number): boolean {
    if (index === 0) {
      return true;
    }
    const currentMessage = this.messages[index];
    const previousMessage = this.messages[index - 1];
    const currentDate = new Date(Number(currentMessage.createdAt));
    const previousDate = new Date(Number(previousMessage.createdAt));
    if (isNaN(currentDate.getTime()) || isNaN(previousDate.getTime())) {
      console.error(
        `Invalid Date - Current Message: ${JSON.stringify(
          currentMessage
        )}, Previous Message: ${JSON.stringify(previousMessage)}`
      );
      return false;
    }
    const currentDateString = currentDate.toDateString();
    const previousDateString = previousDate.toDateString();
    const showSeparator = currentDateString !== previousDateString;
    return showSeparator;
  }
}
