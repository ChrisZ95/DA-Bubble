import { Routes } from '@angular/router';
import { LogInComponent } from './start-page/log-in/log-in.component';
import { MainComponent } from './main-content/main/main.component';
import { StartPageComponent } from './start-page/start-page.component';
import { SignUpComponent } from './start-page/sign-up/sign-up.component';
import { authGuard } from './guard/auth.guard';
import { ChangePasswortComponent } from './start-page/change-passwort/change-passwort.component';

export const routes: Routes = [
  { path: '', component: StartPageComponent },
  { path: 'generalView', component: MainComponent },
  { path: 'ChangePasswort', component: ChangePasswortComponent }, //, canActivate: [authGuard]
];
