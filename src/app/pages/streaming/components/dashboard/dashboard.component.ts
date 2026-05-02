import { Component, computed, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TournamentService } from "@services/tournament.service";
import { MatchService } from "@services/match.service";
import { WebsocketService } from "@services/websocket.service";
import { BridgeService } from "@services/bridge.service";
import { Map } from "@interfaces/tournament";

@Component({
  selector: "streaming-dashboard",
  imports: [CommonModule],
  templateUrl: "./dashboard.component.html",
})
export class StreamingDashboardComponent implements OnInit {
  _tournament = inject(TournamentService);
  _match = inject(MatchService);
  _ws = inject(WebsocketService);
  _bridge = inject(BridgeService);

  tournament = this._tournament.currentTournament;
  currentMatch = this._match.currentMatch;
  firstPick = this._match.firstPick;
  secondPick = this._match.secondPick;

  availableMatches = computed(
    () =>
      this.tournament()?.config.matches.filter(
        (m) => m.p1 && m.p2 && !m.winner,
      ) ?? [],
  );

  matchPool = computed(() => {
    const match = this.currentMatch();
    const tournament = this.tournament();
    if (!match || !tournament) return undefined;
    return tournament.config.pools.find((p) => p.matchIds.includes(match.id))
      ?.maps;
  });

  bestOf = computed(() => {
    const pool = this.matchPool();
    if (!pool) return undefined;
    if (pool.length < 6) return 3;
    if (pool.length < 8) return 5;
    return 7;
  });

  pbState = computed(() => {
    const match = this.currentMatch();
    const bestOf = this.bestOf();
    if (!bestOf || !match || !this.firstPick() || !this.secondPick())
      return undefined;
    const { bans, picks } = match;
    if (bestOf === 5) {
      if (bans.length < 1) return 1;
      if (bans.length < 2) return 2;
      if (picks.length < 1) return 3;
      if (picks.length < 2) return 4;
      if (picks.length < 3) return 5;
      if (picks.length < 4) return 6;
      return undefined;
    }
    if (bans.length < 1) return 1;
    if (bans.length < 2) return 2;
    if (picks.length < 1) return 3;
    if (picks.length < 2) return 4;
    if (bans.length < 3) return 5;
    if (bans.length < 4) return 6;
    if (picks.length < 3) return 7;
    if (picks.length < 4) return 8;
    if (picks.length < 5) return 9;
    if (picks.length < 6) return 10;
    return undefined;
  });

  groupedMaps = computed(() => {
    const pool = this.matchPool();
    if (!pool) return [];
    const groups: { [key: string]: Map[] } = {};
    pool.forEach((map) => {
      const cat = map.metadata!.category.title;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(map);
    });
    return Object.keys(groups).map((title) => ({ title, maps: groups[title] }));
  });

  ngOnInit() {
    this._bridge.on("match:set", ({ matchId }) => {
      const match = this.tournament()?.config.matches.find(
        (m) => m.id === matchId,
      );
      if (match) this._match.setMatch(match);
    });
    this._bridge.on("match:reset", () => this._match.resetPB());
    this._bridge.on("match:swap", () => this._match.swapPlayers());
    this._bridge.on("match:firstPick", ({ playerId }) =>
      this._match.setFirstPick(playerId),
    );
  }

  getPlayerName(id: number) {
    return this._match.getPlayerName(id);
  }

  selectMatch(e: Event) {
    const matchId = Number((e.target as HTMLInputElement).value);
    const match = this.tournament()!.config.matches.find(
      (m) => m.id === matchId,
    );
    if (!match) return;
    this._match.setMatch(match);
    this._bridge.send({ type: "match:set", matchId });
  }

  selectFirstPick(e: Event) {
    const playerId = Number((e.target as HTMLInputElement).value);
    this._match.setFirstPick(playerId);
    this._bridge.send({ type: "match:firstPick", playerId });
  }

  resetPB() {
    this._match.resetPB();
    this._bridge.send({ type: "match:reset" });
  }

  swapPlayers() {
    this._match.swapPlayers();
    this._bridge.send({ type: "match:swap" });
  }

  refreshMatches() {
    this._tournament.refreshMatches();
  }

  linkP1(e: Event) {
    const luid = Number((e.target as HTMLInputElement).value);
    this._ws.leftLUID.set(luid);
    this._bridge.send({ type: "ws:linkP1", luid });
  }

