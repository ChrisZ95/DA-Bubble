import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartSideHeaderComponent } from './start-side-header/start-side-header.component';
import { StartSideFooterComponent } from './start-side-footer/start-side-footer.component';
import { LogInComponent } from './log-in/log-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { RouterModule } from '@angular/router';
import { SignUpChooseAvatarComponent } from './sign-up-choose-avatar/sign-up-choose-avatar.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [StartSideHeaderComponent, StartSideFooterComponent, LogInComponent, SignUpComponent, CommonModule, RouterModule, SignUpChooseAvatarComponent, ForgetPasswordComponent],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.scss'
})
export class StartPageComponent implements OnInit {
  showLoginComponent = false;
  showSignUpComponent = false;
  showChooseAvatarComponent = false;
  showForgetPasswordComponent = false;

  accountCreate = false;
  emailSend = false;

  constructor() { }

  ngOnInit(): void {
    this.showLoginComponent = true;
    console.log('1', this.showLoginComponent, '2', this.showSignUpComponent, '3', this.showChooseAvatarComponent)
  }

  signUpClicked() {
    console.log("Sign-up clicked!");
    this.showSignUpComponent = true;
    this.showLoginComponent = false;
    this.showChooseAvatarComponent = false;
    this.showForgetPasswordComponent = false;
  }

  backToLoginClicked() {
    console.log("Back to login clicked!");
    this.showLoginComponent = true;
    this.showChooseAvatarComponent = false;
    this.showSignUpComponent = false;
    this.showForgetPasswordComponent = false;
  }

  continueToChooseAvatar() {
    console.log('continue button gedrückt')
    this.showChooseAvatarComponent = true;
    this.showLoginComponent = false;
    this.showSignUpComponent = false;
    this.showForgetPasswordComponent = false;
    console.log('1', this.showLoginComponent, '2', this.showSignUpComponent, '3', this.showChooseAvatarComponent)
  }

  backToSignUpClicked() {
    console.log("Back to signUp clicked!");
    this.showSignUpComponent = true;
    this.showLoginComponent = false;
    this.showChooseAvatarComponent = false;
    this.showForgetPasswordComponent = false;
  }

  accountCreated() {
    this.accountCreate = true;
    setTimeout(() => {
      this.showLoginComponent = true;
      this.showSignUpComponent = false;
      this.showChooseAvatarComponent = false;
      this.accountCreate = false;
    }, 2000);
  }

  emailSended() {
    this.emailSend = true;
    setTimeout(() => {
      this.showLoginComponent = true;
      this.showSignUpComponent = false;
      this.showChooseAvatarComponent = false;
      this.emailSend = false;
    }, 2000);
  }

  forgotPassword() {
    this.showForgetPasswordComponent = true;
    this.showLoginComponent = false;
    this.showSignUpComponent = false;
    this.showChooseAvatarComponent = false;
  }
}
