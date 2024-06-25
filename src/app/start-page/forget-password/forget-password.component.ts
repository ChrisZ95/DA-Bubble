import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../firestore.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent {
  @Output() backToLoginClicked: EventEmitter<any> = new EventEmitter();
  @Output() emailSended: EventEmitter<any> = new EventEmitter();

  constructor(private firestoreService: FirestoreService) { }

  showInputInformationEmailInputInvalid: boolean = false;
  showInputInformationEmailInputEmpty: boolean = false;
  loadingScreen = false;

  backToLogIn() {
    this.backToLoginClicked.emit();
    console.log('back to login')
  }

  sendMail(formData: any) {
    this.loadingScreen = true;
    this.showInputInformationEmailInputInvalid = false;
    this.showInputInformationEmailInputEmpty = false;

    this.firestoreService.getAllUsers().then(users => {
      const email = formData.value.email;

      if (!formData.valid) {
        if (formData.controls['email'].invalid) {
          this.showInputInformationEmailInputEmpty = true;
          this.loadingScreen = false;
        }
      } else {
        const userWithEmail = users.find(user => user.email === email);
        if (userWithEmail) {
          const uid = userWithEmail.uid;
          this.firestoreService.sendEmailResetPasswort({ email, uid });
          console.log(email, uid)
          console.log('E-Mail zum Zurücksetzen des Passworts gesendet');
          this.emailSended.emit();
          localStorage.setItem('resetPasswortEmail',email)
          this.loadingScreen = false;
        } else {
          this.showInputInformationEmailInputInvalid = true;
          console.log('E-Mail-Adresse nicht gefunden');
          this.loadingScreen = false;
        }
      }
    }).catch(error => {
      console.error('Fehler beim Abrufen der Benutzer:', error);
    });
  }
}
