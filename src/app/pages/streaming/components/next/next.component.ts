import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentService } from '@services/tournament.service';
import { MatchService } from '@services/match.service';

@Component({
  selector: 'streaming-next',
  imports: [CommonModule],
  templateUrl: './next.component.html',
})
export class StreamingNextComponent {
  private _match = inject(MatchService);
  currentTournament = inject(TournamentService).currentTournament;
  currentMatch = this._match.currentMatch;
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
}
