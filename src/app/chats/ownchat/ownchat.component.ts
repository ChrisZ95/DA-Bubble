import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges, OnDestroy,} from '@angular/core';
import { collection, getDocs } from 'firebase/firestore';
import { ChatService } from '../../services/chat.service';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { TextEditorComponent } from '../../shared/text-editor/text-editor.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPeopleComponent } from '../../dialog-add-people/dialog-add-people.component';
import { DialogChannelInfoComponent } from '../../dialog-channel-info/dialog-channel-info.component';
import { DialogContactInfoComponent } from '../../dialog-contact-info/dialog-contact-info.component';
import { DialogMembersComponent } from '../../dialog-members/dialog-members.component';
import { FirestoreService } from '../../firestore.service';
import { ChannelService } from '../../services/channel.service';
import { ThreadService } from '../../services/thread.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'app-ownchat',
  standalone: true,
  imports: [TextEditorComponent, EmojiComponent,  PickerComponent, TimestampPipe, CommonModule, TimestampPipe, FormsModule, MatIconModule, MatMenuModule, MatButtonModule],
  templateUrl: './ownchat.component.html',
  styleUrls: ['./ownchat.component.scss', '../chats.component.scss'],
})
export class OwnchatComponent implements OnChanges, OnInit, OnDestroy {
  constructor(
    public dialog: MatDialog,
    public chatService: ChatService,
    public threadService: ThreadService,
    public firestore: FirestoreService
  ) {}
  @Input() userDetails: any;
  messages: any = [];
  allUsers: any[] = [];
  participants: any;
  filteredUsers: any;
  private messagesSubscription: Subscription | undefined;
  private filteredUsersSubscription: Subscription | undefined;
  // emojiPickerSubscription: Subscription | null = null;
  isHoveredArray: boolean[] = [];
  menuClicked = false;
  currentMessageIndex: number | null = null;
  openEmojiPicker = false;
  message: any;
  emojiMessageId: any;
  foundMessage: any;



  emoji = [
    {
      id: 'white_check_mark',
      name: 'White Heavy Check Mark',
      colons: ':white_check_mark::skin-tone-3:',
      text: '',
      emoticons: [],
      skin: 3,
      native: '✅',
    },
    {
      id: 'raised_hands',
      name: 'Person Raising Both Hands in Celebration',
      colons: ':raised_hands::skin-tone-3:',
      text: '',
      emoticons: [],
      skin: 3,
      native: '🙌',
    }
  ]

  userInformation: any;
  private userDetailsSubscription: Subscription | undefined;

  openEmojiMartPicker(message: { id: number; text: string }) {
    this.emojiMessageId = message.id;
    this.openEmojiPicker = true;
    this.foundMessage = this.messages.find(
      (msg: any) => msg.id === this.emojiMessageId
    );

    if (this.foundMessage) {
      console.log('Found Message:', this.foundMessage);
    } else {
      console.log('Message not found');
    }
    console.log(this.messages);
  }

  getMessageForSpefifiedEmoji(emoji: any, message: { id: number, text: string }) {
    if(emoji === 'white_check_mark' || 'raised_hands') {
      this.emojiMessageId = message.id;
      this.foundMessage = this.messages.find((msg: any) => msg.id === this.emojiMessageId);
      if (this.foundMessage) {
        console.log('Found Message:', this.foundMessage);
      } else {
        console.log('Message not found');
      }
      console.log(this.messages);
      this.addSpecifiedEmoji(emoji)
    }
  }

  setEmojiInData(emojiIcon: any, emojiID: any, currentUserID: any, reaction: any) {
    debugger;
    if (!currentUserID || !reaction) {
      console.log('Nachricht nicht gefunden');
      return;
    }

    if (!reaction.emojiReactions) {
      reaction.emojiReactions = {};
    }
    if (!reaction.emojiReactions[emojiID]) {
      reaction.emojiReactions[emojiID] = {};
    }

    if (!reaction.emojiReactions[emojiID][emojiIcon]) {
      reaction.emojiReactions[emojiID][emojiIcon] = { userId: [], emojiCounter: 0 };
    }

    reaction.emojiReactions[emojiID][emojiIcon].userId.push(currentUserID);
    reaction.emojiReactions[emojiID][emojiIcon].emojiCounter += 1;

    console.log('Aktualisierte Nachricht:', reaction);
    console.log(reaction.emojiReactions);
    this.openEmojiPicker = false;
  }

  getEmojiReactions(message: any) {
    const reactionsArray = [];
    for (const emojiID in message.emojiReactions) {
      if (message.emojiReactions.hasOwnProperty(emojiID)) {
        const emojiReactions = message.emojiReactions[emojiID];
        for (const emojiIcon in emojiReactions) {
          if (emojiReactions.hasOwnProperty(emojiIcon)) {
            reactionsArray.push({
              id: emojiID,
              icon: emojiIcon,
              counter: emojiReactions[emojiIcon].emojiCounter
            });
          }
        }
      }
    }
    return reactionsArray;
  }


