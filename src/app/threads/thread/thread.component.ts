import { ChannelService } from './../../services/channel.service';
import { FirestoreService } from './../../firestore.service';
import { ChatService } from './../../services/chat.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ThreadService } from '../../services/thread.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Firestore, onSnapshot, doc, collection, getDocs, getDoc, updateDoc, setDoc, deleteDoc} from '@angular/fire/firestore';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { TextEditorThreadComponent } from '../../shared/text-editor-thread/text-editor-thread.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { MatDialog } from '@angular/material/dialog';
import { DialogContactInfoComponent } from '../../dialog-contact-info/dialog-contact-info.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [CommonModule, TextEditorThreadComponent, TimestampPipe, PickerComponent, EmojiComponent, FormsModule, MatIconModule, MatMenuModule, MatButtonModule],
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss', '../threads.component.scss'],
})
export class ThreadComponent implements OnInit, OnDestroy {
  constructor( public dialog: MatDialog, private chatService: ChatService, private channelService: ChannelService, public threadService: ThreadService, private firestore: Firestore, public firestoreService: FirestoreService) {}
  private threadSubscription: Subscription | null = null;
  private threadDocumentIDSubsrciption: Subscription | null = null;
  emojiPickerThreadReactionSubscription: Subscription | null = null;
  documentID: any;
  threadsMessages: any [] = [];
  replies: any = [];
  openEmojiPickerThread = false;
  currentUserID: any;
  menuClicked = false;
  isHoveredArray: boolean[] = [];
  isEditingArray: boolean[] = [];
  currentThreadDocID: any;
  openEmojiPickerChatThreadReaction = false;
  emojiReactionThreadMessageID: any;
  currentThreadMessageIndex: number | null = null;
  originalThreadMessageContent = '';
  unsubscribe: any;

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

  ngOnInit() {
    this.emojiPickerThreadReactionSubscription = this.chatService.emojiPickerThreadRection$.subscribe(
      (state: boolean) => {
        this.openEmojiPickerChatThreadReaction = state;
      }
    );
    this.threadService.messageInformation
    this.threadService.chatDocId
    this.currentUserID = localStorage.getItem('uid')

    this.threadDocumentIDSubsrciption = this.threadService.threadDocumentID$.subscribe(
      (docID)=> {
        if(docID) {
          this.currentThreadDocID = docID
          this.loadChatMessages(this.currentThreadDocID)
        }
      },
    );
  }

