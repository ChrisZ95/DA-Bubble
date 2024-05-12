import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { FirestoreService } from '../../firestore.service';
import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-emptychat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './emptychat.component.html',
  styleUrls: ['./emptychat.component.scss', '../chats.component.scss'],
})
export class EmptychatComponent implements OnInit {
  constructor(
    private firestoreService: FirestoreService,
    private eRef: ElementRef
  ) {}

  allUsers: any = [];
  filteredUser: any = '';
  showDropdown: boolean = false;

  searchUser(input: string) {
    const lowerCaseInput = input.toLowerCase();
    this.filteredUser = this.allUsers.filter((item: any) => {
      return (
        item.username.toLowerCase().includes(lowerCaseInput) &&
        item.uid !== this.firestoreService.currentuid
      );
    });
    this.showDropdown = this.filteredUser.length > 0;
    console.log('filteredUsers', this.filteredUser);
  }

  selectUser(user: any) {
    const inputElement = this.eRef.nativeElement.querySelector('input');
    if (inputElement) {
      inputElement.value = user.username;
    }
    this.showDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  @HostListener('focusin', ['$event'])
  onFocus(event: FocusEvent) {
    if (
      this.filteredUser.length > 0 &&
      this.eRef.nativeElement.contains(event.target)
    ) {
      this.showDropdown = true;
    }
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
