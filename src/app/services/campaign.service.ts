import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { CampaignObject, MapNode } from '../interfaces/campaign';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  #campaigns: WritableSignal<CampaignObject[]> = signal([]);
  campaigns = computed(() => this.#campaigns());
  #editing: WritableSignal<CampaignObject | undefined> = signal(undefined);
  editing = computed(() => this.#editing());

  constructor() {
    const storage = localStorage.getItem('tocxxio-campaigns');
    if (storage) {
      this.#campaigns.set(JSON.parse(storage));
    }
  }

  update(update: Partial<CampaignObject>) {
    this.#editing.update((co) => {
      return { ...co!, ...update };
    });
    this.saveEditing();
  }

  infofy(info: Partial<CampaignObject>): CampaignObject {
    return {
      id: info.id || crypto.randomUUID(),
      name: info.name || 'Untitled Campaign',
      desc: info.desc || 'Undescribed Campaign',
      bigDesc: info.bigDesc || '',
      allUnlocked: info.allUnlocked || false,
      mapPositions: info.mapPositions || [],
      unlockGate: info.unlockGate || [],
      mapHeight: info.mapHeight || 500,
      backgroundAlpha: info.backgroundAlpha || 1,
      lightColor: info.lightColor || { r: 0.5, g: 0.5, b: 0.5 },
      nodes: info.nodes || [],
      credits: {
        name: info.name || 'Untitled Campaign',
        credits: [
          {
            header: {
              name: 'Campaign Editor',
              titles: [
                {
                  title: {
                    name: 'tocxx.github.io/campaigns',
                    people: ['by Tocxx'],
                  },
                },
              ],
            },
          },
        ],
      },
    };
  }

  mapNodeify(node: Partial<MapNode>): MapNode {
    return {
      name: node.name || 'Untitled Song',
      songid: node.songid || '',
      customDownloadURL: node.customDownloadURL || '',
      characteristic: node.characteristic || 'Standard',
      difficulty: node.difficulty || 1,
      modifiers: node.modifiers || {
        fastNotes: false,
        songSpeed: 0,
        noBombs: false,
        disappearingArrows: false,
        strictAngles: false,
        noObstacles: false,
        batteryEnergy: false,
        failOnSaberClash: false,
        instaFail: false,
        noFail: false,
        noArrows: false,
        ghostNotes: false,
        energyType: 0,
        enabledObstacleType: 0,
        speedMul: 1.0,
      },
      requirements: node.requirements || [
        { isMax: false, type: 'accuracy', count: 9000 },
      ],
      externalModifiers: node.externalModifiers || {},
      challengeInfo: node.challengeInfo || null,
      unlockableItems: node.unlockableItems || [],
      unlockMap: node.unlockMap || false,
      allowStandardLevel: node.allowStandardLevel || true,
    };
  }

  saveCampaign(campaign: CampaignObject) {
    this.#campaigns.update((campaigns) => [...campaigns, campaign]);
    localStorage.setItem('tocxxio-campaigns', JSON.stringify(this.campaigns()));
  }

  saveEditing() {
    if (this.editing())
      this.#campaigns.update((cs) =>
        cs.filter((c) => c.id !== this.editing()!.id)
      );
  }

  setEditing(campaign: CampaignObject) {
    this.#editing.set(campaign);
  }
}
