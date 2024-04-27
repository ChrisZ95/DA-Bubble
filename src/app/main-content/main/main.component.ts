import { DialogCreateChannelComponent } from './../../dialog-create-channel/dialog-create-channel.component';
import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { WorkspaceComponent } from '../../workspace/workspace/workspace.component';
import { DialogProfileComponent } from '../../dialog-profile/dialog-profile.component';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    MatMenuModule,
    MatButtonModule,
    RouterOutlet,
    WorkspaceComponent,
    CommonModule,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  animations: [
    trigger('displayWorkspaceTrigger', [
      state(
        'true',
        style({
          width: '30%',
          opacity: 1,
        })
      ),
      state(
        'false',
        style({
          width: '0%',
          opacity: 0,
        })
      ),
      transition('false <=> true', animate('1s linear')),
    ]),
    trigger('isThreadOpenTrigger', [
      state(
        'true',
        style({
          width: '40%',
          opacity: 1,
        })
      ),
      state(
        'false',
        style({
          width: '0%',
          opacity: 0,
        })
      ),
      transition('false <=> true', animate('1s linear')),
    ]),
  ],
})
export class MainComponent {
  constructor(public dialog: MatDialog) {}
  displayWorkspace: boolean = true;

  openCreateChannelDialog() {
    this.dialog.open(DialogCreateChannelComponent);
  }

  openProfileDialog() {
    this.dialog.open(DialogProfileComponent);
  }
  showHideWorkspace() {
    this.displayWorkspace = !this.displayWorkspace;
  }
}
