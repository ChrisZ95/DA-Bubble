import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../firestore.service';
import { User } from '../../../models/user.class';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sign-up-choose-avatar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-up-choose-avatar.component.html',
  styleUrl: './sign-up-choose-avatar.component.scss'
})
export class SignUpChooseAvatarComponent implements OnInit {
  selectedAvatar: string | null = null;
  userName: any;
  userData: any;
  userIconTokenURL: any;
  uid: any;
  iconIndex: any;
  userIcon: any;
  downloadedUserIcon: any;
  showInputInformationUserIcon = false;
  img: any;


  @Output() backToSignUpClicked: EventEmitter<any> = new EventEmitter();
  @Output() accountCreated: EventEmitter<any> = new EventEmitter();
  @Output() onUserRegistered: EventEmitter<any> = new EventEmitter();

  constructor(private firestoreService: FirestoreService) { }

  avatar = ['./../../../assets/images/80. avatar interaction.png',
   './../../../assets/images/80. avatar interaction (1).png',
   './../../../assets/images/80. avatar interaction (2).png',
   './../../../assets/images/80. avatar interaction (3).png',
   './../../../assets/images/80. avatar interaction (4).png',
   './../../../assets/images/80. avatar interaction (5).png',
  ]

  async ngOnInit() {
    this.uid = await this.firestoreService.getUid();
    this.userName = await this.firestoreService.getUserName(this.uid);
    console.log(this.uid);
  }

  async customUserIconURL() {
    debugger
    const fileInput = document.getElementById('profile-picture-input') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      this.iconIndex = 6;
      const icon = file;
      console.log(icon)
      console.log('Name des Bildes',icon.name);
      console.log('Bild wurde erstellt am',icon.lastModified);
      const userIconTokenURL = await this.firestoreService.uploadUserIconIntoStorage(this.uid, icon);
      this.uploadUserIcon(this.uid, userIconTokenURL);
    } else {
      console.log('Kein Bild ausgewählt');
    }
  }

  backToSignUp() {
    this.backToSignUpClicked.emit();
    console.log('back to sign up button continue')
  }

  chooseAvatar(index: number) {
    console.log(index)
    debugger
    this.showInputInformationUserIcon = false;
    this.selectedAvatar = this.avatar[index];
    if (index == 0) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction.png?alt=media&token=90c756bc-d021-4e06-816f-f1b26a431f89'
    } else if (index == 1) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(1).png?alt=media&token=11dbb694-05b7-49cc-81bc-28e98384b66a'
    } else if (index == 2) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(2).png?alt=media&token=98f30010-e7aa-4c39-b4c7-6bd7b38b0ea5'
    } else if (index == 3) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(3).png?alt=media&token=fb4029b9-d972-4d39-97ca-53b1af67fb00'
    } else if (index == 4) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(4).png?alt=media&token=3891c2d7-7435-476c-8db2-b27062a6d9ae'
    } else if (index == 5) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(5).png?alt=media&token=dd0480c1-1af4-49da-b8dc-762a556bb25d'
    }
    console.log('Avatar ausgewählt:', index ,this.userIconTokenURL);
    this.iconIndex = index;
    this.uploadUserIcon(this.uid, this.userIconTokenURL);
  }

  createAccount() {
    this.showInputInformationUserIcon = false;
    debugger
    if ([0, 1, 2, 3, 4, 5, 6].includes(this.iconIndex)) {
      this.accountCreated.emit();
      console.log('account wurde erstellt')
    } else {
      this.showInputInformationUserIcon = true;
      console.log('Bitte ein User Icon wählen');
    }
  }

  async uploadUserIcon(uid: string, userIconTokenURL: any) {
    debugger
    this.userData = await this.firestoreService.uploadUserIconIntoDatabase(uid, userIconTokenURL);
    this.downloadedUserIcon = await  this.firestoreService.downloadUserIcon(uid);
    this.img = document.getElementById('userIcon');
    this.img.setAttribute('src', this.downloadedUserIcon);
    console.log(this.downloadedUserIcon)
  }
}
