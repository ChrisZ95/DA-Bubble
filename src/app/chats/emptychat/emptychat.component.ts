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

  searchUser(input: string) {
    const lowerCaseInput = input.toLowerCase();
    this.filteredUser = this.allUsers.filter((item: any) => {
      return (
        item.username.toLowerCase().includes(lowerCaseInput) &&
        item.uid !== this.firestoreService.currentuid
      );
    });

    console.log('filteredUser', this.filteredUser);
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
