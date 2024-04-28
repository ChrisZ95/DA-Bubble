import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {
  @Output() forgotPassword: EventEmitter<any> = new EventEmitter();

  constructor(private router: Router) { }

  guestLogIn() {
    this.router.navigate(['/generalView']);
  }

  openForgetPasswordComponent() {
    this.forgotPassword.emit();
  }
}
