import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { BridgeService } from "@services/bridge.service";
import { MatchService } from "@services/match.service";
import { TournamentService } from "@services/tournament.service";
import { WebsocketService } from "@services/websocket.service";
import { StreamingConfigComponent } from "./components/config/config.component";

@Component({
  selector: "streaming",
  template: '<div class="max-w-50"><streaming-config /><router-outlet /></div>',
  imports: [RouterModule, StreamingConfigComponent],
})
export class StreamingPageComponent implements OnInit, OnDestroy {
  private _bridge = inject(BridgeService);
  private _match = inject(MatchService);
  private _tournament = inject(TournamentService);
  private _ws = inject(WebsocketService);

  private onMatchSet = ({
    matchId,
  }: {
    type: "match:set";
    matchId: number;
  }) => {
    const match = this._tournament
      .currentTournament()
      ?.config.matches.find((m) => m.id === matchId);
    if (match) this._match.setMatch(match);
  };
  private onFirstPick = ({
    playerId,
  }: {
    type: "match:firstPick";
    playerId: number;
  }) => this._match.setFirstPick(playerId);
  private onReset = () => this._match.resetPB();
  private onSwap = () => this._match.swapPlayers();
  private onLinkP1 = ({ luid }: { type: "ws:linkP1"; luid: number }) =>
    this._ws.leftLUID.set(luid);
  private onLinkP2 = ({ luid }: { type: "ws:linkP2"; luid: number }) =>
    this._ws.rightLUID.set(luid);

  private onBan = ({
    playerName,
    mapId,
  }: {
    type: "map:ban";
    playerName: string;
    mapId: string;
  }) => {
    const map = this.findMap(mapId);
    if (map) this._match.banMap({ playerName, map });
  };
  private onPick = ({
    playerName,
    mapId,
  }: {
    type: "map:pick";
    playerName: string | undefined;
    mapId: string;
  }) => {
    const map = this.findMap(mapId);
    if (map) this._match.pickMap({ playerName, map });
  };
  private onWin = ({
    mapId,
    player,
    bestOf,
  }: {
    type: "map:win";
    mapId: string;
    player: 1 | 2;
    bestOf: number;
  }) => {
    const map = this.findMap(mapId);
    if (map) this._match.winMap(map, player, bestOf);
  };
  private onLose = ({
    mapId,
    bestOf,
  }: {
    type: "map:lose";
    mapId: string;
    bestOf: number;
  }) => {
    const map = this.findMap(mapId);
    if (map) this._match.loseMap(map, bestOf);
  };

  private findMap(mapId: string) {
    const tournament = this._tournament.currentTournament();
    if (!tournament) return undefined;
    for (const pool of tournament.config.pools)
      for (const map of pool.maps) if (map.id === mapId) return map;
    return undefined;
  }

  ngOnInit() {
    this._bridge.on("match:set", this.onMatchSet);
    this._bridge.on("match:firstPick", this.onFirstPick);
    this._bridge.on("match:reset", this.onReset);
    this._bridge.on("match:swap", this.onSwap);
    this._bridge.on("ws:linkP1", this.onLinkP1);
    this._bridge.on("ws:linkP2", this.onLinkP2);
    this._bridge.on("map:ban", this.onBan);
    this._bridge.on("map:pick", this.onPick);
    this._bridge.on("map:win", this.onWin);
    this._bridge.on("map:lose", this.onLose);
  }

  ngOnDestroy() {
    this._bridge.off("match:set", this.onMatchSet);
    this._bridge.off("match:firstPick", this.onFirstPick);
    this._bridge.off("match:reset", this.onReset);
    this._bridge.off("match:swap", this.onSwap);
    this._bridge.off("ws:linkP1", this.onLinkP1);
    this._bridge.off("ws:linkP2", this.onLinkP2);
    this._bridge.off("map:ban", this.onBan);
    this._bridge.off("map:pick", this.onPick);
    this._bridge.off("map:win", this.onWin);
    this._bridge.off("map:lose", this.onLose);
  }
}
