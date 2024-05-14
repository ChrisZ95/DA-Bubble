import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { FirestoreService } from '../../firestore.service';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { log } from 'console';

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
    private eRef: ElementRef,
    private renderer: Renderer2
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
    const lowerCaseInput = input.toLowerCase().trim();

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
          item.uid !== this.firestoreService.currentuid &&
          !this.selectedUsers.includes(`#${item.username}`)
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
          !this.selectedUsers.includes(`#${item.username}`)
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
          user.username &&
          user.uid !== this.firestoreService.currentuid &&
          !this.selectedUsers.includes(`#${user.username}`)
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
      return (
        item.username &&
        item.uid !== this.firestoreService.currentuid &&
        !this.selectedUsers.includes(`#${item.username}`)
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
    console.log('filteredEntities', this.filteredEntities);
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
    if (
      entity.username &&
      !this.selectedUsers.includes(`#${entity.username}`)
    ) {
      this.selectedUsers.push(`#${entity.username}`);
      this.updateInputField();
    } else if (!entity.username) {
      const inputElement = this.eRef.nativeElement.querySelector(
        '.inputFieldContainer'
      );
      inputElement.innerHTML = `<span class="channel-tag">@${entity.name}</span>`;
      this.selectedUsers = [];
    }
    this.showDropdown = false;

    setTimeout(() => {
      this.blurInputField();
    }, 0);
  }

  private blurInputField() {
    const inputElement = this.eRef.nativeElement.querySelector('input');
    if (inputElement) {
      inputElement.blur();
    }
  }

  removeUser(user: string) {
    console.log('removed');
    this.selectedUsers = this.selectedUsers.filter((u) => u !== user);
    this.updateInputField();
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

  private updateInputField() {
    const inputElement = this.eRef.nativeElement.querySelector(
      '.inputFieldContainer'
    );
    const htmlString =
      this.selectedUsers
        .map(
          (user) =>
            `<span class="user-tag">${user} <span class="remove-tag">
      <img src="../../../assets/images/close.png" alt="" style="cursor: pointer;">
      </span></span>`
        )
        .join('') + '<input type="text" class="inputField" />';

    inputElement.innerHTML = htmlString;

    this.selectedUsers.forEach((user) => {
      const removeBtn = this.eRef.nativeElement.querySelector(
        `.user-tag:last-child .remove-tag img`
      );
      this.renderer.listen(removeBtn, 'click', () => this.removeUser(user));
    });

    const inputField = this.eRef.nativeElement.querySelector('.inputField');
    this.renderer.listen(inputField, 'keyup', (event) =>
      this.searchEntity(event.target.value)
    );
    this.renderer.listen(inputField, 'input', (event) =>
      this.updatePlaceholder(event.target.value)
    );

    this.focusInputField();
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
