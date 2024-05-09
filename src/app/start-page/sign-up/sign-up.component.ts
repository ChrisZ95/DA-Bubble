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
  showInputInformationUserName: boolean = false;
  showInputInformationEmailInputEmpty: boolean = false;
  showInputInformationEmailforgive: boolean = false;
  showInputInformationPassword: boolean = false;
  showInputInformationPrivacyPolice: boolean = false;


  async userSignUp(formData: NgForm): Promise<void> {
    this.showInputInformationUserName = false;
    this.showInputInformationEmailInputEmpty = false;
    this.showInputInformationEmailforgive = false;
    this.showInputInformationPassword = false;
    this.showInputInformationPrivacyPolice = false;
    console.log('Formulardaten:', formData.value);
    const { email, password, username, privacyPolice } = formData.value;

    if (!formData.valid) {
      if (formData.controls['username'].invalid) {
        this.showInputInformationUserName = true;
      } else if (formData.controls['email'].invalid) {
        this.showInputInformationEmailInputEmpty = true;
      }  else if (formData.controls['password'].invalid) {
        this.showInputInformationPassword = true;
      }  else if(formData.controls['privacyPolice'].invalid) {
        this.showInputInformationPrivacyPolice = true;
      }
      } else {
        const registrationSuccess = await this.firestoreService.signUpUser(email, password, username, privacyPolice);
        // if (registrationSuccess === 'auth/invalid-recipient-email' || 'auth/invalid-email') {
        //   this.showInputInformationEmailInputEmpty = true;
        //   return;
        // }
         if (registrationSuccess === 'weak-password') {
          this.showInputInformationPassword = true;
          return;
        }
        else if (registrationSuccess === 'auth/email-already-in-use') {
          this.showInputInformationEmailforgive = true;
          return;
        }
        console.log('userSignUp wurde aufgerufen');
        this.toChooseAvatar();
      }
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

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

}
