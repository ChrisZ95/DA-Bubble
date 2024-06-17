import { FirestoreService } from './../../firestore.service';
import { ChatService } from './../../services/chat.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ThreadService } from '../../services/thread.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Firestore, getFirestore, onSnapshot, DocumentData,} from '@angular/fire/firestore';
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
  private messageInfoSubscription!: Subscription;
  private threadSubscription: Subscription | null = null;
  documentID: any;
  messageDetail: any [] = [];
  replies: any = [];
  openEmojiPickerThread = false;
  currentUserID: any;
  menuClicked = false;
  isHoveredArray: boolean[] = [];
  messages: any
  isEditingArray: boolean[] = [];

  ngOnInit() {
    this.loadMessages();
    this.threadService.messageInformation
    this.threadService.chatDocId

    this.messageDetail.push(this.threadService.messageInformation)
    console.log(this.messageDetail)

    console.log(this.threadService.messageInformation)
    console.log(this.threadService.chatDocId)
    this.currentUserID = localStorage.getItem('uid')
  }

  ngOnDestroy(): void {
    if(this.threadSubscription) {
      this.threadSubscription.unsubscribe();
    }
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
    this.threadService.displayThread = false;
  }

  async loadMessages() {

  }
}
