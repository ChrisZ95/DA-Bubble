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

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [CommonModule, TextEditorThreadComponent, TimestampPipe, PickerComponent, EmojiComponent],
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss', '../threads.component.scss'],
})
export class ThreadComponent implements OnInit, OnDestroy {
  constructor(private chatService: ChatService, public threadService: ThreadService, private firestore: Firestore) {}
  private messageInfoSubscription!: Subscription;
  private threadSubscription: Subscription | null = null;
  documentID: any;
  messageDetail: any [] = [];
  message: any = {};
  replies: any = [];
  openEmojiPickerThread = false;

  ngOnInit() {
    this.loadMessages();
    this.threadService.messageInformation
    this.threadService.chatDocId

    this.messageDetail.push(this.threadService.messageInformation)
    console.log(this.messageDetail)

    console.log(this.threadService.messageInformation)
    console.log(this.threadService.chatDocId)
  }

  ngOnDestroy(): void {
    if(this.threadSubscription) {
      this.threadSubscription.unsubscribe();
    }
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
