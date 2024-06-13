import { Component, EventEmitter, OnInit, Output, ViewChild, OnDestroy, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogCreateChannelComponent } from '../../dialog-create-channel/dialog-create-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Firestore, onSnapshot, collection, doc, getDoc} from '@angular/fire/firestore';
import { Channel } from './../../../models/channel.class';
import { FirestoreService } from '../../firestore.service';
import { ChannelService } from '../../services/channel.service';
import { ChatService } from '../../services/chat.service';
import { ChannelchatComponent } from '../../chats/channelchat/channelchat.component';
import { log } from 'console';
import { IdleService } from '../../services/idle.service';
import { GroupchatsService } from '../../services/groupchats.service';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild(ChannelchatComponent) channelchatComponent!: ChannelchatComponent;
  @Input() channelDetails: any;
  @Output() userDetails = new EventEmitter<string>();
  @Output() disyplayEmptyChat = new EventEmitter<boolean>();
  private userStatusSubscription: Subscription | undefined;

  userStatus$: any;
  currentUid: any;
  currentUser: any;
  allChannels: any = [];
  filteredChannels: any[] = [];
  allUsers: any[] = [];
  otherUsers: any = [];
  userStatus: any = 'active';
  displayUsers: boolean = false;
  showChannel = false;
  channel = new Channel();
  selectedChannelName: string | null = null;
  currentChannelId: string = '';

  filteredEntities: any = [];
  showChannelPlaceholder: any;
  showUserChannelPlaceholder: boolean = false;
  showUserPlaceholder: any;
  showDropdown: boolean = false;
  

  constructor( public dialog: MatDialog, private readonly firestore: Firestore, public firestoreService: FirestoreService, public channelService: ChannelService, public chatService: ChatService, private cdRef: ChangeDetectorRef, private idleService: IdleService, private groupService: GroupchatsService) {
    onSnapshot(collection(this.firestore, 'channels'), (list) => {
      this.allChannels = list.docs.map((doc) => doc.data());
      this.filterChannels();
    });
  }

  ngOnInit(): void {
    this.getallUsers();
    this.channelService.getChannels().then((channels) => {
      this.allChannels = channels;
      this.filterChannels();
    });

    this.userStatus$ = this.idleService.getUserStatus(
      this.firestoreService.currentuid
    );
    //Adrian Testfunktion
    this.groupService.displayValue();

    setTimeout(() => {
      this.chatService.checkForExistingChats()
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.userStatusSubscription) {
      this.userStatusSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.channelDetails != '' && changes['channelDetails']) {
      this.cdRef.detectChanges();
      this.openChannelChat(this.channelDetails.channelId);
      this.channelService.getChannelName(this.channelDetails.channelName);
      this.channelService.getDescription(this.channelDetails.description);
      this.channelService.getUserName(this.channelDetails.users);
      this.channelService.getAuthor(this.channelDetails.author);
    }
  }

  showAllChannles() {
    if (this.showChannel) {
      this.showChannel = false;
    } else {
      this.showChannel = true;
    }
  }

  openCreateChannelDialog() {
    this.dialog.open(DialogCreateChannelComponent);
  }

  dropDownMessages() {
    if (this.displayUsers) {
      this.displayUsers = false;
    } else {
      this.displayUsers = true;
    }
  }

  openChannelChat(channelId: string) {
    this.channelService.setCurrentChannelId(channelId);
    this.channelService.showChannelChat = true;
    this.chatService.showOwnChat = false;
    this.channelService.showThreadWindow = false;
    this.chatService.clearInputValue(true);
    if (window.innerWidth <= 850) {
      this.firestoreService.displayWorkspace = false;
    }
  }

  openEmptyChat() {
    this.disyplayEmptyChat.emit(true);
  }

  async openChat(user: any) {
    this.channelService.showChannelChat = false;
    console.log(user);
    this.userDetails.emit(user);
    this.chatService.loadUserData(user);
    if(this.currentUid == user.uid) {
      this.chatService.searchPrivateChat(user)
      console.log('privater chat wird gecheckt')
    } else {
      const chatDocID = this.chatService.searchChatWithUser(user.uid)
      console.log('andere chats werden gecheckt')
    }
    this.chatService.clearInputValue(true);
  }

  getallUsers() {
    this.firestoreService
      .getAllUsers()
      .then((users) => {
        this.allUsers = users;
        this.currentUid = this.firestoreService.currentuid;
        for (let user of this.allUsers) {
          if (user.uid === this.currentUid) {
            this.currentUser = user;
          } else {
            this.otherUsers.push(user);
          }
        }
        if (!this.currentUser) {
          console.error('Current user not found');
        }
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }

  changeStatus(event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value;
    this.idleService.setUserStatus(this.firestoreService.currentuid, newStatus);
  }

  filterChannels() {
    const currentUserId = this.firestoreService.currentuid;
    this.filteredChannels = this.allChannels.filter(
      (channel: Channel) =>
        channel.users && channel.users.includes(currentUserId)
    );
  }

  searchEntity(input: string) {
    const lowerCaseInput = input.toLowerCase().trim();
    this.filteredEntities = [];
    if (input === '') {
      this.showUserChannelPlaceholder = true;
      this.showUserPlaceholder = false;
      this.showChannelPlaceholder = false;
    } else if (input === '@') {
      this.showUserPlaceholder = true;
      this.showChannelPlaceholder = false;
      this.showUserChannelPlaceholder = false;
    } else if (input === '#') {
      this.showUserPlaceholder = false;
      this.showChannelPlaceholder = true;
      this.showUserChannelPlaceholder = false;
    } else if (input.startsWith('@')) {
      this.filteredEntities = this.allUsers.filter((item: any) => {
        return (
          item.username &&
          item.username.toLowerCase().includes(lowerCaseInput.substring(1)) &&
          item.uid !== this.firestoreService.currentuid
        );
      });
      this.showUserPlaceholder = false;
      this.showChannelPlaceholder = false;
      this.showUserChannelPlaceholder = false;
    } else if (input.startsWith('#')) {
      this.filteredEntities = this.allChannels.filter((channel: any) => {
        return (
          channel.channelName &&
          channel.channelName
            .toLowerCase()
            .includes(lowerCaseInput.substring(1))
        );
      });
      this.showUserPlaceholder = false;
      this.showChannelPlaceholder = false;
      this.showUserChannelPlaceholder = false;
    } else {
      const users = this.allUsers.filter((item: any) => {
        return (
          item.username &&
          item.username.toLowerCase().includes(lowerCaseInput) &&
          item.uid !== this.firestoreService.currentuid
        );
      });

      const channels = this.allChannels.filter((item: any) => {
        return item.name && item.name.toLowerCase().includes(lowerCaseInput);
      });

      this.filteredEntities = [...users, ...channels];
      this.showUserPlaceholder = false;
      this.showChannelPlaceholder = false;
      this.showUserChannelPlaceholder = false;
    }

    this.showDropdown =
      this.filteredEntities.length > 0 ||
      input === '' ||
      input === '@' ||
      input === '#';
  }
}