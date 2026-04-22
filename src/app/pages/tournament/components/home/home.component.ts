import { Component, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TournamentService } from "@services/tournament.service";
import { TournamentMapcardComponent } from "../mapcard/mapcard.component";
import { TournamentMainBracketComponent } from "../mainbracket/mainbracket.component";
import { StreamingPoolComponent } from "src/app/pages/streaming/components/pool/pool.component";
import { RouterLink } from "@angular/router";
import { TournamentLosersBracketComponent } from "../losersbracket/losersbracket.component";

@Component({
  selector: "tournament-home",
  imports: [
    CommonModule,
    RouterLink,
    TournamentMapcardComponent,
    TournamentMainBracketComponent,
    TournamentLosersBracketComponent,
    StreamingPoolComponent,
  ],
  templateUrl: "./home.component.html",
})
export class TournamentHomeComponent {
  _tournament = inject(TournamentService);
  currentTournament = this._tournament.currentTournament;
  pools = computed(() => this.currentTournament()!.config.pools);
  matches = computed(() => this.currentTournament()!.config.matches);
  players = computed(() => this.currentTournament()!.config.players);
  currentPoolId = this._tournament.currentPoolId;
  currentPool = computed(() => {
    return this.pools()[this.currentPoolId()];
  });
  matchesInPool = computed(() => {
    return this.matches().filter((m) =>
      this.currentPool().matchIds.includes(m.id),
    );
  });
  matchesNotInAnyPool = computed(() => {
    return this.matches().filter((m) => {
      for (let pool of this.currentTournament()!.config.pools) {
        if (pool.matchIds.includes(m.id)) return false;
      }
      return true;
    });
  });

  constructor() {}

  getPlayerName(id: number) {
    const player = this.players().find((p) => p.id === Number(id));
    if (player) return player.name;
    return "unknown";
  }

  selectPool(index: number) {
    this._tournament.selectPool(index);
  }

  addPool() {
    this._tournament.addPool();
  }

  deletePool(i: number) {
    this._tournament.deletePool(i);
  }

  onPlaylist(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith(".bplist"))
        return this.loadPlaylist(file);
    }
    return;
  }

  async loadPlaylist(file: File) {
    try {
      const content = await file.text();
      const jsonObject = JSON.parse(content);
      if (!jsonObject || !jsonObject.songs) return;
      this._tournament.playlistUpload(this.currentPool(), jsonObject);
    } catch (err) {
      console.error(err);
    }
  }

  onDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).classList.remove("border-dashed");
    (e.target as HTMLElement).classList.add("border-solid");
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).classList.remove("border-dashed");
    (e.target as HTMLElement).classList.add("border-solid");
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).classList.remove("border-solid");
    (e.target as HTMLElement).classList.add("border-dashed");
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.remove("border-solid");
    (event.target as HTMLElement).classList.add("border-dashed");
    const files = event.dataTransfer?.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isJson = file.name.toLowerCase().endsWith(".bplist");
        if (isJson) return this.loadPlaylist(file);
      }
    }
    return;
  }

  refreshMatches() {
    this._tournament.refreshMatches();
  }

  addMatchToPool(e: Event) {
    const select = e.target as HTMLSelectElement;
    const val = select.value;
    if (!val) return;
    const matchId = Number(val);
    const current = this.currentPool();
    const update = {
      ...current,
      matchIds: [...current.matchIds, matchId],
    };
    this._tournament.updatePool(update);
    select.selectedIndex = 0;
  }

  removeMatchFromPool(id: number) {
    const current = this.currentPool();
    const update = {
      ...current,
      matchIds: current.matchIds.filter((mId) => mId !== id),
    };
    this._tournament.updatePool(update);
  }
}
