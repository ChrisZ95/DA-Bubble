import { Component, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../firestore.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent {
  @Output() backToLoginClicked: EventEmitter<any> = new EventEmitter();
  @Output() emailSended: EventEmitter<any> = new EventEmitter();

  constructor(private firestoreService: FirestoreService) { }

  showInputInformationEmail: boolean = false;

  backToLogIn() {
    this.backToLoginClicked.emit();
    console.log('back to login')
  }

  sendMail(formData:any) {
    debugger
    this.showInputInformationEmail = false;
    const email = formData.value;
    if(!formData.valid) {
      if (formData.controls['email'].invalid) {
        this.showInputInformationEmail = true;
      }
    } else {
      this.firestoreService.sendEmailResetPasswort(email);
      this.emailSended.emit();
      console.log('email gesendet')
    }
  }
}
