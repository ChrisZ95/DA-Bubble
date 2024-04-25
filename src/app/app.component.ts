import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogCreateChannelComponent } from './dialog-create-channel/dialog-create-channel.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dabubble';

  constructor(public dialog: MatDialog) {
    
  }

  openCreateChannelDialog(){
    this.dialog.open(DialogCreateChannelComponent);
  }
}