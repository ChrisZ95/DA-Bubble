import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../firestore.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {
  @Output() forgotPassword: EventEmitter<any> = new EventEmitter();

  constructor(private router: Router, private firestoreService: FirestoreService) { }
  showInputInformation: boolean = false;

  guestLogIn() {
    this.router.navigate(['/generalView']);
  }

  openForgetPasswordComponent() {
    this.forgotPassword.emit();
  }

  userLogIn(formData: any): void  {
    const { email, password} = formData.value;
    this.firestoreService.signInWithEmailAndPassword( email, password);
    console.log('User log in erfolgt')
  }
}
