import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Output,
} from '@angular/core';
import { DialogMembersComponent } from '../../dialog-members/dialog-members.component';
import { DialogChannelInfoComponent } from '../../dialog-channel-info/dialog-channel-info.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPeopleComponent } from '../../dialog-add-people/dialog-add-people.component';
import { DialogContactInfoComponent } from '../../dialog-contact-info/dialog-contact-info.component';
import { TextEditorComponent } from '../../shared/text-editor/text-editor.component';
import { ChatService } from '../../services/chat.service';
import { debug, log } from 'console';
import { doc, collection, getDocs } from 'firebase/firestore';
import { CommonModule, NgFor } from '@angular/common';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { Channel } from './../../../models/channel.class';
import { ChannelService } from '../../services/channel.service';
import { Firestore, onSnapshot } from '@angular/fire/firestore';
import { FirestoreService } from '../../firestore.service';
import { query, where, Query, DocumentData } from 'firebase/firestore';
import { EventEmitter } from 'stream';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-channelchat',
  standalone: true,
  imports: [TextEditorComponent, NgFor, TimestampPipe, CommonModule],
  templateUrl: './channelchat.component.html',
  styleUrls: ['./channelchat.component.scss', '../chats.component.scss'],
})
export class ChannelchatComponent implements OnInit, AfterViewInit {
  constructor(
    public dialog: MatDialog,
    public channelService: ChannelService,
    private readonly firestore: Firestore,
    private firestoreService: FirestoreService,
    public chatService: ChatService
  ) {
    onSnapshot(collection(this.firestore, 'channels'), (list) => {
      this.allChannels = list.docs.map((doc) => doc.data());
    });
    onSnapshot(collection(this.firestore, 'chats'), (list) => {
      this.allChats = list.docs.map((doc) => doc.data());
    });
  }

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  currentChannel!: Channel;
  allChannels: any = [];
  allChats: any = [];
  channel = new Channel();
  selectedChannelName: string | null = null;
  selectedChannelDescription: string | null = null;
  currentChannelId: string = '';
  allUsers: any[] = [];
  currentMessageComments: { id: string, comment: string, createdAt: string }[] = [];

  openMemberDialog() {
    this.dialog.open(DialogMembersComponent);
  }

  openChannelInfoDialog() {
    this.dialog.open(DialogChannelInfoComponent);
  }

  openAddPeopleDialog() {
    this.dialog.open(DialogAddPeopleComponent);
    this.currentChannelId = this.channelService.getCurrentChannelId();
  }

  openContactInfoDialog() {
    this.dialog.open(DialogContactInfoComponent);
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll to bottom failed:', err);
    }
  }

  ngOnInit(): void {
    this.currentChannelId = this.channelService.getCurrentChannelId();
    const channelId = this.currentChannelId;
    this.channelService.getChannels().then((channels) => {
      this.allChannels = channels;
      console.log('Channels', channels);
    });
    this.firestoreService.getAllUsers().then(users => {
      this.allUsers = users
    }).catch(error => {
      console.error('Error fetching users:', error);
    });
  }

  openThreadWindow(messageId: string){
    this.channelService.currentMessageId = messageId;
    this.channelService.setCurrentMessageId(messageId);
    this.channelService.showThreadWindow = true;
  }
  
  getMemberAvatar(memberId: string): string {
    const member = this.allUsers.find(user => user.uid === memberId);
    return member ? member.photo : '';
  }
}