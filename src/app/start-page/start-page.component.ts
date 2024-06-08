import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartSideHeaderComponent } from './start-side-header/start-side-header.component';
import { StartSideFooterComponent } from './start-side-footer/start-side-footer.component';
import { LogInComponent } from './log-in/log-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { RouterModule } from '@angular/router';
import { SignUpChooseAvatarComponent } from './sign-up-choose-avatar/sign-up-choose-avatar.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ChangePasswortComponent } from './change-passwort/change-passwort.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyPoliceComponent } from './privacy-police/privacy-police.component';
@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [StartSideHeaderComponent, StartSideFooterComponent, LogInComponent, SignUpComponent,
     CommonModule, RouterModule, SignUpChooseAvatarComponent, ForgetPasswordComponent,
     ChangePasswortComponent, ImprintComponent, PrivacyPoliceComponent],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.scss',
})
export class StartPageComponent implements OnInit {
  showLoginComponent = false;
  showSignUpComponent = false;
  showChooseAvatarComponent = false;
  showForgetPasswordComponent = false;
  showChangePasswordComponent = false;
  showImpressumComponent = false;
  showPrivacyPoliceComponent = false;

  backToSignUpFromPrivacyPolice = false;

  startScreen = false;

  accountCreate = false;
  emailSend = false;
  updateEmail = false;
  deleteAccount = false;

  constructor() { }

  ngOnInit(): void {
    this.showStartScreen();
    this.showLoginComponent = true;
    this.startScreen = true;
    this.informationAfterEmailChanged();
    this.informationAfterDeleteAccount();
    console.log('1', this.showLoginComponent, '2', this.showSignUpComponent, '3', this.showChooseAvatarComponent)
  }

  informationAfterEmailChanged() {
    const storage = localStorage.getItem('resetEmail')
    if(storage) {
      this.updateEmail = true
      setTimeout(() => {
        this.updateEmail = false
        localStorage.removeItem('resetEmail')
      }, 10000);
    } else {
      this.updateEmail = false
    }
  }

  informationAfterDeleteAccount() {
    const storage = localStorage.getItem('userDelete')
    if(storage) {
      this.deleteAccount = true
      setTimeout(() => {
        this.deleteAccount = false
        localStorage.removeItem('userDelete')
      }, 10000);
    }
  }

  showStartScreen() {
    setTimeout(() => {
      this.startScreen = false;
    }, 4000);
  }

  signUpClicked() {
    console.log("Sign-up clicked!");
    this.showSignUpComponent = true;
    this.backToSignUpFromPrivacyPolice = true;
    this.showLoginComponent = false;
    this.showChooseAvatarComponent = false;
    this.showForgetPasswordComponent = false;
    this.showChangePasswordComponent = false;
    this.showImpressumComponent = false;
    this.showPrivacyPoliceComponent = false;
  }

  backToLoginClicked() {
    console.log("Back to login clicked!");
    this.showLoginComponent = true;
    this.showChooseAvatarComponent = false;
    this.showSignUpComponent = false;
    this.showForgetPasswordComponent = false;
    this.showChangePasswordComponent = false;
    this.showImpressumComponent = false;
    this.showPrivacyPoliceComponent = false;
    this.backToSignUpFromPrivacyPolice = false;
  }

  continueToChooseAvatar() {
    console.log('Choose avatar open')
    this.showChooseAvatarComponent = true;
    this.showLoginComponent = false;
    this.showSignUpComponent = false;
    this.showForgetPasswordComponent = false;
    this.showChangePasswordComponent = false;
    this.showImpressumComponent = false;
    this.showPrivacyPoliceComponent = false;
    console.log('1', this.showLoginComponent, '2', this.showSignUpComponent, '3', this.showChooseAvatarComponent)
  }

  backToSignUpClicked() {
    console.log("Back to signUp clicked!");
    this.showSignUpComponent = true;
    this.showLoginComponent = false;
    this.showChooseAvatarComponent = false;
    this.showForgetPasswordComponent = false;
    this.showChangePasswordComponent = false;
    this.showImpressumComponent = false;
    this.showPrivacyPoliceComponent = false;
  }

  accountCreated() {
    this.accountCreate = true;
    setTimeout(() => {
      this.showLoginComponent = true;
      this.showSignUpComponent = false;
      this.showChooseAvatarComponent = false;
      this.accountCreate = false;
      this.showChangePasswordComponent = false;
      this.showImpressumComponent = false;
      this.showPrivacyPoliceComponent = false;
    }, 2000);
  }

  emailSended() {
    this.emailSend = true;
    setTimeout(() => {
      this.showLoginComponent = true;
      this.showChangePasswordComponent = false;
      this.showSignUpComponent = false;
      this.showForgetPasswordComponent = false;
      this.showChooseAvatarComponent = false;
      this.emailSend = false;
      this.showImpressumComponent = false;
      this.showPrivacyPoliceComponent = false;
    }, 2000);
  }

  // PasswordSuccesfullyChanged() {
  //   this.changedPassword = true;
  //   console.log("Passwort zurückgesetzt");
  //  setTimeout(() => {
  //   this.showLoginComponent = true;
  //   this.showChooseAvatarComponent = false;
  //   this.showSignUpComponent = false;
  //   this.showForgetPasswordComponent = false;
  //   this.showChangePasswordComponent = false;
  //   this.changedPassword = false;
  //   this.showImpressumComponent = false;
  //   this.showPrivacyPoliceComponent = false;
  //  }, 2000);
  // }

  forgotPassword() {
    this.showForgetPasswordComponent = true;
    this.showLoginComponent = false;
    this.showSignUpComponent = false;
    this.showChooseAvatarComponent = false;
    this.showChangePasswordComponent = false;
    this.showImpressumComponent = false;
    this.showPrivacyPoliceComponent = false;
  }

  openImpressum() {
    this.showImpressumComponent = true;
    this.showForgetPasswordComponent = false;
    this.showLoginComponent = false;
    this.showSignUpComponent = false;
    this.showChooseAvatarComponent = false;
    this.showChangePasswordComponent = false;
    this.showPrivacyPoliceComponent = false;
  }

  openPrivacyPolice() {
    this.showPrivacyPoliceComponent = true;
    this.showImpressumComponent = false;
    this.showForgetPasswordComponent = false;
    this.showLoginComponent = false;
    this.showSignUpComponent = false;
    this.showChooseAvatarComponent = false;
    this.showChangePasswordComponent = false;
  }

  show() {
    this.showPrivacyPoliceComponent = false;
    this.showImpressumComponent = false;
    this.showForgetPasswordComponent = false;
    this.showLoginComponent = false;
    this.showSignUpComponent = false;
    this.showChooseAvatarComponent = false;
    this.showChangePasswordComponent = true;
    console.log('is running')
  }
}
