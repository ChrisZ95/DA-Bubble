import { Component, Output, Input, EventEmitter  } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-start-side-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './start-side-footer.component.html',
  styleUrl: './start-side-footer.component.scss'
})
export class StartSideFooterComponent {
  @Output() openImpressum: EventEmitter<any> = new EventEmitter();
  @Output() openPrivacyPolice: EventEmitter<any> = new EventEmitter();
  @Output() signUpClicked: EventEmitter<any> = new EventEmitter();

  @Input() showSignUp: boolean = true;
  @Input() showChooseAvatar: boolean = true;

  openImpressumComponent() {
    this.openImpressum.emit();
  }

  openPrivacyPoliceComponent() {
    this.openPrivacyPolice.emit();
  }

  emitSignUpClicked() {
    this.signUpClicked.emit();
  }
}
