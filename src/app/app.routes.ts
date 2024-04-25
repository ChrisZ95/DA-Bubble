import { Routes } from '@angular/router';
import { LogInComponent } from './start-page/log-in/log-in.component';
import { MainComponent } from './main-content/main/main.component';

export const routes: Routes = [
  {path: '' , component: LogInComponent},
  {path: 'main' , component: MainComponent}
];
