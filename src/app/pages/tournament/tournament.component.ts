import { Component, inject, signal, WritableSignal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TournamentObject } from '@interfaces/tournament';
import { TournamentService } from '@services/tournament.service';

@Component({
  selector: 'tournament',
  templateUrl: './tournament.component.html',
  imports: [RouterModule],
  providers: [TournamentService],
})
export class TournamentPageComponent {
  _tournament = inject(TournamentService);
  challongeTournaments = this._tournament.challongeTournaments;
  tournaments = this._tournament.tournaments;
  fileError = signal(false);
  fileStatus: WritableSignal<string | undefined> = signal(undefined);
  current = this._tournament.currentTournament;

  reset() {
    this._tournament.resetCurrent();
  }

  onAPIKey(e: Event) {
    this._tournament.fetchChallongeTournaments(
      (e.target as HTMLInputElement).value,
    );
  }

  selectChallongeTournament(e: Event) {
    this._tournament.selectChallongeTournament(
      (e.target as HTMLSelectElement).value,
    );
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
    this.fileError.set(false);
    this.fileStatus.set('File dropped');
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).classList.remove('border-solid');
    (event.target as HTMLElement).classList.add('border-dashed');
    const files = event.dataTransfer?.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isJson =
          file.type === 'application/json' ||
          file.name.toLowerCase().endsWith('.json');
        if (isJson) return this.loadConfig(file);
        this.fileError.set(true);
        this.fileStatus.set(
          `Ugyldig filtype: ${file.name}. Vennligst bruk en .json-fil.`,
        );
      }
    }
    return;
  }

  onTournament(tournament: TournamentObject) {
    this._tournament.setTournament(tournament);
  }

  onFileSelected(event: Event) {
    this.fileError.set(false);
    this.fileStatus.set('File selected');
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith('.json'))
        return this.loadConfig(file);
      this.fileError.set(true);
      return this.fileStatus.set(
        `Unsupported file type: ${file.type} for file: ${file.name}`,
      );
    }
  }

  async loadConfig(file: File) {
    this.fileStatus.set(`Validating config file: ${file.name}`);
    this.fileError.set(false);
    try {
      const content = await file.text();
      const jsonObject = JSON.parse(content);
      if (!jsonObject) {
        this.fileError.set(true);
        return this.fileStatus.set('Config file is empty or corrupt.');
      }
      const tournament = this._tournament.validateTournamentObject(jsonObject);
      if (!tournament) {
        this.fileError.set(true);
        return this.fileStatus.set(
          'Config file is not a valid tournament config file.',
        );
      }
      this.fileStatus.set('Config validated, processing...');
      this._tournament.uploadConfig(tournament);
    } catch (err) {
      this.fileError.set(true);
      this.fileStatus.set(`Error while reading JSON: ${err}`);
      console.error(err);
    }
  }
}
