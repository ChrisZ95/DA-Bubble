import { Component, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../firestore.service';
import { CommonModule } from '@angular/common';
import { GoogleAuthProvider, OAuthProvider, getAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [FormsModule, CommonModule],
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

  ngOnInit(): void {
    this.firestoreService.createTimeStamp();
    const currentAuthStatus = this.firestoreService.currentAuth()
    console.log('AUTH im login bereich',currentAuthStatus);
    // this.firestoreService.observeAuthState()
    const allVariabeln = this.firestoreService.getAllVariables()
    console.log('Alle variabeln',allVariabeln)
    setTimeout(() => {
      localStorage.removeItem('resetEmail')
    }, 10000);
  }

  showPassword() {
    if(!this.showPasswordValue) {
      this.showPasswordValue = true;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      passwordInput.type = 'text';
      console.log('show password')
    } else if (this.showPasswordValue) {
      this.showPasswordValue = false;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      passwordInput.type = 'password';
      console.log('hide password')
    }
  }

  async guestLogIn() {
    const logInDate = await this.firestoreService.createTimeStamp();
    this.firestoreService.logInUser('gast@DABubble.de', 'password', logInDate)
    // this.router.navigate(['/generalView']);
  }

  openForgetPasswordComponent() {
    this.forgotPassword.emit();
  }

  async logInWithGoogle() {
    const auth = this.firestoreService.auth;
    const provider = new GoogleAuthProvider();
    const logInDate = await this.firestoreService.createTimeStamp();
      // console.log(logInDate);
    this.firestoreService
      .signInWithGoogle(auth, provider, logInDate)
      .then((result) => {
        // console.log('Google-Anmeldung erfolgreich:', result);
      })
      .catch((error) => {
        // console.error('Fehler bei der Google-Anmeldung:', error);
      });
  }

  logInWithApple() {
    const auth = this.firestoreService.auth;
    const provider = new OAuthProvider('apple.com');
    this.firestoreService
      .signInWithApple(auth, provider)
      .then((result) => {
        // console.log('Apple-Anmeldung erfolgreich:', result);
      })
      .catch((error) => {
        console.error('Fehler bei der Apple-Anmeldung:', error);
      });
  }

  async userLogIn(formData: any) {
    this.showInputInformationEmail = false;
    this.showInputInformationPassword = false;
    this.showEmailVerification = false;
    const { email, password } = formData.value;
    if (!formData.valid) {
      if (formData.controls['email'].invalid) {
        this.showInputInformationEmail = true;
      } else if (formData.controls['password'].invalid) {
        this.showInputInformationPassword = true;
      }
    } else {
      const logInDate = await this.firestoreService.createTimeStamp();
      // console.log(logInDate);
      this.firestoreService.logInUser(email, password, logInDate)
        .then((result) => {
          if(result === 'auth/email-not-verified') {
            this.showEmailVerification = true;
          }
          if (result === 'auth/invalid-credential') {
            this.showInputInformationPassword = true;
            // console.log('Invalid credentials error occurred.');
          } else {
            // console.log('User logged in successfully');
          }
        })
        .catch((error) => {
          console.error('Error logging in:', error);
        });
    }
}

async resendverificationEmail() {
  const user = this.firestoreService.getCurrentAuth();
  this.firestoreService.sendVerificationEmail(user)
}

}
