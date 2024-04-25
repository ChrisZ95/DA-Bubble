import { Routes } from '@angular/router';
import { MainComponent } from './main-content/main/main.component';
import { LogInComponent } from './start-page/log-in/log-in.component';

export const routes: Routes = [
  {path: '' , component: LogInComponent},
  // {path: '' , component: MainComponent}
];