  ngOnDestroy(): void {
    if(this.threadSubscription) {
      this.threadSubscription.unsubscribe();
    }

    if(this.threadDocumentIDSubsrciption) {
      this.threadDocumentIDSubsrciption.unsubscribe();
    }

    if(this.emojiPickerThreadReactionSubscription) {
      this.emojiPickerThreadReactionSubscription.unsubscribe();
    }

    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  async getMessageForSpefifiedEmoji(emoji: any, currentUserID:any, messageID:any) {
    const emojiReactionID = emoji.id;
    const emojiReactionDocRef = doc( this.firestore, 'threads', this.currentThreadDocID, 'messages', messageID, 'emojiReactions', emojiReactionID);

    this.uploadNewEmojiReaction(emoji, currentUserID, emojiReactionDocRef)
  }

  openEmojiMartPicker(messageID :any) {
    this.openEmojiPickerChatThreadReaction = true;
    this.emojiReactionThreadMessageID = messageID;
    this.chatService.emojiPickerThreadReaction(true);
  }

  closeEmojiMartPicker() {
    this.openEmojiPickerChatThreadReaction = false;
    this.chatService.emojiPickerThreadReaction(false);
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
    this.loadChatMessages(this.currentThreadDocID)
  }

  addEmoji(event: any, messageThreadID: any) {
    const currentUserID = localStorage.getItem('uid');
    this.getMessageForSpefifiedEmoji(event.emoji, currentUserID, this.emojiReactionThreadMessageID)
  }

  async addOrDeleteReaction(emoji: any, currentUserID: any, messageID: any) {
    const docRef = doc(this.firestore, "threads", this.currentThreadDocID, "messages", messageID, "emojiReactions", emoji.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const reactionData = docSnap.data();
        const reactedByArray = reactionData['reactedBy'] || [];

        if (reactedByArray.includes(currentUserID)) {
         this.deleteEmojireaction(emoji, currentUserID, messageID)
        } else {
          this.getMessageForSpefifiedEmoji(emoji, currentUserID, messageID)
        }
      }
}

async deleteEmojireaction(emoji: any, currentUserID: any, messageID: any) {
  const docRef = doc(this.firestore, "threads", this.currentThreadDocID, "messages", messageID, "emojiReactions", emoji.id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const reactionData = docSnap.data();
    reactionData['emojiCounter'] --
    reactionData['reactedBy'].splice(currentUserID)

    await updateDoc(docRef, {
      emojiCounter: reactionData['emojiCounter'],
      reactedBy: reactionData['reactedBy']
    });

    await this.loadChatMessages(this.currentThreadDocID)
  }
}

  async loadChatMessages(docID: any) {
    const docRef = doc(this.firestore, "threads", docID);

    this.unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const messagesRef = collection(this.firestore, "threads", docID, "messages");
        this.unsubscribe = onSnapshot(messagesRef, async (messagesSnap) => {
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
            }
            const reactionsRef = collection(this.firestore, "threads", docID, "messages", messageData['id'], "emojiReactions");
            const reactionsSnap = await getDocs(reactionsRef);
            const reactions = reactionsSnap.docs.map(doc => doc.data());
            messageData['emojiReactions'] = reactions;
            messagesMap.set(messageData['id'], messageData);

          }
        });
        await Promise.all(messagePromises);
        this.threadsMessages = Array.from(messagesMap.values()).sort((a: any, b: any) => a.createdAt - b.createdAt);
      });
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
      return null;
    }
  }

  shouldShowSeparator(index: number): boolean {
    if (index === 0) {
      return true;
    }
    const currentMessage = this.threadsMessages[index];
    const previousMessage = this.threadsMessages[index - 1];
    const currentDate = new Date(Number(currentMessage.createdAt));
    const previousDate = new Date(Number(previousMessage.createdAt));
    if (isNaN(currentDate.getTime()) || isNaN(previousDate.getTime())) {
      return false;
    }
    const currentDateString = currentDate.toDateString();
    const previousDateString = previousDate.toDateString();
    const showSeparator = currentDateString !== previousDateString;
    return showSeparator;
  }

  updateHoverState(index: number, isHovered: boolean) {
    if (!this.menuClicked) {
      this.isHoveredArray[index] = isHovered;
    }
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


  closeThreadWindow() {
    if(this.firestoreService.isScreenWide1300px === false && this.chatService.lastOpenedChat === true) {
     this.chatService.showOwnChat = true
     this.chatService.lastOpenedChat = false;
    } else if (this.firestoreService.isScreenWide1300px === false && this.channelService.lastOpenedChannel === true) {
      this.channelService.showChannelChat = true
      this.channelService.lastOpenedChannel = false;
    }
    this.threadService.displayThread = false;
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

  menuClosed(index: any) {
    if (this.currentThreadMessageIndex !== null && !this.menuClicked) {
      this.isHoveredArray[this.currentThreadMessageIndex] = true;
    }
    this.menuClicked = false;
    this.currentThreadMessageIndex = null;
    this.chatService.editMessage = true;
    this.chatService.editIndex = index;
  }

  menuOpened(index: number, message: any) {
    this.menuClicked = true;
    this.currentThreadMessageIndex = index;
    this.isHoveredArray[index] = true;
  }

  editMessage(index: number) {
    this.originalThreadMessageContent = this.threadsMessages[index].message;
    this.isEditingArray[index] = true;
  }

  async deleteMessage(index: any, messageID: any) {
    try {
        if (!this.firestore) {
            throw new Error("Firestore instance is not defined.");
        }
        if (!this.currentThreadDocID) {
            throw new Error("CurrentDocID is not defined.");
        }
        if (!messageID) {
            throw new Error("Message ID is not defined.");
        }

        const threadDocRef = doc(this.firestore, 'threads', this.currentThreadDocID);
        const threadDocSnap = await getDoc(threadDocRef);

        if (threadDocSnap.exists()) {
            const messageDocRef = doc(this.firestore, `threads/${this.currentThreadDocID}/messages`, messageID);
            const messageDocSnap = await getDoc(messageDocRef);

            if (messageDocSnap.exists()) {
                await deleteDoc(messageDocRef);
            }
        }
        this.menuClosed(index);
    } catch (error: any) {
        this.menuClosed(index);
    }
}


cancelEdit(index: number) {
  this.threadsMessages[index].message = this.originalThreadMessageContent;
  this.isEditingArray[index] = false;
}

async saveEdit(index: number, editMessage: any, messageID: any) {
  this.isEditingArray[index] = false;
  const messageDoc = doc( this.firestore, 'threads', this.currentThreadDocID, 'messages', messageID);
  const messageDocSnapshot = await getDoc(messageDoc);

  if(messageDocSnapshot.exists()) {
    await updateDoc(messageDoc, {
      message: editMessage
    });
    this.menuClosed(index)
    await this.loadChatMessages(this.currentThreadDocID)
  }
}
}
