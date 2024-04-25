import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogCreateChannelComponent } from './dialog-create-channel/dialog-create-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatButtonModule, MatMenuModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'DABubble';

  constructor(public dialog: MatDialog) {

  }

  openCreateChannelDialog(){
    this.dialog.open(DialogCreateChannelComponent);
  }
}
