import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-change-passwort',
  standalone: true,
  imports: [],
  templateUrl: './change-passwort.component.html',
  styleUrl: './change-passwort.component.scss'
})
export class ChangePasswortComponent {
  @Output() PasswordSuccesfullyChanged: EventEmitter<any> = new EventEmitter();
  @Output() forgotPassword: EventEmitter<any> = new EventEmitter();

  backToForgotPassword() {
    this.forgotPassword.emit();
    console.log('back to login')
  }

  emailSended() {
    this.PasswordSuccesfullyChanged.emit();
    console.log('back to login')
  }
}
