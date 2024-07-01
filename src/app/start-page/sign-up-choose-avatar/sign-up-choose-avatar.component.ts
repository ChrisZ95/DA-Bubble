import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../firestore.service';
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
  continueButton: boolean = false;


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
    this.userForm = await this.firestoreService.getUserData(this.uid)
    this.userName = this.userForm['username']
    this.userEmail = this.userForm['email']
    this.userPassword = this.userForm['password']
  }

  async onImageSelected(event: any):Promise<void> {
    const file = event.target.files[0];
    this.continueButton = true;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageSrc = e.target?.result;
        this.iconIndex = 6;
        this.imageSelected = true;
        const icon = file;
      };
      reader.readAsDataURL(file);
      const icon = file;
      const userIconTokenURL = await this.firestoreService.uploadUserIconIntoStorage(this.uid, icon);
      await this.uploadUserIconCustom(this.uid, userIconTokenURL);
    }
  }

  backToSignUp() {
    this.backToSignUpClicked.emit();
  }

  chooseAvatar(index: number) {
    this.showInputInformationUserIcon = false;
    this.selectedAvatar = this.avatar[index];
    if (index == 0) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/da-bubble-30236.appspot.com/o/user-icon%2F80.%20avatar%20interaction.png?alt=media&token=6726696b-f5dc-4154-b08a-51ed3023eb72'
    } else if (index == 1) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/da-bubble-30236.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(1).png?alt=media&token=38fd7c27-e1a2-4ed1-a5c6-8b3d6c1cccd5'
    } else if (index == 2) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/da-bubble-30236.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(2).png?alt=media&token=9e74ff01-de64-4854-a2e9-ed06448a8d26'
    } else if (index == 3) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/da-bubble-30236.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(3).png?alt=media&token=116394e6-c1ab-4095-9c7c-d2a21b87202e'
    } else if (index == 4) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/da-bubble-30236.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(4).png?alt=media&token=ab847587-0d5a-4d7f-9e51-9c5194d24c33'
    } else if (index == 5) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/da-bubble-30236.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(5).png?alt=media&token=23537295-5f4a-4d88-a66f-830c484f4d45'
    }
    this.iconIndex = index;
    this.uploadUserIcon(this.uid, this.userIconTokenURL);
    this.imageSelected = false;
  }

  createAccount() {
    this.loadingScreen = true;
    this.showInputInformationUserIcon = false;
    if ([0, 1, 2, 3, 4, 5, 6].includes(this.iconIndex)) {
      this.accountCreated.emit();
      localStorage.setItem('userEmail', this.userEmail)
      localStorage.setItem('userPassword', this.userPassword)
    } else {
      this.showInputInformationUserIcon = true;
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
    this.continueButton = true;
  }

  async uploadUserIconCustom(uid: string, userIconTokenURL: any) {
    this.userData = await this.firestoreService.uploadUserIconIntoDatabase(uid, userIconTokenURL);
    this.downloadedUserIcon = await  this.firestoreService.downloadUserIcon(uid);
  }
}

