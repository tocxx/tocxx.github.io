import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CampaignService } from '@services/campaign.service';

@Component({
  selector: 'campaign',
  template: '<router-outlet />',
  imports: [RouterModule],
  providers: [CampaignService],
})
export class CampaignPageComponent {
  private _campaign = inject(CampaignService);
}
