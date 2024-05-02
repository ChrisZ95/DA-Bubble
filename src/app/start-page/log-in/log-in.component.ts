import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [FormsModule],
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

  userLogIn() {

  }
}
