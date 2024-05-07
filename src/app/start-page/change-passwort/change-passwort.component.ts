import { Component, Output, EventEmitter } from '@angular/core';
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
export class ChangePasswortComponent {
  @Output() PasswordSuccesfullyChanged: EventEmitter<any> = new EventEmitter();
  @Output() forgotPassword: EventEmitter<any> = new EventEmitter();

  showInputInformationPassword: boolean = false;
  showInputInformationConfirmPasswordInputInvalid: boolean = false;
  showInputInformationConfirmPasswordInputEmpty: boolean = false;

  constructor(
    private firestoreService: FirestoreService
  ) {}

  backToForgotPassword() {
    this.forgotPassword.emit();
    console.log('back to login')
  }

  emailSended() {
    this.PasswordSuccesfullyChanged.emit();
    console.log('back to login')
  }

  newPassword(formData: any) {
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
    } else if(password !== confirmPassword) {
      this.showInputInformationConfirmPasswordInputInvalid = true;
    } else {
      console.log('button zum abschicken des neuen passworts gedrückt')
    }
  }
}
