import { Component, EventEmitter, OnInit, Output, ViewChild, OnDestroy, Input, OnChanges, SimpleChanges, ChangeDetectorRef, HostListener,ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogCreateChannelComponent } from '../../dialog-create-channel/dialog-create-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Firestore, onSnapshot, collection} from '@angular/fire/firestore';
import { Channel } from './../../../models/channel.class';
import { FirestoreService } from '../../firestore.service';
import { ChannelService } from '../../services/channel.service';
import { ChatService } from '../../services/chat.service';
import { ChannelchatComponent } from '../../chats/channelchat/channelchat.component';
import { IdleService } from '../../services/idle.service';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { TruncateWordsService } from '../../services/truncate-words.service';
import { ThreadService } from '../../services/thread.service';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, TruncatePipe],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild(ChannelchatComponent) channelchatComponent!: ChannelchatComponent;
  @Input() channelDetails: any;
  @Output() userDetails = new EventEmitter<string>();
  @Output() disyplayEmptyChat = new EventEmitter<boolean>();
  @Output() channelsDetails = new EventEmitter<string>();
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
  displayEmptyChat: boolean = false;
  filteredEntities: any = [];
  showChannelPlaceholder: any;
  showUserChannelPlaceholder: boolean = false;
  showUserPlaceholder: any;
  showDropdown: boolean = false;
  focusOnTextEditor: boolean = false;
  unsubscribe: any;

  constructor(private threadService: ThreadService, public truncateService: TruncateWordsService, public dialog: MatDialog, private readonly firestore: Firestore, public firestoreService: FirestoreService, public channelService: ChannelService, public chatService: ChatService, private cdRef: ChangeDetectorRef, public idleService: IdleService, private eRef: ElementRef,
  ) {
    this.unsubscribe = onSnapshot(collection(this.firestore, 'channels'), (list) => {
      this.allChannels = list.docs.map((doc) => doc.data());
      this.filterChannels();
    });
  }
  @ViewChild('inputRef', { static: false }) inputRef: ElementRef | undefined;
  @ViewChild('dropdownMenu', { static: false }) dropdownMenu:
    | ElementRef
    | undefined;

  truncateLimitWorkspace: number = 0;


  searchEntityWorkspace(input: string) {
    const width = window.innerWidth;
    if(width <= 850) {
      const lowerCaseInput = input.toLowerCase().trim();
      this.filteredEntities = [];
      if (input === '') {
        this.displayAllUsersAndChannels();
      } else if (input === '@') {
        this.displayAllUsers();
      } else if (input === '#') {
        this.displayAllChannels();
      } else if (input.startsWith('@')) {
        this.filteredEntities = this.allUsers.filter((item: any) => {
          return (
            item.username &&
            item.username.toLowerCase().includes(lowerCaseInput.substring(1)) &&
            item.uid !== this.firestoreService.currentuid
          );
        });
      } else if (input.startsWith('#')) {
        this.filteredEntities = this.allChannels.filter((channel: any) => {
          return (
            channel.channelName &&
            channel.channelName
              .toLowerCase()
              .includes(lowerCaseInput.substring(1)) &&
            channel.users.includes(this.firestoreService.currentuid)
          );
        });
      } else {
        const users = this.allUsers.filter((item: any) => {
          item.isUser = true;
          return (
            item.username &&
            item.username.toLowerCase().includes(lowerCaseInput) &&
            item.uid !== this.firestoreService.currentuid
          );
        });
        const channels = this.allChannels.filter((item: any) => {
          item.isChannel = true;
          return (
            item.channelName &&
            item.channelName.toLowerCase().includes(lowerCaseInput) &&
            item.users.includes(this.firestoreService.currentuid)
          );
        });

        this.filteredEntities = [...channels, ...users];
      }
      this.showDropdown = true;
    }
  }

  displayAllUsersAndChannels() {
    this.filteredEntities = [
      ...this.allChannels.filter((channel: any) => {
        channel.isChannel = true;
        return channel.users.includes(this.firestoreService.currentuid);
      }),
      ...this.allUsers.filter((user: any) => {
        user.isUser = true;
        return user.username && user.uid !== this.firestoreService.currentuid;
      }),
    ];
    this.showDropdown = true;
  }

  displayAllUsers() {
    this.filteredEntities = this.allUsers.filter((item: any) => {
      item.isUser = true;
      return item.username && item.uid !== this.firestoreService.currentuid;
    });

    this.filteredEntities.sort((a: any, b: any) => {
      const usernameA = a.username.toLowerCase();
      const usernameB = b.username.toLowerCase();
      if (usernameA < usernameB) {
        return -1;
      }
      if (usernameA > usernameB) {
        return 1;
      }
      return 0;
    });
    this.showDropdown = true;
  }

  displayAllChannels() {
    this.filteredEntities = this.allChannels.filter((channel: any) => {
      channel.isChannel = true;
      return channel.users.includes(this.firestoreService.currentuid);
    });
    this.showDropdown = true;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    this.searchEntityWorkspace(this.inputRef?.nativeElement.value);
    const clickedInsideInput =
      this.inputRef?.nativeElement.contains(event.target) || false;
    const clickedInsideDropdown =
      this.dropdownMenu?.nativeElement.contains(event.target) || false;

    if (!clickedInsideInput && !clickedInsideDropdown) {
      this.showDropdown = false;
    }
  }

  @HostListener('focusin', ['$event'])
  onFocus(event: FocusEvent) {
    this.loadAllUsersAndAllChannels();
    const inputValue = this.eRef.nativeElement.querySelector('input').value;
    const isEventTargetInside = this.eRef.nativeElement.contains(event.target);
    const isTextEditorFocused = this.focusOnTextEditor;
    const areFilteredEntitiesEmpty = this.filteredEntities.length === 0;
    if (isEventTargetInside && !isTextEditorFocused) {
      this.showDropdown = true;
    }
  }

  loadAllUsersAndAllChannels() {
    this.firestoreService
      .getAllUsers()
      .then((users) => {
        this.allUsers = users;
      })
    this.firestoreService
      .getAllChannels()
      .then((Channels) => {
        this.allChannels = Channels.filter((channel) =>
          channel.users.includes(this.firestoreService.currentuid)
        );
      })
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const width = (event.target as Window).innerWidth;
    this.truncateLimitWorkspace = this.truncateService.setTruncateLimitWorkspace(width)
  }

  openChannelChat(channelId: string) {
    this.channelService.setCurrentChannelId(channelId);
    this.channelService.showChannelChat = true;
    this.chatService.showOwnChat = false;
    this.channelService.showThreadWindow = false;
    this.chatService.clearInputValue(true);
    this.chatService.showEmptyChat = false;
    this.threadService.displayThread = false;
    if (window.innerWidth <= 850) {
      this.firestoreService.displayWorkspace = false;
    }
  }

  selectEntity(entity: any) {
    if (this.inputRef) {
      this.inputRef.nativeElement.value = '';
    }
    if (entity.username) {
      let currentUID = this.firestoreService.currentuid;
      this.userDetails.emit(entity);
      this.channelService.showChannelChat = false;
      this.chatService.showOwnChat = true;
      this.chatService.searchChatWithUser(entity.uid);
    } else if (!entity.username) {
      this.channelService.getChannelName(entity.channelName);
      this.channelService.getDescription(entity.description);
      this.channelService.getUserName(entity.users);
      this.channelService.getAuthor(entity.author);
      this.openChannelChat(entity.channelId)
    }
    this.filteredEntities = [];
    this.focusOnTextEditor = false;
    this.firestoreService.displayWorkspace = false;
    this.filteredEntities = [];
    this.showDropdown = false;
  }

  ngOnInit(): void {
    this.getallUsers();
    this.truncateLimitWorkspace = this.truncateService.setTruncateLimitWorkspace(window.innerWidth);
    this.channelService.getChannels().then((channels) => {
      this.allChannels = channels;
      this.filterChannels();
    });

    this.userStatus$ = this.idleService.getUserStatus(
      this.firestoreService.currentuid
    );
    this.chatService.checkForExistingChats();
  }

  ngOnDestroy(): void {
    if (this.userStatusSubscription) {
      this.userStatusSubscription.unsubscribe();
    }

    if (this.unsubscribe) {
      this.unsubscribe();
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
      this.displayUsers = false;
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
      this.showChannel = false;
    }
  }

  openEmptyChat() {
    this.displayEmptyChat = true;
    this.chatService.showEmptyChat = true;
    this.chatService.showOwnChat = false;
    this.channelService.showChannelChat = false;
    this.threadService.displayThread = false;
  }

  async openChat(event: Event, user: any) {
    if ((event.target as HTMLElement).tagName.toLowerCase() === 'select') {
      return;
    }
    if (window.innerWidth <= 850) {
      this.firestoreService.displayWorkspace = false;
    }
    this.channelService.showChannelChat = false;
    this.userDetails.emit(user);
    this.chatService.loadUserData(user);
    if (this.currentUid == user.uid) {
      this.chatService.searchPrivateChat(user);
    } else {
      const chatDocID = this.chatService.searchChatWithUser(user.uid);
    }
    this.chatService.clearInputValue(true);
    this.threadService.displayThread = false;
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
      })
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  changeStatus(event: Event) {
    event.stopPropagation();
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
}
