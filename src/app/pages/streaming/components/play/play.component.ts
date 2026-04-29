import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentService } from '@services/tournament.service';
import { MatchService } from '@services/match.service';

@Component({
  selector: 'streaming-play',
  imports: [CommonModule],
  templateUrl: './play.component.html',
})
export class StreamingPlayComponent {
  private _match = inject(MatchService);
  currentTournament = inject(TournamentService).currentTournament;
  currentMatch = this._match.currentMatch;
  pickedMaps = computed(() => {
    const match = this.currentMatch();
    if (!match) return [];
    return match.picks;
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
  neededToWin = computed(() =>
    Math.ceil((this.bestOf() ? this.bestOf()! : 5) / 2),
  );
  p1 = computed(() => {
    const match = this.currentMatch();
    const p1Score = this._match.p1Score();
    if (!match || !p1Score) return undefined;
    return { p: match.p1, s: p1Score };
  });
  p2 = computed(() => {
    const match = this.currentMatch();
    const p2Score = this._match.p2Score();
    if (!match || !p2Score) return undefined;
    return { p: match.p2, s: p2Score };
  });
}
