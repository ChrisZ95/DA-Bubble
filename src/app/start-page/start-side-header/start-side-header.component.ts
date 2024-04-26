import { Component, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-start-side-header',
  standalone: true,
  imports: [],
  templateUrl: './start-side-header.component.html',
  styleUrl: './start-side-header.component.scss'
})
export class StartSideHeaderComponent {

  @Output() signUpClicked = new EventEmitter<void>();

  constructor() { }

  emitSignUpClicked() {
    this.signUpClicked.emit();
  }

}
