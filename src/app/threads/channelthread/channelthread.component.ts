import {
  Component,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ChannelService } from '../../services/channel.service';
import { ChatService } from '../../services/chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GenerateIdsService } from '../../services/generate-ids.service';
import {
  Firestore,
  query,
  collection,
  onSnapshot,
} from '@angular/fire/firestore';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { ChannelchatComponent } from '../../chats/channelchat/channelchat.component';
import { Subscription } from 'rxjs';
import { EventEmitter } from 'node:stream';
import { FirestoreService } from '../../firestore.service';
import { ThreadService } from '../../services/thread.service';
import { TextEditorComponent } from '../../shared/text-editor/text-editor.component';

@Component({
  selector: 'app-channelthread',
  standalone: true,
  imports: [FormsModule, CommonModule, TimestampPipe, TextEditorComponent],
  templateUrl: './channelthread.component.html',
  styleUrls: ['./channelthread.component.scss', '../threads.component.scss'],
})
export class ChannelthreadComponent implements OnChanges {
  channelId: string = '';
  messageId: string = '';
  comments: string[] = [];
  currentChannelId: string = '';
  currentMessageId: string = '';
  currentMessageComments: any[] = [];
  messages: any[] = [];
  allUsers: any[] = [];

  constructor(
    private chatService: ChatService,
    private generateId: GenerateIdsService,
    private firestore: Firestore,
    public channelService: ChannelService,
    public firestoreService: FirestoreService
  ) {}

  closeThreadWindow() {
    this.channelService.showThreadWindow = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentMessageId']) {
      this.loadCommentsForCurrentMessage(
        changes['currentMessageId'].currentValue
      );
    }
  }

  async ngOnInit(): Promise<void> {
    this.allUsers = await this.firestoreService.getAllUsers();
    this.channelService.currentMessageIdChanged.subscribe((messageId) => {
      this.loadCommentsForCurrentMessage(messageId);
    });
    this.currentMessageId = this.channelService.getCurrentMessageId();
    this.loadCommentsForCurrentMessage(this.currentMessageId);
  }

  async loadCommentsForCurrentMessage(messageId: string) {
    const currentMessage = this.channelService.messages.find(
      (message: any) => message.messageId === messageId
    );
    if (currentMessage) {
      if (currentMessage.comments && currentMessage.comments.length > 0) {
        this.currentMessageComments = await Promise.all(
          currentMessage.comments.map(async (comment: any) => {
            const authorName = await this.channelService.getAuthorName(
              comment.uid
            );
            return {
              ...comment,
              authorName: authorName ?? comment.uid,
            };
          })
        );
      } else {
        this.currentMessageComments = [];
      }
    } else {
      this.currentMessageComments = [];
    }
  }
}