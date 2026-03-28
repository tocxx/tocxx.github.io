import { Routes } from '@angular/router';
import { CampaignPageComponent } from './campaign.component';
import { CampaignHomeComponent } from './components/home/home.component';
import { CampaignEditComponent } from './components/edit/edit.component';

export const routes: Routes = [
  {
    path: '',
    component: CampaignPageComponent,
    children: [
      {
        path: '',
        component: CampaignHomeComponent,
      },
      {
        path: ':id',
        component: CampaignEditComponent,
      },
      {
        path: ':id/*',
        component: CampaignHomeComponent,
      },
    ],
  },
];
