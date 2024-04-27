import { Component, Output, Input, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-start-side-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './start-side-header.component.html',
  styleUrl: './start-side-header.component.scss'
})
export class StartSideHeaderComponent {
  @Input() showSignUp: boolean = true;
  @Input() showChooseAvatar: boolean = true;
  @Output() signUpClicked: EventEmitter<any> = new EventEmitter();

  emitSignUpClicked() {
    this.signUpClicked.emit();
  }
}
