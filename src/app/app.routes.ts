import { Routes } from '@angular/router';
import { LogInComponent } from './start-page/log-in/log-in.component';
import { MainComponent } from './main-content/main/main.component';
import { StartPageComponent } from './start-page/start-page.component';

export const routes: Routes = [
  {path: '' , component: StartPageComponent},
  {path: 'main' , component: MainComponent}
];
