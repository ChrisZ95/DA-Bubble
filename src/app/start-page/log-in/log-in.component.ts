import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../firestore.service';
import { CommonModule } from '@angular/common';
import { GoogleAuthProvider, OAuthProvider } from '@angular/fire/auth';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss',
})
export class LogInComponent {
  @Output() forgotPassword: EventEmitter<any> = new EventEmitter();

  constructor(
    private router: Router,
    private firestoreService: FirestoreService
  ) {}
  showInputInformationEmail: boolean = false;
  showInputInformationPassword: boolean = false;

  guestLogIn() {
    this.router.navigate(['/generalView']);
  }

  openForgetPasswordComponent() {
    this.forgotPassword.emit();
  }

  logInWithGoogle() {
    const auth = this.firestoreService.auth;
    const provider = new GoogleAuthProvider();
    this.firestoreService
      .signInWithGoogle(auth, provider)
      .then((result) => {
        console.log('Google-Anmeldung erfolgreich:', result);
      })
      .catch((error) => {
        console.error('Fehler bei der Google-Anmeldung:', error);
      });
  }

  logInWithApple() {
    const auth = this.firestoreService.auth;
    const provider = new OAuthProvider('apple.com');
    this.firestoreService
      .signInWithApple(auth, provider)
      .then((result) => {
        console.log('Apple-Anmeldung erfolgreich:', result);
      })
      .catch((error) => {
        console.error('Fehler bei der Apple-Anmeldung:', error);
      });
  }

  userLogIn(formData: any): void {
    this.showInputInformationEmail = false;
    this.showInputInformationPassword = false;
    const { email, password } = formData.value;
    if (!formData.valid) {
      if (formData.controls['email'].invalid) {
        this.showInputInformationEmail = true;
      } else if (formData.controls['password'].invalid) {
        this.showInputInformationPassword = true;
      }
    } else {
      this.firestoreService.logInUser(email, password);
      console.log('User log in erfolgt');
    }
  }
}
