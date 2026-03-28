import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignService } from '@services/campaign.service';
import { TMProRichTextPipe } from 'src/app/pipes/tmproRichText';
import { CreditHeader, CreditTitle } from '@interfaces/campaign';

@Component({
  selector: 'campaign-edit-info',
  imports: [CommonModule, TMProRichTextPipe],
  templateUrl: './info.component.html',
})
export class CampaignEditInfoComponent {
  private _campaign = inject(CampaignService);
  campaign = this._campaign.editing;
  previewExpanded = signal(false);

  onName(e: Event) {
    this._campaign.update({ name: (e.target as HTMLInputElement).value });
  }

  onDesc(e: Event) {
    this._campaign.update({ desc: (e.target as HTMLInputElement).value });
  }

  onBigDesc(e: Event) {
    this._campaign.update({ bigDesc: (e.target as HTMLTextAreaElement).value });
  }

  onAllUnlocked(e: Event) {
    this._campaign.update({
      allUnlocked: (e.target as HTMLInputElement).checked,
    });
  }

  onMapHeight(e: Event) {
    const value = parseFloat((e.target as HTMLInputElement).value);
    if (!isNaN(value)) {
      this._campaign.update({ mapHeight: value });
    }
  }

  onBackgroundAlpha(e: Event) {
    const value = parseFloat((e.target as HTMLInputElement).value);
    if (!isNaN(value)) {
      const clamped = Math.max(0, Math.min(1, value));
      this._campaign.update({ backgroundAlpha: clamped });
    }
  }

  onLightColor(component: 'r' | 'g' | 'b', e: Event) {
    const value = parseFloat((e.target as HTMLInputElement).value);
    if (!isNaN(value)) {
      const clamped = Math.max(0, Math.min(1, value));
      const current = this.campaign()!.lightColor;
      this._campaign.update({
        lightColor: { ...current, [component]: clamped },
      });
    }
  }

  addCreditHeader() {
    const credits = [...(this.campaign()!.credits.credits || [])];
    credits.push({
      header: {
        name: 'New Header',
        titles: [],
      },
    });
    this._campaign.update({
      credits: {
        ...this.campaign()!.credits,
        credits,
      },
    });
  }

  addCreditTitle(headerIndex: number) {
    const credits = [...(this.campaign()!.credits.credits || [])];
    if (headerIndex >= 0 && headerIndex < credits.length) {
      const credit = credits[headerIndex];
      if ('header' in credit) {
        credit.header.titles.push({
          title: {
            name: 'New Title',
            people: [],
          },
        });
        this._campaign.update({
          credits: {
            ...this.campaign()!.credits,
            credits,
          },
        });
      }
    }
  }

  addStandaloneTitle() {
    const credits = [...(this.campaign()!.credits.credits || [])];
    credits.push({
      title: {
        name: 'New Title',
        people: [],
      },
    });
    this._campaign.update({
      credits: {
        ...this.campaign()!.credits,
        credits,
      },
    });
  }

  removeCredit(index: number) {
    const credits = [...(this.campaign()!.credits.credits || [])];
    credits.splice(index, 1);
    this._campaign.update({
      credits: {
        ...this.campaign()!.credits,
        credits,
      },
    });
  }

  removeTitle(headerIndex: number, titleIndex: number) {
    const credits = [...(this.campaign()!.credits.credits || [])];
    if (headerIndex >= 0 && headerIndex < credits.length) {
      const credit = credits[headerIndex];
      if ('header' in credit) {
        credit.header.titles.splice(titleIndex, 1);
        this._campaign.update({
          credits: {
            ...this.campaign()!.credits,
            credits,
          },
        });
      }
    }
  }

  updateHeaderName(headerIndex: number, e: Event) {
    const credits = [...(this.campaign()!.credits.credits || [])];
    if (headerIndex >= 0 && headerIndex < credits.length) {
      const credit = credits[headerIndex];
      if ('header' in credit) {
        credit.header.name = (e.target as HTMLInputElement).value;
        this._campaign.update({
          credits: {
            ...this.campaign()!.credits,
            credits,
          },
        });
      }
    }
  }

  updateTitleName(
    headerIndex: number | null,
    titleIndex: number,
    e: Event
  ) {
    const credits = [...(this.campaign()!.credits.credits || [])];
    if (headerIndex !== null && headerIndex >= 0 && headerIndex < credits.length) {
      const credit = credits[headerIndex];
      if ('header' in credit) {
        credit.header.titles[titleIndex].title.name = (
          e.target as HTMLInputElement
        ).value;
        this._campaign.update({
          credits: {
            ...this.campaign()!.credits,
            credits,
          },
        });
      }
    } else {
      const credit = credits[titleIndex];
      if ('title' in credit) {
        credit.title.name = (e.target as HTMLInputElement).value;
        this._campaign.update({
          credits: {
            ...this.campaign()!.credits,
            credits,
          },
        });
      }
    }
  }

  updateTitlePeople(
    headerIndex: number | null,
    titleIndex: number,
    e: Event
  ) {
    const credits = [...(this.campaign()!.credits.credits || [])];
    const people = (e.target as HTMLInputElement).value
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (headerIndex !== null && headerIndex >= 0 && headerIndex < credits.length) {
      const credit = credits[headerIndex];
      if ('header' in credit) {
        credit.header.titles[titleIndex].title.people = people;
        this._campaign.update({
          credits: {
            ...this.campaign()!.credits,
            credits,
          },
        });
      }
    } else {
      const credit = credits[titleIndex];
      if ('title' in credit) {
        credit.title.people = people;
        this._campaign.update({
          credits: {
            ...this.campaign()!.credits,
            credits,
          },
        });
      }
    }
  }

  isCreditHeader(credit: CreditHeader | CreditTitle): credit is CreditHeader {
    return 'header' in credit;
  }

  getLightColorRgb(): string {
    const color = this.campaign()!.lightColor;
    return `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;
  }

  togglePreview() {
    this.previewExpanded.update((value) => !value);
  }
}
