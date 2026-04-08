import { Injectable, signal } from "@angular/core";
import { LobbyPlayer, ScoreData } from "@interfaces/tournament";

@Injectable({ providedIn: "root" })
export class WebsocketService {
  private socket?: WebSocket;
  isConnected = signal(false);
  host = signal("Not found");
  lobbyPlayers = signal<LobbyPlayer[]>([]);
  leftScore = signal<ScoreData | undefined>(undefined);
  rightScore = signal<ScoreData | undefined>(undefined);
  leftLUID = signal<string | undefined>(undefined);
  rightLUID = signal<string | undefined>(undefined);

  constructor() {
    this.connect();
  }

  private connect() {
    this.socket = new WebSocket("ws://localhost:2948/socket");
    this.socket.onopen = () => this.isConnected.set(true);
    this.socket.onclose = () => {
      this.isConnected.set(false);
      setTimeout(() => this.connect(), 3000);
    };
    this.socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      this.handleMessage(data);
    };
  }

  private handleMessage(data: any) {
    if (data._type === "handshake") {
      this.host.set(data.LocalUserName);
    }
    if (data._type === "event") {
      switch (data._event) {
        case "RoomJoined":
          break;
        case "RoomLeaved":
          this.lobbyPlayers.set([]);
          break;
        case "PlayerJoined":
          this.lobbyPlayers.update((prev) => [
            ...prev,
            { id: data.PlayerJoined.LUID, name: data.PlayerJoined.UserName },
          ]);
          break;
        case "PlayerLeaved":
          this.lobbyPlayers.update((prev) =>
            prev.filter((p) => p.id !== data.PlayerLeaved.LUID),
          );
          break;
        case "Score":
          this.processScore(data.Score);
          break;
      }
    }
  }

  private processScore(score: any) {
    const data: ScoreData = {
      luid: score.LUID,
      accuracy: score.Accuracy,
      combo: score.Combo,
      missCount: score.MissCount,
    };
    if (score.LUID === this.leftLUID()) this.leftScore.set(data);
    if (score.LUID === this.rightLUID()) this.rightScore.set(data);
  }

  formatAcc(acc: number | undefined): string {
    if (acc === undefined) return "0.00%";
    return (acc * 100).toFixed(2) + "%";
  }
}
