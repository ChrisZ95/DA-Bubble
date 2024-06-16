import { Component, OnDestroy, OnInit } from '@angular/core';
import { ThreadService } from '../../services/thread.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  Firestore,
  getFirestore,
  onSnapshot,
  DocumentData,
} from '@angular/fire/firestore';
import { TextEditorComponent } from '../../shared/text-editor/text-editor.component';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [CommonModule, TextEditorComponent, TimestampPipe],
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss', '../threads.component.scss'],
})
export class ThreadComponent implements OnInit, OnDestroy {
  constructor(
    public threadService: ThreadService,
    private firestore: Firestore
  ) {}
  private messageInfoSubscription!: Subscription;
  private threadSubscription: Subscription | null = null;
  documentID: any;
  messageDetail: any;
  message: any = {};
  replies: any = [];

  closeThreadWindow() {
    this.threadService.displayThread = false;
  }

  async loadMessages() {

  }

  ngOnInit() {
    this.loadMessages();
  }

  ngOnDestroy(): void {
    if(this.threadSubscription) {
      this.threadSubscription.unsubscribe();
    }
  }
}
