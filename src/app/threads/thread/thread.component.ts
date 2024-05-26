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
import {
  doc,
  setDoc,
  addDoc,
  collection,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [],
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
    this.messageInfoSubscription = this.threadService
      .getMessageInformation()
      .subscribe((docID) => {
        console.log('docID', docID);
        this.documentID = docID;
      });
    const chatDocRef = doc(this.firestore, 'chats', this.documentID);
    const chatDoc = await getDoc(chatDocRef);
    this.messageDetail = chatDoc.data();
    console.log('messageDetail', this.messageDetail);
  }

  ngOnInit() {
    this.loadMessages();
  }
}
