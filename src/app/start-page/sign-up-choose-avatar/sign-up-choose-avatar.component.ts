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
  userData: User | undefined;

  @Output() backToSignUpClicked: EventEmitter<any> = new EventEmitter();
  @Output() accountCreated: EventEmitter<any> = new EventEmitter();

  constructor(private firestoreService: FirestoreService) { }

  avatar = ['./../../../assets/images/80. avatar interaction (1).png',
   './../../../assets/images/80. avatar interaction (2).png',
   './../../../assets/images/80. avatar interaction (3).png',
   './../../../assets/images/80. avatar interaction (4).png',
   './../../../assets/images/80. avatar interaction (5).png',
  ]

  ngOnInit(): void {
    console.log('choose avatar started')
    this.firestoreService.onUserRegistered.subscribe(docId => {
      this.getUserDocument(docId);
      console.log('signUp choose avatr id',docId)
    });
  }


  backToSignUp() {
    this.backToSignUpClicked.emit();
    console.log('back to sign up button continue')
  }

  chooseAvatar(index: number) {
    console.log('Avatar ausgewählt:', index);
    this.selectedAvatar = this.avatar[index];
  }

  createAccount() {
    this.accountCreated.emit();
    console.log('account wurde erstellt')
  }

  // async getUserDocument() {
  //   const docId = 'hUI1Rirdb1PBnNAYOl1X';
  //   this.userData = await this.firestoreService.getUserByDocId(docId);
  //   console.log('Benutzerdaten erhalten:', this.userData);
  // }
  async getUserDocument(docId: string) {
    // this.userData = await this.firestoreService.getUserByDocId(docId);
    // console.log('Benutzerdaten erhalten:', this.userData);
  }
}
