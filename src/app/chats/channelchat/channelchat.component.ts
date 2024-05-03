import { Component, OnInit } from '@angular/core';
import { DialogMembersComponent } from '../../dialog-members/dialog-members.component';
import { DialogChannelInfoComponent } from '../../dialog-channel-info/dialog-channel-info.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPeopleComponent } from '../../dialog-add-people/dialog-add-people.component';
import { DialogContactInfoComponent } from '../../dialog-contact-info/dialog-contact-info.component';
import { TextEditorComponent } from '../../shared/text-editor/text-editor.component';
import { ChatService } from '../../services/chat.service';
import { log } from 'console';
import { doc, collection, getDocs } from 'firebase/firestore';
import { NgFor } from '@angular/common';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';

@Component({
  selector: 'app-channelchat',
  standalone: true,
  imports: [TextEditorComponent, NgFor, TimestampPipe],
  templateUrl: './channelchat.component.html',
  styleUrls: ['./channelchat.component.scss', '../chats.component.scss'],
})
export class ChannelchatComponent implements OnInit {
  constructor(public dialog: MatDialog, public chats: ChatService) {}
  messages: any[] = [];

  openMemberDialog() {
    this.dialog.open(DialogMembersComponent);
  }

  openChannelInfoDialog() {
    this.dialog.open(DialogChannelInfoComponent);
  }

  openAddPeopleDialog() {
    this.dialog.open(DialogAddPeopleComponent);
  }

  openContactInfoDialog() {
    this.dialog.open(DialogContactInfoComponent);
  }

  // wird noch verschoben
  async loadMessages() {
    const chatsRef = collection(this.chats.db, 'chats');
    const querySnapshot = await getDocs(chatsRef);

    querySnapshot.forEach((doc) => {
      let message = {
        ...doc.data(), // alle anderen Eigenschaften des Dokuments einfügen
      };
      this.messages.push(message);
    });
    setTimeout(() => {
      console.log('messages', this.messages);
    }, 250);
  }

  ngOnInit(): void {
    this.loadMessages();
  }
}
