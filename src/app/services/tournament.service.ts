import { computed, effect, Injectable, signal } from "@angular/core";
import { StorageService } from "./storage.service";
import { Map, Pool, TournamentObject } from "@interfaces/tournament";
import { HttpClient, HttpParams } from "@angular/common/http";
import { categories, difficulties } from "../pages/tournament/consts";
import { lastValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TournamentService {
  #challongeTournaments = signal<TournamentObject[]>([]);
  challongeTournaments = computed(() => this.#challongeTournaments());
  #tournaments = signal<TournamentObject[]>([]);
  tournaments = computed(() => this.#tournaments());
  #currentId = signal<string | undefined>(undefined);
  currentId = computed(() => this.#currentId());
  currentTournament = computed(() =>
    this.tournaments().find((t) => t.id === this.currentId()),
  );
  #currentPoolId = signal<number>(0);
  currentPoolId = computed(() => this.#currentPoolId());

  constructor(
    private _http: HttpClient,
    private _storage: StorageService,
  ) {
    let tournaments = _storage.get("tournaments");
    if (tournaments) this.#tournaments.set(tournaments);
    let apiKey = _storage.get("apiKey");
    if (apiKey) this.fetchChallongeTournaments(apiKey);
    let currentId = this._storage.get("tournament-currentId");
    if (currentId) this.#currentId.set(currentId);
    effect(() => {
      this._storage.set("tournaments", this.tournaments());
      let currentId = this.#currentId();
      if (currentId) this._storage.set("tournament-currentId", currentId);
    });
  }

  async fetchChallongeTournaments(apiKey: string) {
    if (apiKey === "") apiKey = this._storage.get("apiKey") ?? "";
    const params = new HttpParams().set("api_key", apiKey);
    this._http
      .get<any>("https://challonge-proxy.jonas00.com/proxy/tournaments.json", {
        params,
      })
      .subscribe({
        next: (res) => {
          this._storage.set("apiKey", apiKey);
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
          console.error("Could not fetch challonge data", err);
        },
      });
  }

  async fetchParticipants(id: string) {
    const apiKey = this._storage.get("apiKey");
    if (!apiKey) {
      console.error(`Challonge API Key not found.`);
      return undefined;
    }
    const params = new HttpParams().set("api_key", apiKey);
    try {
      const res: any = await lastValueFrom(
        this._http.get(
          `https://challonge-proxy.jonas00.com/proxy/tournaments/${id}/participants.json`,
          {
            params,
          },
        ),
      );
      return res.data.map((p: any) => {
        return {
          id: Number(p.id),
          name: p.attributes.name,
          seed: p.attributes.seed,
          tournament_id: p.attributes.tournament_id,
          final_rank: p.attributes.final_rank ?? undefined,
        };
      });
    } catch (error) {
      console.error(`Error while fetching participants`, error);
      return undefined;
    }
  }

  async fetchMatches(id: string) {
    const apiKey = this._storage.get("apiKey");
    if (!apiKey) {
      console.error(`Challonge API Key not found.`);
      return undefined;
    }
    const params = new HttpParams().set("api_key", apiKey);
    try {
      const res: any = await lastValueFrom(
        this._http.get(
          `https://challonge-proxy.jonas00.com/proxy/tournaments/${id}/matches.json`,
          {
            params,
          },
        ),
      );
      return res.data.map((m: any) => {
        return {
          id: Number(m.id),
          p1: m.attributes.points_by_participant[0].participant_id,
          p2: m.attributes.points_by_participant[1].participant_id,
          round: m.attributes.round,
          loser: m.attributes.winner_id
            ? m.attributes.winner_id ===
              m.attributes.points_by_participant[0].participant_id
              ? m.attributes.points_by_participant[1].participant_id
              : m.attributes.points_by_participant[0].participant_id
            : undefined,
          winner: m.attributes.winner_id ? m.attributes.winner_id : undefined,
        };
      });
    } catch (error) {
      console.error(`Error while fetching matches`, error);
      return undefined;
    }
  }

  async refreshMatches() {
    const current = this.currentTournament();
    if (!current) return;
    const [matches, participants] = await Promise.all([
      this.fetchMatches(current.id),
      this.fetchParticipants(current.id),
    ]);
    if (!matches && !participants) return;
    this.#tournaments.update((ts) =>
      ts.map((t) => {
        if (t.id !== current.id) return t;
        return {
          ...t,
          config: {
            ...t.config,
            ...(matches && { matches }),
            ...(participants && { players: participants }),
          },
        };
      }),
    );
  }

  async selectChallongeTournament(id: string) {
    const challongeBase = this.challongeTournaments().find((t) => t.id === id);
    if (!challongeBase) return console.error("Tournament not found");
    const [matches, participants] = await Promise.all([
      this.fetchMatches(id),
      this.fetchParticipants(id),
    ]);
    const saved = this.tournaments().find((t) => t.id === id);
    const updatedConfig = {
      ...(saved?.config || challongeBase.config),
      ...(matches && { matches }),
      ...(participants && { players: participants }),
    };
    const updatedTournament = {
      ...challongeBase,
      config: updatedConfig,
    };
    this.#tournaments.update((current) => {
      const exists = current.some((t) => t.id === id);
      return exists
        ? current.map((t) => (t.id === id ? updatedTournament : t))
        : [...current, updatedTournament];
    });
    this.setTournament(updatedTournament);
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

  updatePool(update: Pool) {
    this.#tournaments.update((current) =>
      current.map((t) =>
        t.id === this.currentId()
          ? {
              ...t,
              config: {
                ...t.config,
                pools: t.config.pools.map((p, i) =>
                  i === this.currentPoolId() ? update : p,
                ),
              },
            }
          : t,
      ),
    );
  }

  async playlistUpload(pool: Pool, jsonObject: any) {
    const mapPromises = jsonObject.songs.map(async (song: any) => {
      const existing = pool.maps.find((m) => m.id === song.key);
      let diff = 0;
      if (song.difficulties) {
        let diffname = song.difficulties[0].name.toLowerCase();
        if (diffname == "normal") diff = 1;
        if (diffname == "hard") diff = 2;
        if (diffname == "expert") diff = 3;
        if (diffname == "expertplus") diff = 4;
      }
      if (!existing || !existing.metadata) {
        try {
          const res: any = await lastValueFrom(
            this._http.get(`https://api.beatsaver.com/maps/id/${song.key}`),
          );
          let version = res.versions.find((v: any) => v.state === "Published");
          if (!version)
            throw new Error(`No publish version of map ${song.key}`);
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
        } catch (error) {
          console.error(
            `Failed to fetch map info from Beatsaver for ${song.key}`,
            error,
          );
          return { id: song.key };
        }
      }
      if (existing.metadata.difficulty !== difficulties[diff])
        return {
          ...existing,
          metadata: { ...existing.metadata, difficulty: difficulties[diff] },
        };
      return existing;
    });
    const maps = await Promise.all(mapPromises);
    if (maps.length <= 0) return;
    const update = { ...pool, maps: maps };
    this.updatePool(update);
  }

  updateMap(id: string, update: Map) {
    const pool = {
      ...this.currentTournament()!.config.pools[this.currentPoolId()],
    };
    pool.maps = [...pool.maps.map((m) => (m.id === id ? update : m))];
    this.updatePool(pool);
  }

  selectPool(index: number) {
    this.#currentPoolId.set(index);
  }
}
