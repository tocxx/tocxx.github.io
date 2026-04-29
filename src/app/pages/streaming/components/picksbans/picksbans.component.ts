import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentService } from '@services/tournament.service';
import { StreamingMapviewComponent } from '../mapview/mapview.component';
import { MatchService } from '@services/match.service';
import { Map } from '@interfaces/tournament';

@Component({
  selector: 'streaming-picksbans',
  imports: [CommonModule, StreamingMapviewComponent],
  templateUrl: './picksbans.component.html',
})
export class StreamingPicksBansComponent {
  private _match = inject(MatchService);
  currentTournament = inject(TournamentService).currentTournament;
  currentMatch = this._match.currentMatch;
  firstPick = this._match.firstPick;
  secondPick = this._match.secondPick;
  matchPool = computed(() => {
    const match = this.currentMatch();
    const tournament = this.currentTournament();
    if (match && tournament)
      return tournament.config.pools.find((p) => p.matchIds.includes(match.id))
        ?.maps;
    return undefined;
  });
  bestOf = computed(() => {
    const pool = this.matchPool();
    if (!pool) return undefined;
    if (pool.length < 6) return 3;
    if (pool.length < 8) return 5;
    return 7;
  });
  pbState = computed(() => {
    const match = this.currentMatch();
    const bestOf = this.bestOf();
    if (!bestOf || !match || !this.firstPick() || !this.secondPick())
      return undefined;
    const { bans, picks } = match;
    if (bestOf === 5) {
      if (bans.length < 1) return 1;
      if (bans.length < 2) return 2;
      if (picks.length < 1) return 3;
      if (picks.length < 2) return 4;
      if (picks.length < 3) return 5;
      if (picks.length < 4) return 6;
      return undefined;
    }
    if (bans.length < 1) return 1;
    if (bans.length < 2) return 2;
    if (picks.length < 1) return 3;
    if (picks.length < 2) return 4;
    if (bans.length < 3) return 5;
    if (bans.length < 4) return 6;
    if (picks.length < 3) return 7;
    if (picks.length < 4) return 8;
    if (picks.length < 5) return 9;
    if (picks.length < 6) return 10;
    return undefined;
  });
  groupedMaps = computed(() => {
    const pool = this.matchPool();
    if (!pool) return [];
    const groups: { [key: string]: any[] } = {};
    pool.forEach((map) => {
      const catTitle = map.metadata!.category.title;
      if (!groups[catTitle]) groups[catTitle] = [];
      groups[catTitle].push(map);
    });
    return Object.keys(groups).map((title) => ({
      title,
      maps: groups[title],
    }));
  });

  clickMap(map: Map) {
    const match = this.currentMatch();
    const firstPick = this.firstPick();
    const secondPick = this.secondPick();
    if (!match || !firstPick || !secondPick) return;
    switch (this.pbState()) {
      case 1:
        return this._match.banMap({ playerName: firstPick.name, map: map });
      case 2:
        return this._match.banMap({ playerName: secondPick.name, map: map });
      case 3:
        return this._match.pickMap({ playerName: secondPick.name, map: map });
      case 4:
        this._match.pickMap({ playerName: firstPick.name, map: map });
        if (this.bestOf() === 3) return this.setTieBreaker();
        return;
      case 5:
        if (this.bestOf() === 5)
          return this._match.pickMap({ playerName: firstPick.name, map: map });
        return this._match.banMap({ playerName: secondPick.name, map: map });
      case 6:
        if (this.bestOf() === 5) {
          this._match.pickMap({ playerName: secondPick.name, map: map });
          return this.setTieBreaker();
        }
        return this._match.banMap({ playerName: firstPick.name, map: map });
      case 7:
        return this._match.pickMap({ playerName: firstPick.name, map: map });
      case 8:
        return this._match.pickMap({ playerName: secondPick.name, map: map });
      case 9:
        return this._match.pickMap({ playerName: firstPick.name, map: map });
      case 10:
        this._match.pickMap({ playerName: secondPick.name, map: map });
        return this.setTieBreaker();
      default:
        return;
    }
  }

  setTieBreaker() {
    const pool = this.matchPool();
    const match = this.currentMatch();
    if (!pool || !match) return;
    const { bans, picks } = match;
    for (let map of pool) {
      if (bans.find((pbm) => pbm.map === map)) continue;
      if (picks.find((pbm) => pbm.map === map)) continue;
      return this._match.pickMap({ playerName: undefined, map: map });
    }
  }

  isBanned(map: Map) {
    const match = this.currentMatch();
    if (!match) return;
    const { bans } = match;
    return bans.find((pbm) => pbm.map === map);
  }

  isPicked(map: Map) {
    const match = this.currentMatch();
    if (!match) return;
    const { picks } = match;
    console.log(picks.find((pbm) => pbm.map === map));
    return picks.find((pbm) => pbm.map === map);
  }

  currentState() {
    const match = this.currentMatch();
    const firstPick = this.firstPick();
    const secondPick = this.secondPick();
    if (!match) return 'No match chosen';
    if (!firstPick || !secondPick)
      return `${match.p1.name} VS ${match.p2.name}`;
    switch (this.pbState()) {
      case 1:
        return `${firstPick.name} is banning`;
      case 2:
        return `${secondPick.name} is banning`;
      case 3:
        return `${secondPick.name} is picking`;
      case 4:
        return `${firstPick.name} is picking`;
      case 5:
        if (this.bestOf() === 5) return `${firstPick.name} is picking`;
        return `${secondPick.name} is banning`;
      case 6:
        if (this.bestOf() === 5) return `${secondPick.name} is picking`;
        return `${firstPick.name} is banning`;
      case 7:
        return `${firstPick.name} is picking`;
      case 8:
        return `${secondPick.name} is picking`;
      case 9:
        return `${firstPick.name} is picking`;
      case 10:
        return `${secondPick.name} is picking`;
      default:
        return `${match.p1.name} VS ${match.p2.name}`;
    }
  }
}
