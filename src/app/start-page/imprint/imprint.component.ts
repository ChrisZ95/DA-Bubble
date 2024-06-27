import { Component, Output, EventEmitter  } from '@angular/core';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {
  @Output() backToLoginClicked: EventEmitter<any> = new EventEmitter();

  backToLogIn() {
    this.backToLoginClicked.emit();
  }

}
