import { FormsModule } from '@angular/forms';
import { Component, Output,Input, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  @Output() backToLoginClicked: EventEmitter<any> = new EventEmitter();
  @Output() continueToChooseAvatar: EventEmitter<any> = new EventEmitter();

  backToLogIn() {
    this.backToLoginClicked.emit();
    console.log('back to login')
  }

  toChooseAvatar() {
    this.continueToChooseAvatar.emit();
    console.log('button continue')
  }
}
