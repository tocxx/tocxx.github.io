import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentService } from '@services/tournament.service';
import { TournamentMapcardComponent } from '../mapcard/mapcard.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'tournament-home',
  imports: [CommonModule, TournamentMapcardComponent],
  templateUrl: './home.component.html',
})
export class TournamentHomeComponent {
  _tournament = inject(TournamentService);
  pools = computed(() => this._tournament.currentTournament()!.config.pools);
  matches = computed(
    () => this._tournament.currentTournament()!.config.matches,
  );
  players = computed(
    () => this._tournament.currentTournament()!.config.players,
  );
  selectedPoolIndex = signal(0);
  selectedPool = computed(() => {
    const i = this.selectedPoolIndex();
    return this.pools()[i];
  });

  constructor(private _http: HttpClient) {}

  selectPool(index: number) {
    this.selectedPoolIndex.set(index);
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
      if (file.name.toLowerCase().endsWith('.bplist'))
        return this.loadPlaylist(file);
    }
    return;
  }

  async loadPlaylist(file: File) {
    try {
      const content = await file.text();
      const jsonObject = JSON.parse(content);
      if (!jsonObject || !jsonObject.songs) return;
      this._tournament.playlistUpload(
        this.selectedPool(),
        this.selectedPoolIndex(),
        jsonObject,
      );
    } catch (err) {
      console.error(err);
    }
  }

  onDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).classList.remove('border-dashed');
    (e.target as HTMLElement).classList.add('border-solid');
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).classList.remove('border-dashed');
    (e.target as HTMLElement).classList.add('border-solid');
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).classList.remove('border-solid');
    (e.target as HTMLElement).classList.add('border-dashed');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.remove('border-solid');
    (event.target as HTMLElement).classList.add('border-dashed');
    const files = event.dataTransfer?.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isJson = file.name.toLowerCase().endsWith('.bplist');
        if (isJson) return this.loadPlaylist(file);
      }
    }
    return;
  }
}
