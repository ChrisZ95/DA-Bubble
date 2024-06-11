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
import { TextEditorComponent } from '../../shared/text-editor/text-editor.component';
import { ChatService } from '../../services/chat.service';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-emptychat',
  standalone: true,
  imports: [FormsModule, CommonModule, TextEditorComponent, MatInputModule],
  templateUrl: './emptychat.component.html',
  styleUrls: ['./emptychat.component.scss', '../chats.component.scss'],
})
export class EmptychatComponent implements OnInit {
  constructor(
    private firestoreService: FirestoreService,
    private eRef: ElementRef,
    private renderer: Renderer2,
    private chatService: ChatService
  ) {}

  allUsers: any = [];
  allChannels: any = [];
  filteredUser: any;
  filteredEntities: any;
  showDropdown: boolean = false;
  showUserPlaceholder: any;
  selectedUsers: any[] = [];

  searchEntity(input: string) {
    const lowerCaseInput = input.toLowerCase().trim();

    this.filteredEntities = [];
    if (input === '') {
      this.showUserPlaceholder = true;
    } else if (input.startsWith('@')) {
      this.filteredEntities = this.allUsers.filter((item: any) => {
        return (
          item.username &&
          item.username.toLowerCase().includes(lowerCaseInput.substring(1)) &&
          item.uid !== this.firestoreService.currentuid &&
          !this.selectedUsers.includes(`${item.username}`)
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
    } else {
      const users = this.allUsers.filter((item: any) => {
        return (
          item.username &&
          item.username.toLowerCase().includes(lowerCaseInput) &&
          item.uid !== this.firestoreService.currentuid &&
          !this.selectedUsers.includes(`${item.username}`)
        );
      });
      this.filteredEntities = [...users];
      this.showUserPlaceholder = false;
    }
    this.updatePlaceholder(input);
  }

  updatePlaceholder(input: string) {
    this.showDropdown = input === '' || this.filteredEntities?.length > 0;
  }

  displayAllUsers() {
    this.filteredEntities = this.allUsers.filter((item: any) => {
      return (
        item.username &&
        item.uid !== this.firestoreService.currentuid &&
        !this.selectedUsers.includes(`${item.username}`)
      );
    });
    this.sortUser();

    this.showUserPlaceholder = false;
    this.showDropdown = true;

    setTimeout(() => {
      this.focusInputField();
    }, 0);
  }

  selectedUserUids: any = [this.firestoreService.currentuid]; //
  selectEntity(entity: any) {
    if (entity.username && !this.selectedUsers.includes(entity.username)) {
      this.selectedUsers.push(entity);

      this.filteredEntities = this.filteredEntities.filter((item: any) => {
        return item.uid != entity.uid;
      });

      let currentUID = this.firestoreService.currentuid; //
      this.selectedUserUids.push(`${entity.uid}`); //
      this.chatService.allPotentialChatUsers.push(entity);

      this.updateInputField();
    } else if (!entity.username) {
      const inputElement = this.eRef.nativeElement.querySelector(
        '.inputFieldContainer'
      );
      inputElement.innerHTML = `<span class="channel-tag">#${entity.channelName}</span>`;
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

  removeUser(user: any) {
    this.selectedUsers = this.selectedUsers.filter((item: any) => {
      return user.uid != item.uid;
    });
    this.filteredEntities.push(user);
    this.sortUser();
    this.updateInputField();
    this.blurInputField();
    setTimeout(() => {}, 0);
  }

  sortUser() {
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
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const targetElement = event.target as HTMLElement;
    const clickedInsideInput = this.eRef.nativeElement
      .querySelector('.inputFieldContainer')
      ?.contains(targetElement);
    const clickedInsideDropdown = this.eRef.nativeElement
      .querySelector('.dropdown-menu')
      ?.contains(targetElement);
    if (!clickedInsideInput && !clickedInsideDropdown) {
      this.showDropdown = false;
    }
  }

  @HostListener('focusin', ['$event'])
  onFocus(event: FocusEvent) {
    let focusOnTextEditor = this.chatService.focusOnTextEditor;
    if (
      this.eRef.nativeElement.contains(event.target) &&
      focusOnTextEditor == false
    ) {
      if (
        this.selectedUsers.length === 0 &&
        this.eRef.nativeElement.querySelector('input').value === ''
      ) {
        if (this.filteredEntities == undefined) {
          this.showUserPlaceholder = true;
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

  private updateInputField() {
    const inputElement = this.eRef.nativeElement.querySelector(
      '.inputFieldContainer'
    );
    const htmlString =
      this.selectedUsers
        .map(
          (user, index) =>
            `<div class="user-tag-container"><span class="user-tag">${user.username} <span class="remove-tag">
      <img src="../../../assets/images/close.png" alt="" style="cursor: pointer" class="remove-user" id="remove-user-${index}">
      </span></span> </div>`
        )
        .join('') +
      '<mat-form-field appearance="outline"><input matInput (keyup)="searchEntity(inputRef.value)" (input)="updatePlaceholder(inputRef.value)" #inputRef placeholder="Search users ..." value="" class="inputField"></mat-form-field>';

    inputElement.innerHTML = htmlString;

    const style = document.createElement('style');
    style.textContent = `
  .user-tag-container .user-tag {
    display: inline-flex ;
    align-items: center ;
    background: #e0e0e0 ;
    border-radius: 3px ;
    padding: 2px 5px ;
    margin: 2px ;
    transition: background-color 0.3s ;
  }
  .user-tag-container .user-tag:hover {
    background: #d0d0d0;
  }
`;
    document.head.append(style);

    this.selectedUsers.forEach((user, index) => {
      const removeBtn = this.eRef.nativeElement.querySelector(
        `#remove-user-${index}`
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

// displayAllUsersAndChannels() {
//   this.filteredEntities = [
//     ...this.allUsers.filter((user: any) => {
//       return (
//         user.username &&
//         user.uid !== this.firestoreService.currentuid &&
//         !this.selectedUsers.includes(`@${user.username}`)
//       );
//     }),
//     ...this.allChannels.filter((channel: any) => channel.channelName),
//   ];
//   this.showUserChannelPlaceholder = false;
//   this.showDropdown = true;

//   setTimeout(() => {
//     this.focusInputField();
//     this.showUserChannelPlaceholder = false;
//   }, 0);
// }

// displayAllChannels() {
//   this.filteredEntities = this.allChannels.filter((item: any) => {
//     return item.channelName;
//   });
//   this.showUserPlaceholder = false;
//   this.showChannelPlaceholder = false;
//   this.showUserChannelPlaceholder = false;
//   this.showDropdown = true;

// from UpdatePlaceholder
// if (input === '' || input === '@') {
//   this.showUserPlaceholder = false;
// }
// else if (input === '#') {
//   this.showUserPlaceholder = true;
//   this.showChannelPlaceholder = false;
//   this.showUserChannelPlaceholder = false;
// } else if (input === '@') {
//   this.showUserPlaceholder = false;
//   this.showChannelPlaceholder = true;
//   this.showUserChannelPlaceholder = false;
// } else {
//   this.showUserPlaceholder = false;
//   this.showChannelPlaceholder = false;
//   this.showUserChannelPlaceholder = false;
// }

//   setTimeout(() => {
//     this.focusInputField();
//   }, 0);
// }
