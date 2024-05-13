import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../firestore.service';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-sign-up-choose-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sign-up-choose-avatar.component.html',
  styleUrl: './sign-up-choose-avatar.component.scss'
})
export class SignUpChooseAvatarComponent implements OnInit {
  selectedAvatar: string | null = null;
  userData: any;
  userIconTokenURL: any;
  uid: any;
  index: any;
  showInputInformationUserIcon = false;

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

  ngOnInit(): void {
    this.uid = this.firestoreService.getUid();
    console.log(this.uid)
  }


  backToSignUp() {
    this.backToSignUpClicked.emit();
    console.log('back to sign up button continue')
  }

  chooseAvatar(index: number) {
    debugger
    this.showInputInformationUserIcon = false;
    console.log('Avatar ausgewählt:', index);
    this.selectedAvatar = this.avatar[index];
    if (index == 0) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(1).png?alt=media&token=11dbb694-05b7-49cc-81bc-28e98384b66a'
    } else if (index == 1) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(2).png?alt=media&token=98f30010-e7aa-4c39-b4c7-6bd7b38b0ea5'
    } else if (index == 2) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(3).png?alt=media&token=fb4029b9-d972-4d39-97ca-53b1af67fb00'
    } else if (index == 3) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(4).png?alt=media&token=3891c2d7-7435-476c-8db2-b27062a6d9ae'
    } else if (index == 4) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction%20(5).png?alt=media&token=dd0480c1-1af4-49da-b8dc-762a556bb25d'
    } else if (index == 5) {
      this.userIconTokenURL = 'https://firebasestorage.googleapis.com/v0/b/dabubble-180.appspot.com/o/user-icon%2F80.%20avatar%20interaction.png?alt=media&token=4cd2af7c-8927-4901-aaa2-af3b5cc81a79'
    }
    console.log('Avatar ausgewählt:', index ,this.userIconTokenURL);
    this.index = index;
    this.getUserDocument(this.uid, this.userIconTokenURL)
  }

  createAccount() {
    this.showInputInformationUserIcon = false;
    debugger
    if ([0, 1, 2, 3, 4, 5].includes(this.index)) {
      this.accountCreated.emit();
      console.log('account wurde erstellt')
    } else {
      this.showInputInformationUserIcon = true;
      console.log('Bitte ein User Icon wählen');
    }
  }

  async getUserDocument(uid: string, userIconTokenURL: string) {
    this.userData = await this.firestoreService.getUserByDocId(uid, userIconTokenURL);
    console.log('Benutzerdaten erhalten:', this.userData);
  }
}
