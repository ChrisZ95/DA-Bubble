import { Component, Output, EventEmitter, OnInit } from '@angular/core';
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
export class LogInComponent implements OnInit {
  @Output() forgotPassword: EventEmitter<any> = new EventEmitter();

  constructor(
    private router: Router,
    private firestoreService: FirestoreService
  ) {}
  showInputInformationEmail: boolean = false;
  showInputInformationPassword: boolean = false;

  ngOnInit(): void {
    this.firestoreService.createTimeStamp()
    // const storageUsericonRef = this.firestoreService.getStorageUserIconRef();
    // const blobParts: BlobPart[] = [];
    // const file = new File(blobParts, 'meinBild.jpg', { type: 'image/jpeg' });
    // this.firestoreService.uploadUserIcon(storageUsericonRef, file)
    //   .then(() => {
    //     console.log('Datei erfolgreich hochgeladen.');
    //   })
    //   .catch(error => {
    //     console.error('Fehler beim Hochladen der Datei:', error);
    //   });
  }

  guestLogIn() {
    this.router.navigate(['/generalView']);
  }

  openForgetPasswordComponent() {
    this.forgotPassword.emit();
  }

  async logInWithGoogle() {
    const auth = this.firestoreService.auth;
    const provider = new GoogleAuthProvider();
    const logInDate = await this.firestoreService.createTimeStamp();
      console.log(logInDate);
    this.firestoreService
      .signInWithGoogle(auth, provider, logInDate)
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

  async userLogIn(formData: any) {
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
      const logInDate = await this.firestoreService.createTimeStamp();
      console.log(logInDate);
      this.firestoreService.logInUser(email, password, logInDate)
        .then((result) => {
          if (result === 'auth/invalid-credential') {
            this.showInputInformationPassword = true;
            console.log('Invalid credentials error occurred.');
          } else {
            console.log('User logged in successfully');
          }
        })
        .catch((error) => {
          console.error('Error logging in:', error);
        });
    }
}

}
