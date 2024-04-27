import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogCreateChannelComponent } from '../../dialog-create-channel/dialog-create-channel.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent implements OnInit {
  constructor(public dialog: MatDialog) {}
  displayUsers: boolean = true;

  openCreateChannelDialog() {
    this.dialog.open(DialogCreateChannelComponent);
  }

  dropDownMessages() {
    this.displayUsers = !this.displayUsers;
  }
  ngOnInit(): void {}

  testUsers: any = [
    {
      fullName: 'qwe',
      avatar: '../../../assets/images/avatar.png',
    },
    {
      fullName: 'asd',
      avatar: '../../../assets/images/avatar.png',
    },
    {
      fullName: 'yxc',
      avatar: '../../../assets/images/avatar.png',
    },
  ];
}


