import {
  Component,
  OnChanges,
  SimpleChanges,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ChannelService } from '../../services/channel.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { TextEditorComponent } from '../../shared/text-editor/text-editor.component';
import { FirestoreService } from '../../firestore.service';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-channelthread',
  standalone: true,
  imports: [FormsModule, CommonModule, TimestampPipe, TextEditorComponent, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './channelthread.component.html',
  styleUrls: ['./channelthread.component.scss', '../threads.component.scss'],
})
export class ChannelthreadComponent implements OnInit, OnDestroy, OnChanges {
  currentMessageId: string = '';
  currentMessageComments: any[] = [];
  allUsers: any[] = [];
  private channelSubscription: Subscription | null = null;
  currentChannelId: string = '';
  currentMessage: any;
  isHoveredArray: boolean[] = [];
  menuClicked = false;
  currentMessageIndex: number | null = null;
  editingMessageIndex: number | null = null;
  editedMessageText: string = '';

  constructor(
    public channelService: ChannelService,
    public firestoreService: FirestoreService
  ) {}

  closeThreadWindow() {
    this.channelService.showThreadWindow = false;
  }

  async ngOnInit(): Promise<void> {
    this.channelSubscription = this.channelService.currentMessageCommentsChanged.subscribe((comments) => {
      this.currentMessageComments = comments;
    });
    this.currentMessage = this.channelService.getCurrentMessage();
    this.allUsers = await this.firestoreService.getAllUsers();
    this.currentMessageId = this.channelService.getCurrentMessageId();
    this.loadCommentsForCurrentMessage(this.currentMessageId);
  }

  ngOnDestroy(): void {
    if(this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentMessageId']) {
      this.loadCommentsForCurrentMessage(
        changes['currentMessageId'].currentValue
      );
    }
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

  getMemberAvatar(memberId: string): string {
    const member = this.allUsers.find(user => user.uid === memberId);
    return member ? member.photo : '';
  }

  updateHoverState(index: number, isHovered: boolean) {
    if (!this.menuClicked) {
      this.isHoveredArray[index] = isHovered;
    }
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
}