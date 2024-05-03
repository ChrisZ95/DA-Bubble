import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogCreateChannelComponent } from '../../dialog-create-channel/dialog-create-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { Firestore, onSnapshot, collection, doc } from '@angular/fire/firestore';
import { Channel } from './../../../models/channel.class';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent implements OnInit {
  displayUsers: boolean = true;
  channel = new Channel();
  allChannels: any = [];

  constructor(public dialog: MatDialog, private readonly firestore: Firestore) {
    onSnapshot(collection(this.firestore, 'channels'), (list) => {
      this.allChannels = list.docs.map(doc => doc.data());
    });
  }

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