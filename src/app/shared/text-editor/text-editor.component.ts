import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { log } from 'console';
import { GenerateIdsService } from '../../services/generate-ids.service';

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.scss',
})
export class TextEditorComponent implements OnInit {
  constructor(
    private chatService: ChatService,
    private generateId: GenerateIdsService
  ) {}
  message: any = '';

  sendMessage() {
    const timestamp: number = Date.now();
    const timestampString: string = timestamp.toString();

    let text = {
      id: this.generateId.generateId(),
      message: this.message,
      createdAt: timestampString,
    };
    this.chatService.sendData(text);
    this.message = '';
  }
  ngOnInit(): void {}
}
