import { FormsModule } from '@angular/forms';
import { Component, OnInit, Output, Input, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FirestoreService } from '../../firestore.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  @Output() backToLoginClicked: EventEmitter<any> = new EventEmitter();
  @Output() continueToChooseAvatar: EventEmitter<any> = new EventEmitter();
  @Output() openPrivacyPolice: EventEmitter<any> = new EventEmitter();

  constructor(private firestoreService: FirestoreService) { }

  // @ViewChild('signupForm', { static: false }) signupForm?: NgForm;

  newUser = {
    name: "",
    email: "",
    password: "",
    privacyPolice: false,
  };


  async performSignUp() {
      await this.firestoreService.signUpNewUser(this.newUser);
      this.toChooseAvatar();

  }

  backToLogIn() {
    this.backToLoginClicked.emit();
    console.log('back to login')
  }

  toChooseAvatar() {
    this.continueToChooseAvatar.emit();
    console.log('button continue')
  }

  openPrivacyPoliceComponent() {
    this.openPrivacyPolice.emit();
  }
}
