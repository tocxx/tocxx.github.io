import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignService } from '@services/campaign.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TMProRichTextPipe } from 'src/app/pipes/tmproRichText';
import { CampaignEditInfoComponent } from './components/info/info.component';

@Component({
  selector: 'campaign-edit',
  imports: [CommonModule, CampaignEditInfoComponent, TMProRichTextPipe],
  templateUrl: './edit.component.html',
})
export class CampaignEditComponent {
  private _campaign = inject(CampaignService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  campaign = this._campaign.editing;
  nav = signal('info');
  id = this._route.snapshot.paramMap.get('id');
  name = '';

  constructor() {
    if (!this.campaign()) {
      if (!this.id) this._router.navigate(['campaigns']);
      const campaign = this._campaign.campaigns().find((c) => c.id === this.id);
      if (!campaign) this._router.navigate(['campaigns']);
      this._campaign.setEditing(campaign!);
    }
    console.log(this.id);
    console.log(this.campaign());
  }

  navigate(nav: string) {
    this.nav.set(nav);
  }

  createNew() {
    if (this.name.length <= 0) return console.log('Name not long enough');
    console.log('Creating ' + this.name);
  }

  onName(e: Event) {
    this.name = (e.target as HTMLInputElement).value;
  }
}
