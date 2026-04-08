import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Map } from "@interfaces/tournament";
import { TournamentService } from "@services/tournament.service";
import { categories } from "src/app/pages/tournament/consts";

@Component({
  selector: "streaming-mapview",
  imports: [CommonModule],
  templateUrl: "./mapview.component.html",
})
export class StreamingMapviewComponent {
  @Input({ required: true }) map!: Map;
  _tournament = inject(TournamentService);
  cats = categories;

  pickCategory(e: Event) {
    const index = this.cats.findIndex(
      (d) => d.title === (e.target as HTMLSelectElement).value,
    );
    if (index === -1) return;
    this._tournament.updateMap(this.map.id, {
      ...this.map,
      metadata: { ...this.map.metadata!, category: this.cats[index] },
    });
  }
}
