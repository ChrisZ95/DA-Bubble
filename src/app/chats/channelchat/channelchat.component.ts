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

@Component({
  selector: 'app-channelchat',
  standalone: true,
  imports: [TextEditorComponent],
  templateUrl: './channelchat.component.html',
  styleUrls: ['./channelchat.component.scss', '../chats.component.scss'],
})
export class ChannelchatComponent implements OnInit {
  constructor(public dialog: MatDialog, public chats: ChatService) {}
  messages: any;

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
      console.log('Nachricht ID:', doc.id);
      console.log('Nachricht Daten:', doc.data());
    });
  }

  ngOnInit(): void {
    this.loadMessages();
  }
}
