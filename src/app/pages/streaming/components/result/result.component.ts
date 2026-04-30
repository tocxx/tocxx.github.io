import { Component, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TournamentService } from "@services/tournament.service";
import { MatchService } from "@services/match.service";

@Component({
  selector: "streaming-result",
  imports: [CommonModule],
  templateUrl: "./result.component.html",
})
export class StreamingResultComponent {
  private _match = inject(MatchService);
  currentTournament = inject(TournamentService).currentTournament;
  currentMatch = this._match.currentMatch;
  winnerName = computed(() => {
    const match = this.currentMatch();
    const winnerId = match?.winner;
    if (!match || !winnerId) return "The winner";
    return winnerId === match.p1.id ? match.p1.name : match.p2.name;
  });
}
