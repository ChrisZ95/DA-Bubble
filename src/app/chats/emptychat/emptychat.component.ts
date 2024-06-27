import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, HostListener} from '@angular/core';
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
  imports: [ FormsModule, CommonModule, TextEditorComponent, MatInputModule, ChipsComponent, MatFormFieldModule],
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

  constructor( public firestoreService: FirestoreService, public chatService: ChatService, public channelService: ChannelService, public eRef: ElementRef) {}

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
      this.channelService.getChannelName(entity.channelName);
      this.channelService.getDescription(entity.description);
      this.channelService.getUserName(entity.users);
      this.channelService.getAuthor(entity.author);
      this.openChannelChat(entity.channelId)
    }
    this.chatService.showEmptyChat = false;
    if (this.inputRef) {
      this.inputRef.nativeElement.value = '';
    }
    this.filteredEntities = [];
    this.showDropdown = false;
  }

  openChannelChat(channelId: string) {
    this.channelService.setCurrentChannelId(channelId);
    this.channelService.showChannelChat = true;
    this.chatService.showOwnChat = false;
    this.channelService.showThreadWindow = false;
    this.chatService.clearInputValue(true);
    this.chatService.showEmptyChat = false;
    if (window.innerWidth <= 850) {
      this.firestoreService.displayWorkspace = false;
    }
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
    this.firestoreService
      .getAllChannels()
      .then((Channels) => {
        this.allChannels = Channels.filter((channel) =>
          channel.users.includes(this.firestoreService.currentuid)
        );
      })
  }

  ngOnInit(): void {}
}
