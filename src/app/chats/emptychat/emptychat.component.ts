import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TextEditorComponent } from '../../shared/text-editor/text-editor.component';
import { ChipsComponent } from '../../shared/chips/chips.component';
import { FirestoreService } from '../../firestore.service';
import { ChatService } from '../../services/chat.service';
import { ChannelService } from '../../services/channel.service';

@Component({
  selector: 'app-emptychat',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TextEditorComponent,
    MatInputModule,
    ChipsComponent,
    MatFormFieldModule,
  ],
  templateUrl: './emptychat.component.html',
  styleUrls: ['./emptychat.component.scss', '../chats.component.scss'],
})
export class EmptychatComponent implements OnInit {
  @Output() userDetails = new EventEmitter<string>();
  @Output() channelDetails = new EventEmitter<string>();
  @ViewChild('inputRef', { static: false }) inputRef: ElementRef | undefined;
  @ViewChild('dropdownMenu', { static: false }) dropdownMenu:
    | ElementRef
    | undefined;
  filteredEntities: any[] = [];
  allUsers: any[] = [];
  allChannels: any[] = [];
  showDropdown = false;
  focusOnTextEditor = false;

  constructor(
    public firestoreService: FirestoreService,
    public chatService: ChatService,
    public channelService: ChannelService,
    public eRef: ElementRef
  ) {}

