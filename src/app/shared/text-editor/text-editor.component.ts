import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { log } from 'console';

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.scss',
})
export class TextEditorComponent implements OnInit {
  constructor(private chatService: ChatService) {}
  message: any = '';
  generadeId() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000000);
    let uniququeId = `${timestamp}-${random}`;
    uniququeId = uniququeId.toString();
    return uniququeId;
  }
  sendMessage() {
    let text = {
      id: this.generadeId(),
      message: this.message,
      createdAt: 'timestamp',
    };
    this.chatService.sendData(text);
  }
  ngOnInit(): void {}
}
