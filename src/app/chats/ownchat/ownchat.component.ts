import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { collection, getDocs } from 'firebase/firestore';
import { ChatService } from '../../services/chat.service';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { TextEditorComponent } from '../../shared/text-editor/text-editor.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPeopleComponent } from '../../dialog-add-people/dialog-add-people.component';
import { DialogChannelInfoComponent } from '../../dialog-channel-info/dialog-channel-info.component';
import { DialogContactInfoComponent } from '../../dialog-contact-info/dialog-contact-info.component';
import { DialogMembersComponent } from '../../dialog-members/dialog-members.component';

@Component({
  selector: 'app-ownchat',
  standalone: true,
  imports: [TextEditorComponent, TimestampPipe, CommonModule],
  templateUrl: './ownchat.component.html',
  styleUrls: ['./ownchat.component.scss', '../chats.component.scss'],
})
export class OwnchatComponent implements OnChanges {
  constructor(public dialog: MatDialog, public chatsService: ChatService) {}
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

  async loadMessages(userDetails: any) {
    this.messages = [];
    let chatInformation = this.chatsService.createChat(userDetails);
    const chatsRef = collection(this.chatsService.db, 'chats');
    const querySnapshot = await getDocs(chatsRef);

    querySnapshot.forEach((doc) => {
      let message = {
        ...doc.data(), // alle anderen Eigenschaften des Dokuments einfügen
      };
      this.messages.push(message);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.userDetails != '' && changes['userDetails']) {
      this.loadMessages(this.userDetails);
    }
  }
}
