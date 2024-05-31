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

@Component({
  selector: 'app-channelthread',
  standalone: true,
  imports: [FormsModule, CommonModule, TimestampPipe, TextEditorComponent],
  templateUrl: './channelthread.component.html',
  styleUrls: ['./channelthread.component.scss', '../threads.component.scss'],
})
export class ChannelthreadComponent implements OnInit, OnDestroy, OnChanges {
  currentMessageId: string = '';
  currentMessageComments: any[] = [];
  allUsers: any[] = [];
  private channelSubscription: Subscription | null = null;

  constructor(
    public channelService: ChannelService,
    public firestoreService: FirestoreService
  ) {}

  closeThreadWindow() {
    this.channelService.showThreadWindow = false;
  }

  async ngOnInit(): Promise<void> {
    this.allUsers = await this.firestoreService.getAllUsers();
    this.channelSubscription = this.channelService.currentMessageCommentsChanged.subscribe((comments) => {
      this.currentMessageComments = comments;
    });
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
}
