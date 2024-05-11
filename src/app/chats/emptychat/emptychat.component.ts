import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../firestore.service';

@Component({
  selector: 'app-emptychat',
  standalone: true,
  imports: [],
  templateUrl: './emptychat.component.html',
  styleUrls: ['./emptychat.component.scss', '../chats.component.scss'],
})
export class EmptychatComponent implements OnInit {
  constructor(private firestoreService: FirestoreService) {}

  allUsers: any = [];
  filteredUser: any = '';

  searchUser(input: any) {
    console.log('input', input);

    const test = this.allUsers.some((item: any) => {
      input.includes(item.username);
    });

    console.log('test', test);
  }

  ngOnInit(): void {
    this.firestoreService
      .getAllUsers()
      .then((users) => {
        this.allUsers = users;
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }
}
