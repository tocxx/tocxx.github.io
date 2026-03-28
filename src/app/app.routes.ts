import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing/landing.component';
import { SitewrapperComponent } from '@components/sitewrapper/sitewrapper.component';

export const routes: Routes = [
  {
    path: '',
    component: SitewrapperComponent,
    children: [
      {
        path: '',
        component: LandingPageComponent,
      },
      {
        path: 'campaigns',
        loadChildren: () =>
          import('./pages/campaign/campaign.routes').then((m) => m.routes),
      },
      {
        path: 'tourneys',
        loadChildren: () =>
          import('./pages/tournament/tournament.routes').then((m) => m.routes),
      },
    ],
  },
  {
    path: 'streaming',
    loadChildren: () =>
      import('./pages/streaming/streaming.routes').then((m) => m.routes),
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];
