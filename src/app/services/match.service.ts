import { computed, effect, Injectable, signal } from "@angular/core";
import {
  Map,
  Match,
  MatchPlayer,
  OngoingMatch,
  PBMap,
} from "@interfaces/tournament";
import { TournamentService } from "./tournament.service";
import { StorageService } from "./storage.service";

@Injectable({
  providedIn: "root",
})
export class MatchService {
  #currentMatch = signal<OngoingMatch | undefined>(undefined);
  #firstPick = signal<MatchPlayer | undefined>(undefined);
  #secondPick = signal<MatchPlayer | undefined>(undefined);
  currentMatch = computed(() => this.#currentMatch());
  firstPick = computed(() => this.#firstPick());
  secondPick = computed(() => this.#secondPick());

  constructor(
    private _tournament: TournamentService,
    private _storage: StorageService,
  ) {
    let currentMatch = this._storage.get("tournament-currentMatch");
    if (currentMatch) {
      const players = this._tournament.currentTournament()?.config.players;
      if (players) {
        const fresh = (id: number) =>
          players.find((p) => p.id === id)?.name ?? "Unknown";
        currentMatch = {
          ...currentMatch,
          p1: { ...currentMatch.p1, name: fresh(currentMatch.p1.id) },
          p2: { ...currentMatch.p2, name: fresh(currentMatch.p2.id) },
        };
      }
      this.#currentMatch.set(currentMatch);
    }
    effect(() => {
      let currentMatch = this.#currentMatch();
      if (currentMatch)
        this._storage.set("tournament-currentMatch", currentMatch);
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

  getPlayerName(id: number) {
    const player = this._tournament
      .currentTournament()
      ?.config.players.find((p) => p.id === Number(id));
    return player?.name ?? "unknown";
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

  winMap(map: Map, n: 1 | 2, bestOf: number = 999) {
    const threshold = Math.ceil(bestOf / 2);
    this.#currentMatch.update((cm) => {
      if (!cm) return undefined;
      const isP1 = n === 1;
      const playerKey = isP1 ? "p1" : "p2";
      const opponentKey = isP1 ? "p2" : "p1";
      const updatedMaps = [...cm[playerKey].maps, map];
      const hasWonMatch = updatedMaps.length >= threshold;
      return {
        ...cm,
        [playerKey]: {
          ...cm[playerKey],
          maps: updatedMaps,
        },
        winner: hasWonMatch ? cm[playerKey].id : undefined,
        loser: hasWonMatch ? cm[opponentKey].id : undefined,
      };
    });
  }

  loseMap(map: Map, bestOf: number = 999) {
    const threshold = Math.ceil(bestOf / 2);
    this.#currentMatch.update((cm) => {
      if (!cm) return undefined;
      const p1Maps = cm.p1.maps.filter((m) => m.id !== map.id);
      const p2Maps = cm.p2.maps.filter((m) => m.id !== map.id);
      const p1Wins = p1Maps.length >= threshold;
      const p2Wins = p2Maps.length >= threshold;
      return {
        ...cm,
        p1: { ...cm.p1, maps: p1Maps },
        p2: { ...cm.p2, maps: p2Maps },
        winner: p1Wins ? cm.p1.id : p2Wins ? cm.p2.id : undefined,
        loser: p1Wins ? cm.p2.id : p2Wins ? cm.p1.id : undefined,
      };
    });
  }
}
