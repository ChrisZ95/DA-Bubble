import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent {
  @Output() backToLoginClicked: EventEmitter<any> = new EventEmitter();
  @Output() emailSended: EventEmitter<any> = new EventEmitter();

  backToLogIn() {
    this.backToLoginClicked.emit();
    console.log('back to login')
  }

  sendMail() {
    this.emailSended.emit();
    console.log('email gesendet')
  }
}
