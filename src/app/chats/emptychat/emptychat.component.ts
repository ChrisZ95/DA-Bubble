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
  allChannels: any = [];
  filteredUser: any = '';
  filteredEntities: any = '';
  showDropdown: boolean = false;

  searchEntity(input: string) {
    const lowerCaseInput = input.toLowerCase();

    if (input.startsWith('#')) {
      this.filteredEntities = this.allUsers.filter((item: any) => {
        return (
          item.username &&
          item.username.toLowerCase().includes(lowerCaseInput.substring(1)) &&
          item.uid !== this.firestoreService.currentuid
        );
      });
    } else if (input.startsWith('@')) {
      this.filteredEntities = this.allChannels.filter((item: any) => {
        return (
          item.name &&
          item.name.toLowerCase().includes(lowerCaseInput.substring(1))
        );
      });
    } else {
      const users = this.allUsers.filter((item: any) => {
        return (
          item.username &&
          item.username.toLowerCase().includes(lowerCaseInput) &&
          item.uid !== this.firestoreService.currentuid
        );
      });

      const channels = this.allChannels.filter((item: any) => {
        return item.name && item.name.toLowerCase().includes(lowerCaseInput);
      });

      this.filteredEntities = [...users, ...channels];
    }

    this.showDropdown = this.filteredEntities.length > 0;
    console.log('filteredEntities', this.filteredEntities);
  }

  selectEntity(entity: any) {
    const inputElement = this.eRef.nativeElement.querySelector('input');
    if (inputElement) {
      inputElement.value = entity.username
        ? `#${entity.username}`
        : `@${entity.channelname}`;
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
      this.filteredEntities.length > 0 &&
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

    this.firestoreService
      .getAllChannels()
      .then((Channels) => {
        console.log('Channels', Channels);

        this.allChannels = Channels;
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }
}
