import {
  Component,
  computed,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentService } from '@services/tournament.service';
import { MatchService } from '@services/match.service';
import { StreamingMapviewComponent } from '../mapview/mapview.component';
import { Map } from '@interfaces/tournament';

@Component({
  selector: 'streaming-details',
  imports: [CommonModule, StreamingMapviewComponent],
  templateUrl: './details.component.html',
})
export class StreamingDetailsComponent {
  private _match = inject(MatchService);
  currentTournament = inject(TournamentService).currentTournament;
  currentMatch = this._match.currentMatch;
  pickedMaps = computed(() => {
    const match = this.currentMatch();
    if (!match) return [];
    return match.picks;
  });
  poolNumber = computed(() => {
    const match = this.currentMatch();
    const tournament = this.currentTournament();
    if (match && tournament) {
      const pool = tournament.config.pools.find((p) =>
        p.matchIds.includes(match.id),
      );
      let index = 0;
      if (pool) index = tournament.config.pools.indexOf(pool) + 1;
      return index;
    }
    return 0;
  });
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
  currentWinner = signal<1 | 2>(1);

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (
      event.key.toLowerCase() === '1' &&
      !(event.target instanceof HTMLInputElement)
    ) {
      this.currentWinner.set(1);
    } else if (event.key === '2') {
      this.currentWinner.set(2);
    }
  }

  toggleMap(map: Map) {
    if (!this.isWon(map.id))
      return this._match.winMap(map, this.currentWinner());
    this._match.loseMap(map);
  }

  isWon(id: string) {
    const match = this.currentMatch();
    if (!match) return false;
    const won = [...match.p1.maps, ...match.p2.maps];
    if (won.find((m) => m.id === id)) return true;
    return false;
  }

  getWinner(id: string) {
    const match = this.currentMatch();
    if (!match) return 'Player';
    if (match.p1.maps.find((m) => m.id === id)) return match.p1.name;
    if (match.p2.maps.find((m) => m.id === id)) return match.p2.name;
    return 'Player';
  }
}
