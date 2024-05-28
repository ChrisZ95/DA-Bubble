import { Component, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../firestore.service';
import { CommonModule } from '@angular/common';
import { GoogleAuthProvider, OAuthProvider, getAuth } from '@angular/fire/auth';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [FormsModule, CommonModule, MatProgressSpinnerModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss',
})
export class LogInComponent implements OnInit {
  @Output() forgotPassword: EventEmitter<any> = new EventEmitter();

  constructor(
    private router: Router,
    private firestoreService: FirestoreService
  ) {}
  showInputInformationEmail: boolean = false;
  showInputInformationPassword: boolean = false;
  showEmailVerification: boolean = false;
  showPasswordValue = false;
  loadingScreen = false;

  signUpUserEmail: any;
  signUpUserPassword: any;

  ngOnInit(): void {
    this.loadingScreen = false;
    this.firestoreService.createTimeStamp();
    const currentAuthStatus = this.firestoreService.currentAuth()
    console.log('AUTH im login bereich',currentAuthStatus);
    // this.firestoreService.observeAuthState()
    const allVariabeln = this.firestoreService.getAllVariables()
    console.log('Alle variabeln',allVariabeln)
    setTimeout(() => {
      localStorage.removeItem('resetEmail')
    }, 10000);
    this.signUpUserEmail = localStorage.getItem('userEmail');
    if(this.signUpUserEmail) {
      this.signUpUserPassword = localStorage.getItem('userPassword');
    } else {
      this.signUpUserEmail = localStorage.getItem('resetPasswortEmail');
    }
    localStorage.removeItem('userEmail');
    localStorage.removeItem('resetPasswortEmail');
    localStorage.removeItem('userPassword');
  }

  showPassword() {
    if(!this.showPasswordValue) {
      this.showPasswordValue = true;
      const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
      passwordInput.type = 'text';
      console.log('show password')
    } else if (this.showPasswordValue) {
      this.showPasswordValue = false;
      const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
      passwordInput.type = 'password';
      console.log('hide password')
    }
  }

  async guestLogIn() {
    this.loadingScreen = true;
    const logInDate = await this.firestoreService.createTimeStamp();
    this.firestoreService.logInUser('gast@dabubble.lars-thoennes.de', 'password', logInDate)
    // this.router.navigate(['/generalView']);
  }

  openForgetPasswordComponent() {
    this.forgotPassword.emit();
  }

  async logInWithGoogle() {
    this.loadingScreen = true;
    const auth = this.firestoreService.auth;
    const provider = new GoogleAuthProvider();
    const logInDate = await this.firestoreService.createTimeStamp();
      // console.log(logInDate);
    this.firestoreService
      .signInWithGoogle(auth, provider, logInDate)
      .then((result) => {
        this.loadingScreen = false;
        // console.log('Google-Anmeldung erfolgreich:', result);
      })
      .catch((error) => {
        // console.error('Fehler bei der Google-Anmeldung:', error);
      });
  }

  async userLogIn(formData: any) {
    this.showInputInformationEmail = false;
    this.showInputInformationPassword = false;
    this.showEmailVerification = false;
    this.loadingScreen = true;
    const { email, password } = formData.value;
    if (!formData.valid) {
      if (formData.controls['email'].invalid) {
        this.showInputInformationEmail = true;
        this.loadingScreen = false;
      } else if (formData.controls['password'].invalid) {
        this.showInputInformationPassword = true;
        this.loadingScreen = false;
      }
    } else {
      const logInDate = await this.firestoreService.createTimeStamp();
      // console.log(logInDate);
      this.firestoreService.logInUser(email, password, logInDate)
        .then((result) => {
          if(result === 'auth/email-not-verified') {
            this.showEmailVerification = true;
            this.loadingScreen = false;
          }
          if (result === 'auth/invalid-credential') {
            this.showInputInformationPassword = true;
            this.loadingScreen = false;
            // console.log('Invalid credentials error occurred.');
          } else {
            this.loadingScreen = false;
            // console.log('User logged in successfully');
          }
        })
        .catch((error) => {
          console.error('Error logging in:', error);
        });
    }
}

async resendverificationEmail() {
  this.loadingScreen = true;
  const user = this.firestoreService.getCurrentAuth();
  this.firestoreService.sendVerificationEmail(user)
  setTimeout(() => {
    this.loadingScreen = false;
  }, 500);
}

}
