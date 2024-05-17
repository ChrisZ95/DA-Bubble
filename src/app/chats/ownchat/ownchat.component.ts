import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
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
import { log } from 'console';

@Component({
  selector: 'app-ownchat',
  standalone: true,
  imports: [TextEditorComponent, TimestampPipe, CommonModule],
  templateUrl: './ownchat.component.html',
  styleUrls: ['./ownchat.component.scss', '../chats.component.scss'],
})
export class OwnchatComponent implements OnChanges, OnInit {
  constructor(
    public dialog: MatDialog,
    public chatsService: ChatService,
    private firestore: FirestoreService
  ) {}
  @Input() userDetails: any;
  messages: any[] = [];

  openMemberDialog() {
    this.dialog.open(DialogMembersComponent);
  }

  openChannelInfoDialog() {
    this.dialog.open(DialogChannelInfoComponent);
  }

  openContactInfoDialog() {
    this.dialog.open(DialogContactInfoComponent);
  }

  // let chatInformation = this.chatsService.createChat(userDetails);
  async loadMessages(userDetails: any) {
    this.messages = [];
    const chatsRef = collection(this.chatsService.db, 'chats');
    const querySnapshot = await getDocs(chatsRef);
    console.log('querySnapshot', querySnapshot);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (
        data['chatId'] === userDetails.uid &&
        Array.isArray(data['messages'])
      ) {
        this.messages.push(...data['messages']);
      }
    });

    console.log('Filtered Messages:', this.messages);
  }

  async loadCurrentUser() {
    let allUsers = await this.firestore.getAllUsers();
    let currentUserDetails = allUsers.filter(
      (user) => user.uid == this.firestore.currentuid
    );
    console.log('currentUserDetails', currentUserDetails);
    this.loadMessages(currentUserDetails);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.userDetails != '' && changes['userDetails']) {
      this.loadMessages(this.userDetails);
    }
  }
  ngOnInit(): void {
    this.loadCurrentUser();
  }
}
