import { Routes } from '@angular/router';
import { StreamingPageComponent } from './streaming.component';
import { StreamingPoolComponent } from './components/pool/pool.component';
import { StreamingBracketComponent } from './components/bracket/bracket.component';
import { StreamingPicksBansComponent } from './components/picksbans/picksbans.component';
import { StreamingNextComponent } from './components/next/next.component';
import { StreamingDetailsComponent } from './components/details/details.component';

export const routes: Routes = [
  {
    path: '',
    component: StreamingPageComponent,
    children: [
      {
        path: 'pool/:id',
        component: StreamingPoolComponent,
      },
      {
        path: 'bracket/:type',
        component: StreamingBracketComponent,
      },
      {
        path: 'match/pb',
        component: StreamingPicksBansComponent,
      },
      {
        path: 'match/next',
        component: StreamingNextComponent,
      },
      {
        path: 'match/details',
        component: StreamingDetailsComponent,
      },
      /*{
        path: 'match/view',
        component: StreamingMatchViewComponent,
      },
      {
        path: 'match/results',
        component: StreamingMatchResultsComponent,
      },*/
    ],
  },
];
