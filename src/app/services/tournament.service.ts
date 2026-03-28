import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { StorageService } from './storage.service';
import { TournamentObject } from '@interfaces/tournament';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  #challongeTournaments: WritableSignal<TournamentObject[]> = signal([]);
  challongeTournaments = computed(() => this.#challongeTournaments());
  #tournaments: WritableSignal<TournamentObject[]> = signal([]);
  tournaments = computed(() => this.#tournaments());
  #currentTournament: WritableSignal<TournamentObject | undefined> =
    signal(undefined);
  currentTournament = computed(() => this.#currentTournament());

  constructor(
    private _http: HttpClient,
    private _storage: StorageService,
  ) {
    let tournaments = _storage.get('tournaments');
    if (tournaments) this.#tournaments.set(JSON.parse(tournaments));
    let apiKey = _storage.get('apiKey');
    if (apiKey) this.fetchChallongeTournaments(apiKey);
  }

  async fetchChallongeTournaments(apiKey: string) {
    const params = new HttpParams().set('api_key', apiKey);

    this._http
      .get<any>('https://challonge-proxy.jonas00.com/proxy/tournaments.json', {
        params,
      })
      .subscribe({
        next: (res) => {
          this.#challongeTournaments.set(
            res.data.map((t: any) => {
              return {
                id: t.id,
                name: t.attributes.name,
                config: {
                  rounds: [],
                  matches: [],
                  players: [],
                  pools: [],
                },
                url: `https://challonge.com/${t.url}`,
                tournament_type: t.attributes.tournament_type,
              };
            }),
          );
        },
        error: (err) => {
          console.error('Could not fetch challonge data', err);
        },
      });
  }

  selectChallongeTournament(id: string) {
    const tournament = this.challongeTournaments().find((t) => t.id === id);
    if (!tournament)
      return console.error("Couldn't pick tournament. Retry the API Key");
  }

  validateTournamentObject(object: any): TournamentObject | undefined {
    if (
      !object.id ||
      !object.name ||
      !object.url ||
      !object.tournament_type ||
      !object.config
    )
      return undefined;
    return {
      id: object.id,
      name: object.name,
      config: object.config,
      url: object.url,
      tournament_type: object.tournament_type,
    };
  }

  uploadConfig(tournament: TournamentObject) {
    const existing = this.tournaments().find((t) => t.id === tournament.id);
    if (existing) {
      this.#tournaments.update((current) => {
        const update = [...current];
        const index = update.indexOf(existing);
        if (index) update[index] = tournament;
        return update;
      });
    } else {
      this.#tournaments.update((current) => [tournament, ...current]);
    }
    this.setTournament(tournament);
    this.saveTournaments();
  }

  saveTournaments() {
    this._storage.set('tournaments', this.tournaments());
  }

  setTournament(tournament: TournamentObject) {
    this.#currentTournament.set(tournament);
  }
}
