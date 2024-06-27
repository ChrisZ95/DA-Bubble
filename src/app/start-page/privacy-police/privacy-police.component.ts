import { Component, Output, Input, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-police',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-police.component.html',
  styleUrl: './privacy-police.component.scss'
})
export class PrivacyPoliceComponent {
  @Input() showPrivacyPolice: boolean = true;
  @Output() backToLoginClicked: EventEmitter<any> = new EventEmitter();
  @Output() backToSignUpClicked: EventEmitter<any> = new EventEmitter();

  backToLogIn() {
    this.backToLoginClicked.emit();
  }

  backToSignUp() {
    this.backToSignUpClicked.emit();
  }
}