  searchEntity(input: string) {
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

  selectEntity(entity: any) {
    if (entity.username) {
      let currentUID = this.firestoreService.currentuid;
      this.userDetails.emit(entity);
      this.filteredEntities = [];
      this.focusOnTextEditor = false;
      this.channelService.showChannelChat = false;
      this.chatService.showOwnChat = true;
      this.chatService.searchChatWithUser(entity.uid);
    } else if (!entity.username) {
      this.channelDetails.emit(entity);
      this.channelService.showChannelChat = true;
      this.chatService.showOwnChat = false;
      this.channelService.getChannelName(entity.channelName);
      this.channelService.getDescription(entity.description);
      this.channelService.getUserName(entity.users);
      this.channelService.getAuthor(entity.author);
    }
    this.chatService.showEmptyChat = false;
    if (this.inputRef) {
      this.inputRef.nativeElement.value = '';
    }
    this.filteredEntities = [];
    this.showDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    this.searchEntity(this.inputRef?.nativeElement.value);
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
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
    this.firestoreService
      .getAllChannels()
      .then((Channels) => {
        this.allChannels = Channels.filter((channel) =>
          channel.users.includes(this.firestoreService.currentuid)
        );
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }

  ngOnInit(): void {}
}

// OLD

// private firestoreService: FirestoreService,
// private eRef: ElementRef,
// private renderer: Renderer2,
// private chatService: ChatService,
// private channelService: ChannelService,
// private firestore: Firestore
// allUsers: any = [];
//   allChannels: any = [];
//   filteredUser: any;
//   filteredEntities: any;
//   showDropdown: boolean = false;
//   showUserPlaceholder: any;
//   selectedUsers: any[] = [];
//   currentUid: any;
//   currentUser: any;
//   shortedUid: any;
//   allParticipants: any;
//   @Output() channelDetails = new EventEmitter<any>();

//   searchEntity(input: string) {
//     let lowerCaseInput = input.toLowerCase().trim();
//     this.filteredEntities = [];
//     if (input === '') {
//       this.filteredEntities = this.allUsers.filter((item: any) => {
//         return (
//           item.username &&
//           (item.username.toLowerCase().includes(lowerCaseInput) ||
//             item.email.toLowerCase().includes(lowerCaseInput)) &&
//           item.uid !== this.firestoreService.currentuid &&
//           !this.selectedUsers.includes(item.uid)
//         );
//       });
//       const channels = this.allChannels.filter((item: any) => {
//         return (
//           item.users.includes(this.firestoreService.currentuid) &&
//           item.channelName.toLowerCase().includes(lowerCaseInput)
//         );
//       });
//       // this.sortUser();
//       const users = this.filteredEntities;
//       this.filteredEntities = [...users, ...channels];
//     } else if (input.startsWith('@')) {
//       lowerCaseInput.replace('@', '');
//       console.log('lowerCaseInput', lowerCaseInput);

//       this.filteredEntities = this.allUsers.filter((item: any) => {
//         return (
//           item.username &&
//           item.username.toLowerCase().includes(lowerCaseInput.substring(1)) &&
//           item.uid !== this.firestoreService.currentuid &&
//           !this.selectedUsers.includes(item.uid)
//         );
//       });
//     } else if (input.startsWith('#')) {
//       this.filteredEntities = this.allChannels.filter((item: any) => {
//         return item.users.includes(this.firestoreService.currentuid);
//       });
//     } else {
//       const users = this.allUsers.filter((item: any) => {
//         return (
//           item.username &&
//           (item.username.toLowerCase().includes(lowerCaseInput) ||
//             item.email.toLowerCase().includes(lowerCaseInput)) &&
//           item.uid !== this.firestoreService.currentuid &&
//           !this.selectedUsers.includes(item.uid)
//         );
//       });
//       this.filteredEntities = [...users];
//     }
//     // this.sortUser();
//   }

//   selectedUserUids: any = [this.firestoreService.currentuid]; //
//   selectEntity(entity: any): void {
//     if (entity.username && !this.selectedUsers.includes(entity.username)) {
//       this.selectedUsers.push(entity);

//       this.filteredEntities = this.filteredEntities.filter((item: any) => {
//         return item.uid != entity.uid;
//       });

//       let currentUID = this.firestoreService.currentuid; //
//       this.selectedUserUids.push(`${entity.uid}`); //
//       this.chatService.allPotentialChatUsers.push(entity);

//       // this.updateInputField();
//     } else if (entity.channelName) {
//       this.selectedUsers = [];
//       this.channelDetails.emit(entity);
//       this.channelService.showChannelChat = true;
//       this.chatService.showOwnChat = false;
//       this.chatService.showEmptyChat = false;
//     }
//   }

//   private blurInputField() {
//     const inputElement = this.eRef.nativeElement.querySelector('input');
//     if (inputElement) {
//       inputElement.blur();
//     }
//   }

//   removeUser(user: any) {
//     this.selectedUsers = this.selectedUsers.filter((item: any) => {
//       return user.uid != item.uid;
//     });
//     this.filteredEntities.push(user);
//     this.sortUser();
//   }

//   sortUser() {
//     this.filteredEntities.sort((a: any, b: any) => {
//       const usernameA = a.username.toLowerCase();
//       const usernameB = b.username.toLowerCase();
//       if (usernameA < usernameB) {
//         return -1;
//       }
//       if (usernameA > usernameB) {
//         return 1;
//       }
//       return 0;
//     });
//   }

//   @HostListener('document:click', ['$event'])
//   clickOutside(event: Event) {
//     const targetElement = event.target as HTMLElement;
//     const clickedInsideInput = this.eRef.nativeElement
//       .querySelector('.inputFieldContainer')
//       ?.contains(targetElement);
//     const clickedInsideDropdown = this.eRef.nativeElement
//       .querySelector('.dropdown-menu')
//       ?.contains(targetElement);
//     if (!clickedInsideInput && !clickedInsideDropdown) {
//       this.showDropdown = false;
//     }
//   }

//   @HostListener('focusin', ['$event'])
//   onFocus(event: FocusEvent) {
//     let focusOnTextEditor = this.chatService.focusOnTextEditor;
//     if (
//       this.eRef.nativeElement.contains(event.target) &&
//       focusOnTextEditor == false
//     ) {
//       if (
//         this.selectedUsers.length === 0 &&
//         this.eRef.nativeElement.querySelector('input').value === ''
//       ) {
//         if (this.filteredEntities == undefined) {
//           this.showUserPlaceholder = true;
//         }
//       }
//       this.showDropdown = true;
//     }
//   }

//   async shortSortUid() {
//     this.selectedUsers.unshift(this.currentUser);
//     const shortedUids = this.selectedUsers.map((user: any) => {
//       return user.uid.substring(0, 5);
//     });
//     this.allParticipants = this.selectedUsers.map((user: any) => {
//       return user.uid;
//     });
//     // Sort the UIDs and join them with a hyphen
//     this.shortedUid = shortedUids.sort().join('-');
//     console.log('selectedUsers', this.selectedUsers);
//     console.log('shortedUid', this.shortedUid);
//     this.createGroupChats();
//   }

//   async createGroupChats() {
//     try {
//       const timestamp = this.firestoreService.createTimeStamp();
//       // Create the main chat document with a specific ID
//       const newDocRef = doc(
//         collection(this.firestore, 'newchats'),
//         this.shortedUid
//       );
//       const chatData = {
//         participants: this.allParticipants,
//         createdAt: timestamp,
//       };
//       await setDoc(newDocRef, chatData);

//       // Create sub-collection for messages within the chat document
//       const messagesCollection = collection(newDocRef, 'messages');
//       const messageDocRef = await addDoc(messagesCollection, {
//         text: 'Willkommen im Chat!',
//         sender: 'System',
//         createdAt: timestamp,
//       });

//       // Create sub-collection for reactions within the message document
//       const emojiReactionsCollection = collection(
//         messageDocRef,
//         'emojiReactions'
//       );
//       await addDoc(emojiReactionsCollection, {
//         emojiIcon: '😊',
//         emojiCounter: 1,
//       });

//       // Create sub-collection for threads within the message document
//       const threadsCollection = collection(messageDocRef, 'threads');
//       await addDoc(threadsCollection, {});

//       console.log('Group chat created successfully');
//     } catch (error: any) {
//       console.error('Fehler beim Erstellen des Chats:', error);
//     }
//   }

//   async loadAndMergeEntitys() {
//     this.currentUid = this.firestoreService.currentuid;
//     this.allUsers = this.firestoreService.allUsers;
//     this.allUsers = this.allUsers.filter((user: any) => {
//       return user.uid != this.currentUid;
//     });
//     this.allUsers.sort((a: any, b: any) => {
//       const usernameA = a.username.toLowerCase();
//       const usernameB = b.username.toLowerCase();
//       if (usernameA < usernameB) {
//         return -1;
//       }
//       if (usernameA > usernameB) {
//         return 1;
//       }
//       return 0;
//     });
//     this.allChannels = this.firestoreService.allChannels;
//     this.allChannels = this.allChannels.filter((channel: any) => {
//       return channel.users.includes(this.currentUid);
//     });
//     this.filteredEntities = [...this.allUsers, ...this.allChannels];
//     let docRef = doc(this.firestore, 'users', this.currentUid);
//     let docSnap = await getDoc(docRef);
//     this.currentUser = docSnap.data();
//   }
