import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-up-choose-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sign-up-choose-avatar.component.html',
  styleUrl: './sign-up-choose-avatar.component.scss'
})
export class SignUpChooseAvatarComponent {

  @Output() backToSignUpClicked: EventEmitter<any> = new EventEmitter();

  avatar = ['./../../../assets/images/80. avatar interaction (1).png',
   './../../../assets/images/80. avatar interaction (2).png',
   './../../../assets/images/80. avatar interaction (3).png',
   './../../../assets/images/80. avatar interaction (4).png',
   './../../../assets/images/80. avatar interaction (5).png',
  ]


  backToSignUp() {
    this.backToSignUpClicked.emit();
    console.log('back to sign up button continue')
  }
}
