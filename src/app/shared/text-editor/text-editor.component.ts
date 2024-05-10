import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { log } from 'console';
import { GenerateIdsService } from '../../services/generate-ids.service';
import { Firestore, doc, collection, addDoc } from '@angular/fire/firestore';
import { ChannelService } from '../../services/channel.service';

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
    private generateId: GenerateIdsService,
    private firestore: Firestore,
    public channelService: ChannelService
  ) {}
  @Input() componentName!: string;

  message: any = '';

  submit() {
    if (this.componentName == 'ownChat') {
      this.sendMessage();
    }
    if (this.componentName == 'channel') {
      this.sendMessageToChannel();
    }
  }

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

  sendMessageToChannel() {
    const currentChannelId = this.channelService.getCurrentChannelId();
    if (currentChannelId) {
      const timestamp: number = Date.now();
      const timestampString: string = timestamp.toString();
      const message = {
        id: this.generateId.generateId(),
        message: this.message,
        createdAt: timestampString,
      };
      this.chatService.sendDataToChannel(currentChannelId, message);

      this.message = '';
    } else {
      console.error('Kein aktueller Kanal ausgewählt.');
      // Fehlerfall, falls kein aktueller Kanal ausgewählt ist
    }
  }

  ngOnInit(): void {
    console.log('componentName', this.componentName);
  }
}
