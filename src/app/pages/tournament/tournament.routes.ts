import { Routes } from '@angular/router';
import { TournamentPageComponent } from './tournament.component';
import { TournamentHomeComponent } from './components/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: TournamentPageComponent,
    children: [
      {
        path: '',
        component: TournamentHomeComponent,
      },
    ],
  },
];
