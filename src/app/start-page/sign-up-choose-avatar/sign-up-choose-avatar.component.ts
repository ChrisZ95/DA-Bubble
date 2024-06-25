import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../firestore.service';
import { User } from '../../../models/user.class';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-sign-up-choose-avatar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './sign-up-choose-avatar.component.html',
  styleUrl: './sign-up-choose-avatar.component.scss'
})
export class SignUpChooseAvatarComponent implements OnInit {
  selectedAvatar: string | null = null;
  userForm: any;
  userName: any;
  userEmail: any;
  userPassword: any;
  userData: any;
  userIconTokenURL: any;
  uid: any;
  iconIndex: any;
  userIcon: any;
  downloadedUserIcon: any;
  showInputInformationUserIcon = false;
  img: any;
  imageSelected: boolean = false;
  imageSrc:any;
  loadingScreen = false;


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
    this.loadingScreen = false;
    this.uid = await this.firestoreService.getUid();
    console.log(this.uid);
    this.userForm = await this.firestoreService.getUserData(this.uid)
    this.userName = this.userForm['username']
    this.userEmail = this.userForm['email']
    this.userPassword = this.userForm['password']
    console.log('username header (localstorage)',this.userForm['username']);
  }

  async onImageSelected(event: any):Promise<void> {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageSrc = e.target?.result;
        this.imageSelected = true;
        this.iconIndex = 6;
        const icon = file;
        console.log(icon)
        console.log('Name des Bildes',icon.name);
        console.log('Bild wurde erstellt am',icon.lastModified);
      };
      reader.readAsDataURL(file);
      const icon = file;
      const userIconTokenURL = await this.firestoreService.uploadUserIconIntoStorage(this.uid, icon);
      await this.uploadUserIconCustom(this.uid, userIconTokenURL);
    }
  }

  backToSignUp() {
    this.backToSignUpClicked.emit();
    console.log('back to sign up button continue')
  }

  chooseAvatar(index: number) {
    console.log(index)
    this.showInputInformationUserIcon = false;
    this.selectedAvatar = this.avatar[index];
    if (index == 0) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/da181-db3ce.appspot.com/o/user-icon%2F80.%20avatar%20interaction.png?alt=media&token=d1e4d7b5-7d23-4f22-b444-5af815e54cc0'
    } else if (index == 1) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(1).png?alt=media&token=d4ce52b2-3bc9-48fd-9021-912002d298ee'
    } else if (index == 2) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/da181-db3ce.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(2).png?alt=media&token=5f7c9f16-eb33-4319-a3df-11e4fb515415'
    } else if (index == 3) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/da181-db3ce.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(3).png?alt=media&token=1cbd3b9d-18dc-4476-815a-30c1def0c0ba'
    } else if (index == 4) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/da181-db3ce.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(4).png?alt=media&token=49f19eed-8e39-4e4e-8562-9653036a6d21'
    } else if (index == 5) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/da181-db3ce.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(5).png?alt=media&token=24fc0d08-16dd-4a37-bf35-19fdf87413de'
    }
    console.log('Avatar ausgewählt:', index ,this.userIconTokenURL);
    this.iconIndex = index;
    this.uploadUserIcon(this.uid, this.userIconTokenURL);
    this.imageSelected = false;
  }

  createAccount() {
    this.loadingScreen = true;
    this.showInputInformationUserIcon = false;
    if ([0, 1, 2, 3, 4, 5, 6].includes(this.iconIndex)) {
      this.accountCreated.emit();
      console.log('account wurde erstellt');
      localStorage.setItem('userEmail', this.userEmail)
      localStorage.setItem('userPassword', this.userPassword)
    } else {
      this.showInputInformationUserIcon = true;
      console.log('Bitte ein User Icon wählen');
    }
    this.loadingScreen = false;
  }

  async uploadUserIcon(uid: string, userIconTokenURL: any) {
    this.loadingScreen = true;
    this.userData = await this.firestoreService.uploadUserIconIntoDatabase(uid, userIconTokenURL);
    this.downloadedUserIcon = await  this.firestoreService.downloadUserIcon(uid);
    this.img = document.getElementById('userIcon');
    this.img.setAttribute('src', this.downloadedUserIcon);
    this.loadingScreen = false;
  }

  async uploadUserIconCustom(uid: string, userIconTokenURL: any) {
    this.userData = await this.firestoreService.uploadUserIconIntoDatabase(uid, userIconTokenURL);
    this.downloadedUserIcon = await  this.firestoreService.downloadUserIcon(uid);
  }
}

