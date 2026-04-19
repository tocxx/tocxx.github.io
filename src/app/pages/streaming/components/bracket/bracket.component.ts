import { Component, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { TournamentMainBracketComponent } from "src/app/pages/tournament/components/mainbracket/mainbracket.component";
import { TournamentService } from "@services/tournament.service";

@Component({
  selector: "streaming-bracket",
  imports: [CommonModule, TournamentMainBracketComponent],
  templateUrl: "./bracket.component.html",
})
export class StreamingBracketComponent {
  _tournament = inject(TournamentService);
  currentTournament = this._tournament.currentTournament;
  private route = inject(ActivatedRoute);
  routeType = toSignal(this.route.params.pipe(map((p) => p["type"])));
  matches = computed(() => this.currentTournament()!.config.matches);
  players = computed(() => this.currentTournament()!.config.players);
}
