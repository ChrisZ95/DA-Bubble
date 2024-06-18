import { FirestoreService } from './../../firestore.service';
import { ChatService } from './../../services/chat.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ThreadService } from '../../services/thread.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Firestore, getFirestore, onSnapshot, DocumentData, doc, collection, getDocs, getDoc} from '@angular/fire/firestore';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { TextEditorThreadComponent } from '../../shared/text-editor-thread/text-editor-thread.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { MatDialog } from '@angular/material/dialog';
import { DialogChannelInfoComponent } from '../../dialog-channel-info/dialog-channel-info.component';
import { DialogContactInfoComponent } from '../../dialog-contact-info/dialog-contact-info.component';
import { DialogMembersComponent } from '../../dialog-members/dialog-members.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [CommonModule, TextEditorThreadComponent, TimestampPipe, PickerComponent, EmojiComponent],
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss', '../threads.component.scss'],
})
export class ThreadComponent implements OnInit, OnDestroy {
  constructor( public dialog: MatDialog, private chatService: ChatService, public threadService: ThreadService, private firestore: Firestore, private firestoreService: FirestoreService) {}
  private threadSubscription: Subscription | null = null;
  private threadDocumentIDSubsrciption: Subscription | null = null;
  documentID: any;
  threadsMessages: any [] = [];
  replies: any = [];
  openEmojiPickerThread = false;
  currentUserID: any;
  menuClicked = false;
  isHoveredArray: boolean[] = [];
  isEditingArray: boolean[] = [];
  currentThreadDocID: any;

  ngOnInit() {
    this.loadMessages();
    this.threadService.messageInformation
    this.threadService.chatDocId
    // this.threadsMessages.push(this.threadService.messageInformation)
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
  }

  async loadChatMessages(docID: any) {
    const docRef = doc(this.firestore, "threads", docID);

    onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const messagesRef = collection(this.firestore, "threads", docID, "messages");
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
            }
            const reactionsRef = collection(this.firestore, "threads", docID, "messages", messageData['id'], "emojiReactions");
            const reactionsSnap = await getDocs(reactionsRef);
            const reactions = reactionsSnap.docs.map(doc => doc.data());
            messageData['emojiReactions'] = reactions;
            messagesMap.set(messageData['id'], messageData);

          } else {
            console.error("Invalid timestamp format:", messageData['createdAt']);
          }
        });
        await Promise.all(messagePromises);
        this.threadsMessages = Array.from(messagesMap.values()).sort((a: any, b: any) => a.createdAt - b.createdAt);
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

  shouldShowSeparator(index: number): boolean {
    if (index === 0) {
      return true;
    }
    const currentMessage = this.threadsMessages[index];
    const previousMessage = this.threadsMessages[index - 1];
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

  addEmoji(event: any) {
    // const currentUserID = localStorage.getItem('uid');
    // this.getMessageForSpefifiedEmoji(event.emoji, currentUserID, this.emojiReactionMessageID)
  }

  closeEmojiMartPicker() {
    // this.emojiReactionMessageID = '';
    this.openEmojiPickerThread = false;
    this.chatService.emojiPickerThread(false);
  }


  closeThreadWindow() {
    debugger
    this.threadService.displayThread = false;
  }

  async loadMessages() {

  }
}
