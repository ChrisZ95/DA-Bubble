import { DialogCreateChannelComponent } from './../../dialog-create-channel/dialog-create-channel.component';
import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { WorkspaceComponent } from '../../workspace/workspace/workspace.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, RouterOutlet, WorkspaceComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  constructor(public dialog: MatDialog) {}

  openCreateChannelDialog() {
    this.dialog.open(DialogCreateChannelComponent);
  }
}
