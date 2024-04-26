import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartSideHeaderComponent } from './start-side-header/start-side-header.component';
import { StartSideFooterComponent } from './start-side-footer/start-side-footer.component';
import { LogInComponent } from './log-in/log-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [StartSideHeaderComponent, StartSideFooterComponent, LogInComponent, SignUpComponent, CommonModule],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.scss'
})
export class StartPageComponent  {
  showLoginComponent = true;


  constructor() { }

  signUpClicked() {
    console.log("Sign-up clicked!");
    this.showLoginComponent = false;
  }

}
