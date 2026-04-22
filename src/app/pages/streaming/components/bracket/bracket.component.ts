import {
  AfterViewInit,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { TournamentMainBracketComponent } from "src/app/pages/tournament/components/mainbracket/mainbracket.component";
import { TournamentService } from "@services/tournament.service";
import { HttpClient } from "@angular/common/http";
import { Match, Player, Pool } from "@interfaces/tournament";
import { TournamentLosersBracketComponent } from "src/app/pages/tournament/components/losersbracket/losersbracket.component";

@Component({
  selector: "streaming-bracket",
  imports: [
    CommonModule,
    TournamentMainBracketComponent,
    TournamentLosersBracketComponent,
  ],
  templateUrl: "./bracket.component.html",
})
export class StreamingBracketComponent implements AfterViewInit {
  _tournament = inject(TournamentService);
  _http = inject(HttpClient);
  currentTournament = this._tournament.currentTournament;
  private route = inject(ActivatedRoute);
  routeType = toSignal(this.route.params.pipe(map((p) => p["type"])));
  routeSrc = toSignal(this.route.queryParams.pipe(map((p) => p["src"])));
  matches = signal<Match[] | undefined>(undefined);
  players = signal<Player[] | undefined>(undefined);
  pools = signal<Pool[] | undefined>(undefined);

  ngAfterViewInit() {
    if (this.routeSrc()) {
      this._http.get(this.routeSrc()).subscribe((res: any) => {
        this.matches.set(res.matches);
        this.players.set(res.players);
        this.pools.set(res.pools);
      });
    } else {
      const currentTournament = this.currentTournament();
      if (currentTournament) {
        this.matches.set(currentTournament.config.matches);
        this.players.set(currentTournament.config.players);
        this.pools.set(currentTournament.config.pools);
      }
    }
  }
}
