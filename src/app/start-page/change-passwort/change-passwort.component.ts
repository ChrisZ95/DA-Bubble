import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FirestoreService } from '../../firestore.service';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-passwort',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './change-passwort.component.html',
  styleUrl: './change-passwort.component.scss'
})
export class ChangePasswortComponent implements OnInit {
  @Output() PasswordSuccesfullyChanged: EventEmitter<any> = new EventEmitter();
  @Output() forgotPassword: EventEmitter<any> = new EventEmitter();

  showInputInformationPassword: boolean = false;
  showInputInformationConfirmPasswordInputInvalid: boolean = false;
  showInputInformationConfirmPasswordInputEmpty: boolean = false;

  userId: any;

  constructor(
    private firestoreService: FirestoreService
  ) {}

  ngOnInit() {
    debugger
    // this.firestoreService.resetPasswordUserId$.subscribe(uid => {
    //   this.userId = uid;
    //   console.log('UserID für Passwortänderung:', uid);
    // });

    // Die aktuelle URL abrufen
const currentUrl = window.location.href;

// Die continueUrl extrahieren
const continueUrlStart = currentUrl.indexOf('continueUrl=') + 'continueUrl='.length;
const continueUrlEnd = currentUrl.indexOf('&', continueUrlStart);
const continueUrl = currentUrl.substring(continueUrlStart, continueUrlEnd !== -1 ? continueUrlEnd : undefined);

// Die URL dekodieren, um Sonderzeichen zu entschlüsseln
const decodedContinueUrl = decodeURIComponent(continueUrl);

// Die Benutzer-ID extrahieren
this.userId = new URL(decodedContinueUrl).searchParams.get('userId');

console.log(this.userId); // Ausgabe: Die userID aus der URL lautet 3hh8IcgMwqMFinyu8VYAKP2uJ7J2

  }


  backToForgotPassword() {
    this.forgotPassword.emit();
    console.log('back to login')
  }

  emailSended() {
    this.PasswordSuccesfullyChanged.emit();
    console.log('back to login')
  }

  newPassword(formData: any) {
    debugger
      console.log('übertragende id lautet',this.userId);
      this.showInputInformationPassword = false;
      this.showInputInformationConfirmPasswordInputInvalid = false;
      this.showInputInformationConfirmPasswordInputEmpty = false;
      const { password, confirmPassword } = formData.value;
      if (!formData.valid) {
        if (formData.controls['password'].invalid) {
          this.showInputInformationPassword = true;
        } else if (formData.controls['confirmPassword'].invalid) {
          this.showInputInformationConfirmPasswordInputEmpty = true;
        }
      } else if (password !== confirmPassword) {
        this.showInputInformationConfirmPasswordInputInvalid = true;
      } else {
        console.log('button zum abschicken des neuen passworts gedrückt');
        this.emailSended();
        this.firestoreService.changePassword(this.userId, password);
      }
    };

}