  linkP2(e: Event) {
    const luid = Number((e.target as HTMLInputElement).value);
    this._ws.rightLUID.set(luid);
    this._bridge.send({ type: "ws:linkP2", luid });
  }

  // --- Picks & Bans ---
  clickMap(map: Map) {
    const match = this.currentMatch();
    const fp = this.firstPick();
    const sp = this.secondPick();
    if (!match || !fp || !sp) return;
    switch (this.pbState()) {
      case 1:
        return this.banMap(fp.name, map);
      case 2:
        return this.banMap(sp.name, map);
      case 3:
        return this.pickMap(sp.name, map);
      case 4:
        this.pickMap(fp.name, map);
        if (this.bestOf() === 3) this.setTieBreaker();
        return;
      case 5:
        if (this.bestOf() === 5) return this.pickMap(fp.name, map);
        return this.banMap(sp.name, map);
      case 6:
        if (this.bestOf() === 5) {
          this.pickMap(sp.name, map);
          this.setTieBreaker();
          return;
        }
        return this.banMap(fp.name, map);
      case 7:
        return this.pickMap(fp.name, map);
      case 8:
        return this.pickMap(sp.name, map);
      case 9:
        return this.pickMap(fp.name, map);
      case 10:
        this.pickMap(sp.name, map);
        this.setTieBreaker();
        return;
    }
  }

  private banMap(playerName: string, map: Map) {
    this._match.banMap({ playerName, map });
    this._bridge.send({ type: "map:ban", playerName, mapId: map.id });
  }

  private pickMap(playerName: string | undefined, map: Map) {
    this._match.pickMap({ playerName, map });
    this._bridge.send({ type: "map:pick", playerName, mapId: map.id });
  }

  private setTieBreaker() {
    const pool = this.matchPool();
    const match = this.currentMatch();
    if (!pool || !match) return;
    const { bans, picks } = match;
    for (const map of pool) {
      if (bans.find((m) => m.map.id === map.id)) continue;
      if (picks.find((m) => m.map.id === map.id)) continue;
      this.pickMap(undefined, map);
      return;
    }
  }

  isBanned(map: Map) {
    return this.currentMatch()?.bans.find((m) => m.map.id === map.id);
  }

  isPicked(map: Map) {
    return this.currentMatch()?.picks.find((m) => m.map.id === map.id);
  }

  pbStateLabel = computed(() => {
    const fp = this.firstPick();
    const sp = this.secondPick();
    const match = this.currentMatch();
    if (!match) return "No match";
    if (!fp || !sp) return `${match.p1.name} vs ${match.p2.name}`;
    switch (this.pbState()) {
      case 1:
        return `${fp.name} banning`;
      case 2:
        return `${sp.name} banning`;
      case 3:
        return `${sp.name} picking`;
      case 4:
        return `${fp.name} picking`;
      case 5:
        return this.bestOf() === 5
          ? `${fp.name} picking`
          : `${sp.name} banning`;
      case 6:
        return this.bestOf() === 5
          ? `${sp.name} picking`
          : `${fp.name} banning`;
      case 7:
        return `${fp.name} picking`;
      case 8:
        return `${sp.name} picking`;
      case 9:
        return `${fp.name} picking`;
      case 10:
        return `${sp.name} picking`;
      default:
        return "Done";
    }
  });

  // --- Match Details (map wins) ---
  currentWinner = 1 as 1 | 2;

  setWinner(n: 1 | 2) {
    this.currentWinner = n;
  }

  toggleMap(map: Map) {
    const bestOf = this.bestOf() ?? 999;
    if (!this.isWon(map.id)) {
      this._match.winMap(map, this.currentWinner, bestOf);
      this._bridge.send({
        type: "map:win",
        mapId: map.id,
        player: this.currentWinner,
        bestOf,
      });
    } else {
      this._match.loseMap(map, bestOf);
      this._bridge.send({ type: "map:lose", mapId: map.id, bestOf });
    }
  }

  isWon(id: string) {
    const match = this.currentMatch();
    if (!match) return false;
    return [...match.p1.maps, ...match.p2.maps].some((m) => m.id === id);
  }

  getMapWinner(id: string) {
    const match = this.currentMatch();
    if (!match) return null;
    if (match.p1.maps.find((m) => m.id === id)) return match.p1.name;
    if (match.p2.maps.find((m) => m.id === id)) return match.p2.name;
    return null;
  }
}
