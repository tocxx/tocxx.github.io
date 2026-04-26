import { Component, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TournamentService } from "@services/tournament.service";
import { StreamingMapviewComponent } from "../mapview/mapview.component";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";

@Component({
  selector: "streaming-pool",
  imports: [CommonModule, StreamingMapviewComponent],
  templateUrl: "./pool.component.html",
})
export class StreamingPoolComponent {
  private _tournament = inject(TournamentService);
  private route = inject(ActivatedRoute);
  routeId = toSignal(this.route.params.pipe(map((p) => Number(p["id"]))));
  currentPool = computed(() => {
    const tournament = this._tournament.currentTournament();
    const index = this.routeId();
    if (tournament && index !== undefined)
      return tournament.config.pools[index];
    return undefined;
  });
  groupedMaps = computed(() => {
    const pool = this.currentPool();
    if (!pool) return [];
    const groups: { [key: string]: any[] } = {};
    pool.maps.forEach((map) => {
      const catTitle = map.metadata!.category.title;
      if (!groups[catTitle]) groups[catTitle] = [];
      groups[catTitle].push(map);
    });
    return Object.keys(groups).map((title) => ({
      title,
      maps: groups[title],
    }));
  });
}
