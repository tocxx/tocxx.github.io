import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentService } from '@services/tournament.service';
import { MatchService } from '@services/match.service';
import { WebsocketService } from '@services/websocket.service';
import { MatchPlayer, ScoreData } from '@interfaces/tournament';

@Component({
  selector: 'streaming-play',
  imports: [CommonModule],
  templateUrl: './play.component.html',
})
export class StreamingPlayComponent {
  private _match = inject(MatchService);
  private _ws = inject(WebsocketService);
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
    if (!match) return undefined;
    return match.p1;
  });
  p2 = computed(() => {
    const match = this.currentMatch();
    if (!match) return undefined;
    return match.p2;
  });
  p1Acc = computed(() => {
    const lScore = this._ws.leftScore();
    return lScore ? lScore.accuracy : '00.00%';
  });
  p1Combo = computed(() => {
    const lScore = this._ws.leftScore();
    return lScore ? lScore.combo : '000';
  });
  p1Miss = computed(() => {
    const lScore = this._ws.leftScore();
    return lScore ? lScore.missCount : '00';
  });
  p2Acc = computed(() => {
    const rScore = this._ws.rightScore();
    return rScore ? rScore.accuracy : '00.00%';
  });
  p2Combo = computed(() => {
    const rScore = this._ws.rightScore();
    return rScore ? rScore.combo : '000';
  });
  p2Miss = computed(() => {
    const rScore = this._ws.rightScore();
    return rScore ? rScore.missCount : '00';
  });
}
