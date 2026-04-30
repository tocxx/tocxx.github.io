import { computed, effect, Injectable, signal } from '@angular/core';
import {
  Match,
  MatchPlayer,
  OngoingMatch,
  PBMap,
} from '@interfaces/tournament';
import { TournamentService } from './tournament.service';
import { WebsocketService } from './websocket.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  private _ws?: WebsocketService;
  #currentMatch = signal<OngoingMatch | undefined>(undefined);
  #firstPick = signal<MatchPlayer | undefined>(undefined);
  #secondPick = signal<MatchPlayer | undefined>(undefined);
  currentMatch = computed(() => this.#currentMatch());
  lobbyStatus = computed(() => this._ws?.isConnected());
  lobbyPlayers = this._ws?.lobbyPlayers;
  p1Score = computed(() => {
    const p1Luid = this.currentMatch()?.p1.luid;
    if (p1Luid && p1Luid === this._ws?.leftLUID()) return this._ws?.leftScore;
    if (p1Luid && p1Luid === this._ws?.rightLUID()) return this._ws?.rightScore;
    return undefined;
  });
  p2Score = computed(() => {
    const p2Luid = this.currentMatch()?.p2.luid;
    if (p2Luid && p2Luid === this._ws?.leftLUID()) return this._ws?.leftScore;
    if (p2Luid && p2Luid === this._ws?.rightLUID()) return this._ws?.rightScore;
    return undefined;
  });
  firstPick = computed(() => this.#firstPick());
  secondPick = computed(() => this.#secondPick());

  constructor(
    private _tournament: TournamentService,
    private _storage: StorageService,
  ) {
    let currentMatch = this._storage.get('tournament-currentMatch');
    if (currentMatch) this.#currentMatch.set(currentMatch);
    effect(() => {
      let currentMatch = this.#currentMatch();
      if (currentMatch)
        this._storage.set('tournament-currentMatch', currentMatch);
    });
  }

  setMatch(match: Match) {
    this.#firstPick.set(undefined);
    this.#secondPick.set(undefined);
    this.#currentMatch.set({
      ...match,
      p1: {
        id: match.p1,
        name: this.getPlayerName(match.p1),
        maps: [],
      },
      p2: {
        id: match.p2,
        name: this.getPlayerName(match.p2),
        maps: [],
      },
      picks: [],
      bans: [],
    });
  }

  linkP1(luid: string) {
    this._ws?.leftLUID.set(luid);
  }

  linkP2(luid: string) {
    this._ws?.rightLUID.set(luid);
  }

  getPlayerName(id: number) {
    const player = this._tournament
      .currentTournament()!
      .config.players.find((p) => p.id === Number(id));
    if (player) return player.name;
    return 'unknown';
  }

  setFirstPick(id: number) {
    const match = this.currentMatch();
    if (!match) return;
    this.#firstPick.set(match.p1.id === id ? match.p1 : match.p2);
    this.#secondPick.set(match.p1.id === id ? match.p2 : match.p1);
  }

  banMap(pbmap: PBMap) {
    this.#currentMatch.update((cm) => {
      return cm ? { ...cm, bans: [...cm.bans, pbmap] } : undefined;
    });
  }

  pickMap(pbmap: PBMap) {
    this.#currentMatch.update((cm) => {
      return cm ? { ...cm, picks: [...cm.picks, pbmap] } : undefined;
    });
  }

  resetPB() {
    this.#currentMatch.update((cm) => {
      return cm ? { ...cm, picks: [], bans: [] } : undefined;
    });
  }

  swapPlayers() {
    this.#currentMatch.update((cm) => {
      return cm ? { ...cm, p1: cm.p2, p2: cm.p1 } : undefined;
    });
  }
}
