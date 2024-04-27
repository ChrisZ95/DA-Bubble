import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent implements OnInit {
  constructor() {}
  displayUsers: boolean = true;

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


