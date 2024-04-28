import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartSideHeaderComponent } from './start-side-header/start-side-header.component';
import { StartSideFooterComponent } from './start-side-footer/start-side-footer.component';
import { LogInComponent } from './log-in/log-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { RouterModule } from '@angular/router';
import { SignUpChooseAvatarComponent } from './sign-up-choose-avatar/sign-up-choose-avatar.component';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [StartSideHeaderComponent, StartSideFooterComponent, LogInComponent, SignUpComponent, CommonModule, RouterModule, SignUpChooseAvatarComponent],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.scss'
})
export class StartPageComponent implements OnInit {
  showLoginComponent = false;
  showSignUpComponent = false;
  showChooseAvatarComponent = false;
  accountCreate = false;

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
  }

  backToLoginClicked() {
    console.log("Back to login clicked!");
    this.showLoginComponent = true;
    this.showChooseAvatarComponent = false;
    this.showSignUpComponent = false;
  }

  continueToChooseAvatar() {
    console.log('continue button gedrückt')
    this.showChooseAvatarComponent = true;
    this.showLoginComponent = false;
    this.showSignUpComponent = false;
    console.log('1', this.showLoginComponent, '2', this.showSignUpComponent, '3', this.showChooseAvatarComponent)
  }

  backToSignUpClicked() {
    console.log("Back to signUp clicked!");
    this.showSignUpComponent = true;
    this.showLoginComponent = false;
    this.showChooseAvatarComponent = false;
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
}
