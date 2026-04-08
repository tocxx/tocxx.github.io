import { computed, Injectable, signal } from "@angular/core";
import { Match, OngoingMatch } from "@interfaces/tournament";
import { TournamentService } from "./tournament.service";
import { WebsocketService } from "./websocket.service";

@Injectable({
  providedIn: "root",
})
export class MatchService {
  private _ws?: WebsocketService;
  #currentMatch = signal<OngoingMatch | undefined>(undefined);
  currentMatch = computed(() => this.#currentMatch());
  lobbyStatus = computed(() =>
    this._ws?.isConnected() ? "Connected to lobby" : undefined,
  );
  lobbyPlayers = this._ws?.lobbyPlayers;

  constructor(private _tournament: TournamentService) {}
  setMatch(match: Match) {
    this.#currentMatch.set({
      ...match,
      p1: {
        id: match.p1,
        name: this.getPlayerName(match.p1),
      },
      p2: {
        id: match.p2,
        name: this.getPlayerName(match.p2),
      },
      picks: [],
      bans: [],
    });
  }

  getPlayerName(id: number) {
    const player = this._tournament
      .currentTournament()!
      .config.players.find((p) => p.id === Number(id));
    if (player) return player.name;
    return "unknown";
  }
}