  addSpecifiedEmoji(emoji: any) {
    console.log('Emoji selected', event);
    const emojiIcon = emoji.native;
    const emojiID = emoji.id;
    const currentUserID = localStorage.getItem('uid');
    const reaction = this.messages.find((msg: any) => msg.id === this.emojiMessageId);
    this.setEmojiInData(emojiIcon, emojiID, currentUserID, reaction)
}

  addEmoji(event: any) {
      console.log('Emoji selected', event);
      const emojiIcon = event.emoji.native;
      const emojiID = event.emoji.id;
      const currentUserID = localStorage.getItem('uid');
      const reaction = this.messages.find((msg: any) => msg.id === this.emojiMessageId);
      this.setEmojiInData(emojiIcon, emojiID, currentUserID, reaction)
  }

  addReaction() {
    console.log('emoji geklickt');
  }

  closeEmojiMartPicker() {
    this.openEmojiPicker = false;
    // this.chatService.emojiPicker(false);
  }

  openMemberDialog() {
    this.dialog.open(DialogMembersComponent);
  }

  openChannelInfoDialog() {
    this.dialog.open(DialogChannelInfoComponent);
  }

  openContactInfoDialog(userDetails: any) {
    this.dialog.open(DialogContactInfoComponent, {
      data: userDetails,
    });
  }

  openThread(messageInformation: any) {
    let chatDocId = this.chatService.chatDocId;
    this.threadService.displayThread = true;
    this.threadService.getMessage(messageInformation, chatDocId);
  }

  async loadCurrentUser() {
    let allUsers = await this.firestore.getAllUsers();
    let currentUserDetails = allUsers.filter(
      (user) => user.uid == this.firestore.currentuid
    );
    this.chatService.loadMessages(currentUserDetails);
  }

  displayName(id: any) {
    let user = this.allUsers.filter((user: any) => {
      if (id == user.uid) {
        return user;
      }
    });
    return user[0]?.username;
  }

  async loadAllUsers() {
    this.allUsers = await this.chatService.loadUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.userDetails != '' && changes['userDetails']) {
      this.chatService.loadMessages(this.userDetails);
      this.messages = this.chatService.messages;
    }
  }

  ngOnInit(): void {
    this.userDetailsSubscription = this.chatService.userInformation$.subscribe(
      (data) => {
        this.userInformation = data;
        console.log('User details:', this.userInformation);
      }
    );
    this.loadCurrentUser();

    this.messagesSubscription = this.chatService.messages$.subscribe(
      (messages) => {
        this.messages = messages;
      }
    );

    const userDetails = { uid: 'someUserId' };
    this.loadAllUsers();

    this.filteredUsersSubscription = this.chatService.filteredUsers$.subscribe(
      (users) => {
        this.filteredUsers = users;
        console.log(this.filteredUsers);
      }
    );

    // this.emojiPickerSubscription = this.chatService.emojiPicker$.subscribe(
    //   (state: boolean) => {
    //     this.openEmojiPicker = state;
    //   }
    // );
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }

    if (this.filteredUsersSubscription) {
      this.filteredUsersSubscription.unsubscribe();
    }

    if (this.userDetailsSubscription) {
      this.userDetailsSubscription.unsubscribe();
    }
  }

  getMemberAvatar(memberId: string): string {
    const member = this.allUsers.find((user) => user.uid === memberId);
    return member ? member.photo : '';
  }

  shouldShowSeparator(index: number): boolean {
    if (index === 0) {
      return true;
    }
    const currentMessage = this.messages[index];
    const previousMessage = this.messages[index - 1];
    const currentDate = new Date(Number(currentMessage.createdAt));
    const previousDate = new Date(Number(previousMessage.createdAt));
    if (isNaN(currentDate.getTime()) || isNaN(previousDate.getTime())) {
      console.error(
        `Invalid Date - Current Message: ${JSON.stringify(
          currentMessage
        )}, Previous Message: ${JSON.stringify(previousMessage)}`
      );
      return false;
    }
    const currentDateString = currentDate.toDateString();
    const previousDateString = previousDate.toDateString();
    const showSeparator = currentDateString !== previousDateString;
    return showSeparator;
  }

  updateHoverState(index: number, isHovered: boolean) {
    if (!this.menuClicked) {
      this.isHoveredArray[index] = isHovered;
    }
  }

  menuClosed() {
    if (this.currentMessageIndex !== null && !this.menuClicked) {
      this.isHoveredArray[this.currentMessageIndex] = true;
    }
    this.menuClicked = false;
    this.currentMessageIndex = null;
  }

  menuOpened(index: number) {
    this.menuClicked = true;
    this.currentMessageIndex = index;
    this.isHoveredArray[index] = true;
  }
}
