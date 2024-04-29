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

  @Output() backToSignUpClicked: EventEmitter<any> = new EventEmitter();
  @Output() accountCreated: EventEmitter<any> = new EventEmitter();

  user = new User();

  constructor(private firestoreService: FirestoreService) { }

  avatar = ['./../../../assets/images/80. avatar interaction (1).png',
   './../../../assets/images/80. avatar interaction (2).png',
   './../../../assets/images/80. avatar interaction (3).png',
   './../../../assets/images/80. avatar interaction (4).png',
   './../../../assets/images/80. avatar interaction (5).png',
  ]

  ngOnInit(): void {
    this.getUserDokument();
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

  async getUserDokument() {
    const createdUserDoc = await this.firestoreService.signUpNewUser(this.user);
    if (createdUserDoc) {
      console.log("Erstelltes Benutzerdokument:", createdUserDoc);
    } else {
      console.error("Benutzerdokument konnte nicht erstellt werden.");
    }

  }
}
