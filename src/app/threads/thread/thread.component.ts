import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [TextEditorComponent],
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.scss', '../threads.component.scss'],
})
export class ThreadComponent implements OnInit {
  constructor(
    public threadService: ThreadService,
    private firestore: Firestore
  ) {}
  private messageInfoSubscription!: Subscription;
  documentID: any;
  messageDetail: any;
  message: any = {};

  closeThreadWindow() {
    this.threadService.displayThread = false;
  }

  async loadMessages() {
    this.threadService.getMessageInformation().subscribe((info) => {
      console.log('info', info);
      this.message = info;
    });
  }

  ngOnInit() {
    this.loadMessages();
  }
}
