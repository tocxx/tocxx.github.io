import {
  computed,
  Injectable,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { Match, TournamentObject } from '@interfaces/tournament';
import { TournamentService } from './tournament.service';

@Injectable({
  providedIn: 'root',
})
export class StreamingService {
  tournament: Signal<TournamentObject | undefined> = computed(() => undefined);
  #nextMatch: WritableSignal<Match | undefined> = signal(undefined);
  nextMatch = computed(() => this.#nextMatch());

  constructor(private _tournament: TournamentService) {
    this.tournament = computed(() => _tournament.currentTournament());
  }
}
