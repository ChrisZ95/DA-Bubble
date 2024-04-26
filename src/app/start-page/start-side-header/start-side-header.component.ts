import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-start-side-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './start-side-header.component.html',
  styleUrl: './start-side-header.component.scss'
})
export class StartSideHeaderComponent {
  showLoginComponent = true;

  @Output() signUpClicked = new EventEmitter<void>();

  constructor() { }

  emitSignUpClicked() {
    this.signUpClicked.emit();
    this.showLoginComponent = false;
  }

}
