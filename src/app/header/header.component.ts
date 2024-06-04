import { FirestoreService } from './../firestore.service';
import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  Renderer2,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { DialogProfileComponent } from '../dialog-profile/dialog-profile.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { doc, onSnapshot } from 'firebase/firestore';
import { Unsubscribe } from '@angular/fire/firestore';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private firestoreService: FirestoreService,
    private chatService: ChatService,
    private eRef: ElementRef,
    private renderer: Renderer2
  ) {}
  private unsubscribe: Unsubscribe | undefined;
  @Output() userDetails = new EventEmitter<string>();
  @Output() channelDetails = new EventEmitter<string>();
  logInUid: any;
  userForm: any;
  userName: any;
  userPhoto: any;
  userUid: any;
  guestLogIn = false;
  userIsVerified = false;

  allUsers: any = [];
  allChannels: any = [];
  filteredUser: any;
  filteredEntities: any;
  showDropdown: boolean = false;
  showUserPlaceholder: any;
  showChannelPlaceholder: any;

  showUserChannelPlaceholder: boolean = false;
  selectedUsers: string[] = [];
  focusOnTextEditor: boolean = false;

  searchEntity(input: string) {
    const lowerCaseInput = input.toLowerCase().trim();

    if (input === '') {
      this.filteredEntities = [];
      this.showUserChannelPlaceholder = true;
      this.showUserPlaceholder = false;
      this.showChannelPlaceholder = false;
    } else if (input === '@') {
      this.filteredEntities = [];
      this.showUserPlaceholder = true;
      this.showChannelPlaceholder = false;
      this.showUserChannelPlaceholder = false;
    } else if (input === '#') {
      this.filteredEntities = [];
      this.showUserPlaceholder = false;
      this.showChannelPlaceholder = true;
      this.showUserChannelPlaceholder = false;
    } else if (input.startsWith('@')) {
      this.filteredEntities = this.allUsers.filter((item: any) => {
        return (
          item.username &&
          item.username.toLowerCase().includes(lowerCaseInput.substring(1)) &&
          item.uid !== this.firestoreService.currentuid &&
          !this.selectedUsers.includes(`@${item.username}`)
        );
      });
      this.showUserPlaceholder = false;
      this.showChannelPlaceholder = false;
      this.showUserChannelPlaceholder = false;
    } else if (input.startsWith('@')) {
      this.filteredEntities = this.allChannels.filter((item: any) => {
        return (
          item.name &&
          item.name.toLowerCase().includes(lowerCaseInput.substring(1))
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
          item.uid !== this.firestoreService.currentuid &&
          !this.selectedUsers.includes(`@${item.username}`)
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

  updatePlaceholder(input: string) {
    if (input === '') {
      this.showUserChannelPlaceholder = true;
      this.showUserPlaceholder = false;
      this.showChannelPlaceholder = false;
    } else if (input === '#') {
      this.showUserPlaceholder = true;
      this.showChannelPlaceholder = false;
      this.showUserChannelPlaceholder = false;
    } else if (input === '@') {
      this.showUserPlaceholder = false;
      this.showChannelPlaceholder = true;
      this.showUserChannelPlaceholder = false;
    } else {
      this.showUserPlaceholder = false;
      this.showChannelPlaceholder = false;
      this.showUserChannelPlaceholder = false;
    }
    this.showDropdown =
      input === '' ||
      input === '#' ||
      input === '@' ||
      this.filteredEntities.length > 0;
  }

  displayAllUsersAndChannels() {
    this.filteredEntities = [
      ...this.allUsers.filter((user: any) => {
        return (
          user.username &&
          user.uid !== this.firestoreService.currentuid &&
          !this.selectedUsers.includes(`@${user.username}`)
        );
      }),
      ...this.allChannels.filter((channel: any) => channel.channelName),
    ];
    this.showUserChannelPlaceholder = false;
    this.showDropdown = true;

    setTimeout(() => {
      this.focusInputField();
      this.showUserChannelPlaceholder = false;
    }, 0);
  }

  displayAllUsers() {
    this.filteredEntities = this.allUsers.filter((item: any) => {
      return (
        item.username &&
        item.uid !== this.firestoreService.currentuid &&
        !this.selectedUsers.includes(`@${item.username}`)
      );
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

    this.showUserPlaceholder = false;
    this.showChannelPlaceholder = false;
    this.showUserChannelPlaceholder = false;
    this.showDropdown = true;

    setTimeout(() => {
      this.focusInputField();
    }, 0);
  }

  displayAllChannels() {
    this.filteredEntities = this.allChannels.filter((item: any) => {
      return item.channelName;
    });
    this.showUserPlaceholder = false;
    this.showChannelPlaceholder = false;
    this.showUserChannelPlaceholder = false;
    this.showDropdown = true;

    setTimeout(() => {
      this.focusInputField();
    }, 0);
  }
  selectEntity(entity: any) {
    if (entity.username) {
      let currentUID = this.firestoreService.currentuid;
      this.userDetails.emit(entity);
      this.filteredEntities = [];
      this.focusOnTextEditor = false;
    } else if (!entity.username) {
      this.channelDetails.emit(entity);
    }
    this.filteredEntities = undefined;
    this.showDropdown = false;
  }

  private blurInputField() {
    const inputElement = this.eRef.nativeElement.querySelector('input');
    if (inputElement) {
      inputElement.blur();
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }
  // Adrian
  // selectedUser
  @HostListener('focusin', ['$event'])
  onFocus(event: FocusEvent) {
    // let focusOnTextEditor = this.chatService.focusOnTextEditor;
    if (
      this.eRef.nativeElement.contains(event.target) &&
      this.focusOnTextEditor == false
    ) {
      if (
        this.selectedUsers.length === 0 &&
        this.eRef.nativeElement.querySelector('input').value === ''
      ) {
        if (this.filteredEntities == undefined) {
          this.showUserChannelPlaceholder = true;
        }
      }
      this.showDropdown = true;
    }
  }

  private focusInputField() {
    const inputElement = this.eRef.nativeElement.querySelector('input');
    if (inputElement) {
      inputElement.focus();
    }
  }

  async ngOnInit() {
    this.guestLogIn = false;
    const uid = localStorage.getItem('uid');

    const userDocRef = this.firestoreService.getUserDocRef(uid);
    this.unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        this.userForm = { id: doc.id, ...userData };
        this.userName = this.userForm['username'];
        this.userPhoto = this.userForm['photo'];
        this.userUid = this.userForm['uid'];
        this.userIsVerified =
        this.firestoreService.auth.currentUser.emailVerified;

        if (this.userUid === 'qahY57hYK6a7PQfEdc7KRCfUEcQ2') {
          this.guestLogIn = true;
        }
      } else {
        console.log('Das Benutzerdokument existiert nicht.');
      }
    });
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
        this.allChannels = Channels;
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }

  ngOnDestroy() {
    debugger;
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  openProfileDialog() {
    this.dialog.open(DialogProfileComponent);
  }

  logOut() {
    this.router.navigate(['']);
    this.firestoreService.logOut();
  }
}
