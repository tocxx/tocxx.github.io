import {
  computed,
  effect,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { StorageService } from './storage.service';
import { Map, Pool, TournamentObject } from '@interfaces/tournament';
import { HttpClient, HttpParams } from '@angular/common/http';
import { categories, difficulties } from '../pages/tournament/consts';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  #challongeTournaments: WritableSignal<TournamentObject[]> = signal([]);
  challongeTournaments = computed(() => this.#challongeTournaments());
  #tournaments: WritableSignal<TournamentObject[]> = signal([]);
  tournaments = computed(() => this.#tournaments());
  #currentId: WritableSignal<string | undefined> = signal(undefined);
  currentId = computed(() => this.#currentId());
  currentTournament = computed(() =>
    this.tournaments().find((t) => t.id === this.currentId()),
  );

  constructor(
    private _http: HttpClient,
    private _storage: StorageService,
  ) {
    let tournaments = _storage.get('tournaments');
    if (tournaments) this.#tournaments.set(JSON.parse(tournaments));
    let apiKey = _storage.get('apiKey');
    if (apiKey) this.fetchChallongeTournaments(apiKey);
    effect(() => {
      this._storage.set('tournaments', this.tournaments());
    });
  }

  async fetchChallongeTournaments(apiKey: string) {
    const params = new HttpParams().set('api_key', apiKey);
    this._http
      .get<any>('https://challonge-proxy.jonas00.com/proxy/tournaments.json', {
        params,
      })
      .subscribe({
        next: (res) => {
          this._storage.set('apiKey', apiKey);
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
    const saved = this.tournaments().find((t) => t.id === id);
    if (!saved) {
      this.#tournaments.update((current) => [...current, tournament]);
      this.setTournament(tournament);
    } else {
      tournament.config = saved.config;
      this.#tournaments.update((current) =>
        current.map((t) => (t.id === tournament.id ? tournament : t)),
      );
    }
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
      this.#tournaments.update((current) =>
        current.map((t) => (t.id === tournament.id ? tournament : t)),
      );
    } else {
      this.#tournaments.update((current) => [tournament, ...current]);
    }
    this.setTournament(tournament);
  }

  setTournament(tournament: TournamentObject) {
    this.#currentId.set(tournament.id);
  }

  resetCurrent() {
    this.#currentId.set(undefined);
  }

  addPool() {
    this.#tournaments.update((current) =>
      current.map((t) =>
        t.id === this.currentId()
          ? {
              ...t,
              config: {
                ...t.config,
                pools: [...t.config.pools, { matchIds: [], maps: [] }],
              },
            }
          : t,
      ),
    );
  }

  deletePool(index: number) {
    this.#tournaments.update((current) =>
      current.map((t) =>
        t.id === this.currentId()
          ? {
              ...t,
              config: {
                ...t.config,
                pools: t.config.pools.filter((p, i) => i !== index),
              },
            }
          : t,
      ),
    );
  }

  updatePool(index: number, update: Pool) {
    this.#tournaments.update((current) =>
      current.map((t) =>
        t.id === this.currentId()
          ? {
              ...t,
              config: {
                ...t.config,
                pools: t.config.pools.map((p, i) => (i === index ? update : p)),
              },
            }
          : t,
      ),
    );
  }

  playlistUpload(pool: Pool, poolIndex: number, jsonObject: any) {
    const maps: Map[] = jsonObject.songs.map((song: any) => {
      const existing = maps.find((m) => m.id === song.key);
      let diff = 0;
      if (song.difficulties) {
        let diffname = song.difficulties[0].name.toLowerCase();
        if (diffname == 'normal') diff = 1;
        if (diffname == 'hard') diff = 2;
        if (diffname == 'expert') diff = 3;
        if (diffname == 'expertplus') diff = 4;
      }
      if (!existing || !existing.metadata) {
        return this._http
          .get(`https://api.beatsaver.com/maps/id/${song.key}`)
          .subscribe({
            next: (res: any) => {
              let version = res.versions.find(
                (v: any) => v.state === 'Published',
              );
              if (!version)
                return console.error(
                  `Couldn't find a published version of map ${song.key}`,
                );
              return {
                id: song.key,
                metadata: {
                  category: categories[0],
                  difficulty: difficulties[diff],
                  cover: version.coverURL,
                  artist: res.metadata.songAuthorName,
                  title: res.metadata.songName,
                  description: `Mapped by ${res.metadata.levelAuthorName}`,
                },
              };
            },
            error: (err: any) => {
              console.error(
                `Failed to fetch map info from Beatsaver for ${song.key}`,
                err,
              );
            },
          });
      }
      if (existing.metadata.difficulty !== difficulties[diff])
        return {
          ...existing,
          metadata: { ...existing.metadata, difficulty: difficulties[diff] },
        };
      return existing;
    });
    if (maps.length <= 0) return;
    const update = { ...pool };
    update.maps = maps;
    this.updatePool(poolIndex, update);
  }
}
