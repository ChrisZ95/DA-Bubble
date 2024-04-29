import { Component, Output,EventEmitter  } from '@angular/core';

@Component({
  selector: 'app-start-side-footer',
  standalone: true,
  imports: [],
  templateUrl: './start-side-footer.component.html',
  styleUrl: './start-side-footer.component.scss'
})
export class StartSideFooterComponent {
  @Output() openImpressum: EventEmitter<any> = new EventEmitter();
  @Output() openPrivacyPolice: EventEmitter<any> = new EventEmitter();

  openImpressumComponent() {
    this.openImpressum.emit();
  }

  openPrivacyPoliceComponent() {
    this.openPrivacyPolice.emit();
  }
}
