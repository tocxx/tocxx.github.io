import {
  Component,
  signal,
  HostListener,
  inject,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { TournamentService } from "@services/tournament.service";
import { MatchService } from "@services/match.service";
import { WebsocketService } from "@services/websocket.service";

@Component({
  selector: "streaming-config",
  imports: [CommonModule],
  templateUrl: "./config.component.html",
})
export class StreamingConfigComponent {
  _tournament = inject(TournamentService);
  _match = inject(MatchService);
  _ws = inject(WebsocketService);
  availableMatches = computed(() =>
    this.tournament()!.config.matches.filter((m) => m.p1 && m.p2 && !m.winner),
  );
  tournament = this._tournament.currentTournament;
  currentMatch = this._match.currentMatch;
  isVisible = signal(false);

  @HostListener("window:keydown", ["$event"])
  handleKeyDown(event: KeyboardEvent) {
    if (
      event.key.toLowerCase() === "c" &&
      !(event.target instanceof HTMLInputElement)
    ) {
      this.isVisible.update((v) => !v);
    } else if (event.key === "Escape" && this.isVisible()) {
      this.isVisible.set(false);
    }
  }

  getPlayerName(id: number) {
    return this._match.getPlayerName(id);
  }

  selectMatch(e: Event) {
    const select = e.target as HTMLSelectElement;
    const val = select.value;
    if (!val) return;
    const matchId = Number(val);
    const match = this.tournament()!.config.matches.find(
      (m) => m.id === matchId,
    );
    if (!match) return;
    this._match.setMatch(match);
  }

  selectFirstPick(e: Event) {
    const select = e.target as HTMLSelectElement;
    const val = select.value;
    const match = this.currentMatch();
    if (!val || !match) return;
    const playerId = Number(val);
    this._match.setFirstPick(playerId);
  }

  linkP1(e: Event) {
    const select = e.target as HTMLSelectElement;
    const val = select.value;
    if (!val) return;
    this._ws.leftLUID.set(Number(val));
  }

  linkP2(e: Event) {
    const select = e.target as HTMLSelectElement;
    const val = select.value;
    if (!val) return;
    this._ws.rightLUID.set(Number(val));
  }
}
