import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-privacy-police',
  standalone: true,
  imports: [],
  templateUrl: './privacy-police.component.html',
  styleUrl: './privacy-police.component.scss'
})
export class PrivacyPoliceComponent {
  @Output() backToLoginClicked: EventEmitter<any> = new EventEmitter();

  backToLogIn() {
    this.backToLoginClicked.emit();
    console.log('back to login')
  }

}
