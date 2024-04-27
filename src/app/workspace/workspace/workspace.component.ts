import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogCreateChannelComponent } from '../../dialog-create-channel/dialog-create-channel.component';


@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent {
  constructor(public dialog: MatDialog) {}

  openCreateChannelDialog() {
    this.dialog.open(DialogCreateChannelComponent);
  }
}
