import { Component, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../firestore.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent {
  @Output() backToLoginClicked: EventEmitter<any> = new EventEmitter();
  @Output() emailSended: EventEmitter<any> = new EventEmitter();

  constructor(private firestoreService: FirestoreService) { }

  showInputInformationEmailInputInvalid: boolean = false;
  showInputInformationEmailInputEmpty: boolean = false;

  backToLogIn() {
    this.backToLoginClicked.emit();
    console.log('back to login')
  }

  sendMail(formData: any) {
    debugger
    this.showInputInformationEmailInputInvalid = false;
    this.showInputInformationEmailInputEmpty = false;

    this.firestoreService.getAllUsers().then(users => {
      const email = formData.value.email;

      if (!formData.valid) {
        if (formData.controls['email'].invalid) {
          this.showInputInformationEmailInputEmpty = true;
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
        } else {
          this.showInputInformationEmailInputInvalid = true;
          console.log('E-Mail-Adresse nicht gefunden');
        }
      }
    }).catch(error => {
      console.error('Fehler beim Abrufen der Benutzer:', error);
    });
  }



}
