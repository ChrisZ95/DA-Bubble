import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { FirestoreService } from '../../firestore.service';
import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-emptychat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './emptychat.component.html',
  styleUrls: ['./emptychat.component.scss', '../chats.component.scss'],
})
export class EmptychatComponent implements OnInit {
  constructor(
    private firestoreService: FirestoreService,
    private eRef: ElementRef
  ) {}

  allUsers: any = [];
  allChannels: any = [];
  filteredUser: any;
  filteredEntities: any;
  showDropdown: boolean = false;
  showUserPlaceholder: any;
  showChannelPlaceholder: any;
  showUserChannelPlaceholder: boolean = false;
  selectedUsers: string[] = [];

  searchEntity(input: string) {
    const lowerCaseInput = input.toLowerCase();

    if (input === '') {
      this.filteredEntities = [];
      this.showUserChannelPlaceholder = true;
      this.showUserPlaceholder = false;
      this.showChannelPlaceholder = false;
    } else if (input === '#') {
      this.filteredEntities = [];
      this.showUserPlaceholder = true;
      this.showChannelPlaceholder = false;
      this.showUserChannelPlaceholder = false;
    } else if (input === '@') {
      this.filteredEntities = [];
      this.showUserPlaceholder = false;
      this.showChannelPlaceholder = true;
      this.showUserChannelPlaceholder = false;
    } else if (input.startsWith('#')) {
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
      input === '#' ||
      input === '@';
    console.log('filteredEntities', this.filteredEntities);
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
      ...this.allUsers.filter(
        (user: any) =>
          user.username && user.uid !== this.firestoreService.currentuid
      ),
      ...this.allChannels.filter((channel: any) => channel.name),
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
      return item.username && item.uid !== this.firestoreService.currentuid;
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
      return item.name;
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
    const inputElement = this.eRef.nativeElement.querySelector('input');
    if (entity.username) {
      this.selectedUsers.push(`#${entity.username}`);
      inputElement.value = this.selectedUsers.join(', ');
    } else {
      inputElement.value = `@${entity.name}`;
      this.selectedUsers = [];
    }
    this.showDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  @HostListener('focusin', ['$event'])
  onFocus(event: FocusEvent) {
    if (this.eRef.nativeElement.contains(event.target)) {
      if (
        this.selectedUsers.length === 0 &&
        this.eRef.nativeElement.querySelector('input').value === ''
      ) {
        this.showUserChannelPlaceholder = true;
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

  ngOnInit(): void {
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
}
