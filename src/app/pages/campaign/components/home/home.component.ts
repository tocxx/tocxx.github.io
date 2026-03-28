import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignService } from '@services/campaign.service';
import { CampaignObject } from '@interfaces/campaign';
import { Router } from '@angular/router';
import JSZip from 'jszip';

@Component({
  selector: 'campaign-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
})
export class CampaignHomeComponent {
  private _campaign = inject(CampaignService);
  private _router = inject(Router);
  status = signal<string | undefined>(undefined);
  error = signal<boolean>(false);
  campaigns = this._campaign.campaigns;
  name = '';

  createNew() {
    if (this.name.length <= 0) return console.log('Name not long enough');
    const campaign = this._campaign.infofy({ name: this.name });
    this._campaign.saveCampaign(campaign);
    this.onCampaign(campaign);
  }

  onName(e: Event) {
    this.name = (e.target as HTMLInputElement).value;
  }

  onDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).classList.remove('border-dashed');
    (e.target as HTMLElement).classList.add('border-solid');
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).classList.remove('border-dashed');
    (e.target as HTMLElement).classList.add('border-solid');
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).classList.remove('border-solid');
    (e.target as HTMLElement).classList.add('border-dashed');
  }

  onDrop(event: DragEvent) {
    this.error.set(false);
    this.status.set('File dropped');
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.remove('border-solid');
    (event.target as HTMLElement).classList.add('border-dashed');
    const files = event.dataTransfer?.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (
          file.type === 'application/zip' ||
          file.name.toLowerCase().endsWith('.zip')
        )
          return this.loadZip(file);
        this.error.set(true);
        this.status.set(
          `Unsupported file type: ${file.type} for file: ${file.name}`
        );
      }
    }
    return;
  }

  onCampaign(campaign: CampaignObject) {
    this._campaign.setEditing(campaign);
    this._router.navigate([`campaigns/${campaign.id}`]);
  }

  onFileSelected(event: Event) {
    this.error.set(false);
    this.status.set('File selected');
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith('.zip')) return this.loadZip(file);
      this.error.set(true);
      return this.status.set(
        `Unsupported file type: ${file.type} for file: ${file.name}`
      );
    }
  }

  async loadZip(zipFile: File) {
    this.status.set(`Processing zip file: ${zipFile.name}`);
    const reader = new FileReader();
    let campaign: CampaignObject | undefined;
    reader.onload = async (e) => {
      try {
        const result = e.target?.result;
        if (!result) {
          this.error.set(true);
          return this.status.set('Failed to read file');
        }
        const zip = await JSZip.loadAsync(result);
        const filePromises: Promise<void>[] = [];
        let infoPromise: Promise<void> | undefined;
        for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
          if (!zipEntry.dir && relativePath.endsWith('info.json')) {
            this.status.set(`Processing info.json: ${relativePath}`);
            infoPromise = zipEntry.async('text').then((content) => {
              const info = JSON.parse(content);
              console.log(info);
              campaign = this._campaign.infofy(info);
            });
            break;
          }
        }
        if (!infoPromise) {
          this.error.set(true);
          return this.status.set(
            'No info.json file found in the zip. Cannot proceed.'
          );
        }
        await infoPromise;
        if (!campaign) {
          this.error.set(true);
          return this.status.set(
            'Failed to process info.json file. Cannot proceed.'
          );
        }
        this.status.set('Info.json processed, now processing other files...');
        zip.forEach((relativePath, zipEntry) => {
          if (!zipEntry.dir && !relativePath.endsWith('info.json')) {
            filePromises.push(
              zipEntry.async('text').then((content) => {
                if (relativePath.endsWith('.json')) {
                  const split = relativePath.split('/');
                  const fileName = split[split.length - 1].replace('.json', '');
                  if (Number.isInteger(parseInt(fileName))) {
                    campaign!.nodes![parseInt(fileName)] =
                      this._campaign.mapNodeify(JSON.parse(content));
                  }
                  console.log('File: ' + fileName);
                } else {
                  console.log('Not a json file: ' + relativePath);
                }
              })
            );
          }
        });
        await Promise.all(filePromises);
        this.status.set('All files processed successfully');
        this._campaign.saveCampaign(campaign);
        this.onCampaign(campaign);
      } catch (err) {
        this.error.set(true);
        return this.status.set(`Error processing zip file: ${err}`);
      }
    };
    reader.onerror = () => {
      this.error.set(true);
      return this.status.set('Error reading file');
    };
    reader.readAsArrayBuffer(zipFile);
  }
}
