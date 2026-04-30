import { effect, Injectable, signal } from '@angular/core';
import { LobbyPlayer, ScoreData } from '@interfaces/tournament';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private socket?: WebSocket;
  isConnected = signal(false);
  host = signal('Not found');
  lobbyPlayers = signal<LobbyPlayer[]>([]);
  leftScore = signal<ScoreData | undefined>(undefined);
  rightScore = signal<ScoreData | undefined>(undefined);
  leftLUID = signal<number | undefined>(undefined);
  rightLUID = signal<number | undefined>(undefined);

  constructor(private _storage: StorageService) {
    this.connect();
    let wsInfo = this._storage.get('tournament-wsInfo');
    if (wsInfo) {
      this.leftLUID.set(wsInfo.ll);
      this.leftScore.set(wsInfo.ls);
      this.rightLUID.set(wsInfo.rl);
      this.rightScore.set(wsInfo.rs);
      this.lobbyPlayers.set(wsInfo.lp);
    }
    effect(() => {
      this._storage.set('tournament-wsInfo', {
        ll: this.leftLUID(),
        ls: this.leftScore(),
        rl: this.rightLUID(),
        rs: this.rightScore(),
        lp: this.lobbyPlayers(),
      });
    });
  }

  private connect() {
    this.socket = new WebSocket('ws://localhost:2948/socket');
    this.socket.onopen = () => {
      this.isConnected.set(true);
      this.lobbyPlayers.set([]);
    };
    this.socket.onclose = () => {
      this.isConnected.set(false);
      setTimeout(() => this.connect(), 3000);
    };
    this.socket.onmessage = (msg) => {
      console.log(this.isConnected());
      const data = JSON.parse(msg.data);
      this.handleMessage(data);
    };
  }

  private handleMessage(data: any) {
    if (data._type === 'handshake') {
      this.host.set(data.LocalUserName);
    }
    if (data._type === 'event') {
      switch (data._event) {
        case 'RoomJoined':
          break;
        case 'RoomLeaved':
          this.lobbyPlayers.set([]);
          break;
        case 'PlayerJoined':
          this.lobbyPlayers.update((prev) => [
            ...prev,
            { id: data.PlayerJoined.LUID, name: data.PlayerJoined.UserName },
          ]);
          break;
        case 'PlayerLeaved':
          this.lobbyPlayers.update((prev) =>
            prev.filter((p) => p.id !== data.PlayerLeaved.LUID),
          );
          break;
        case 'Score':
          this.processScore(data.Score);
          break;
      }
    }
  }

  private processScore(score: any) {
    const data: ScoreData = {
      luid: score.LUID,
      accuracy: this.formatAcc(score.Accuracy),
      combo: score.Combo,
      missCount: score.MissCount,
    };
    if (score.LUID == this.leftLUID()) this.leftScore.set(data);
    if (score.LUID == this.rightLUID()) this.rightScore.set(data);
  }

  formatAcc(acc: number | undefined): string {
    if (acc === undefined) return '0.00%';
    return (acc * 100).toFixed(2) + '%';
  }
}
