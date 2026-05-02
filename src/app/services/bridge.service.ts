import { Injectable, OnDestroy, signal } from "@angular/core";

export type BridgeMessage =
  | { type: "match:set"; matchId: number }
  | { type: "match:firstPick"; playerId: number }
  | { type: "match:reset" }
  | { type: "match:swap" }
  | { type: "map:win"; mapId: string; player: 1 | 2; bestOf: number }
  | { type: "map:lose"; mapId: string; bestOf: number }
  | { type: "map:ban"; playerName: string; mapId: string }
  | { type: "map:pick"; playerName: string | undefined; mapId: string }
  | { type: "ws:linkP1"; luid: number }
  | { type: "ws:linkP2"; luid: number };

type Handler<T extends BridgeMessage> = (msg: T) => void;
type HandlerMap = {
  [K in BridgeMessage["type"]]?: Handler<Extract<BridgeMessage, { type: K }>>[];
};

@Injectable({ providedIn: "root" })
export class BridgeService implements OnDestroy {
  private channel = new BroadcastChannel("tocxxio-stream");
  isSupported = signal("BroadcastChannel" in window);

  constructor() {
    this.channel.onmessage = (e) => this.dispatch(e.data as BridgeMessage);
  }

  private handlers: HandlerMap = {};

  send(msg: BridgeMessage) {
    this.channel.postMessage(msg);
  }

  on<T extends BridgeMessage["type"]>(
    type: T,
    handler: Handler<Extract<BridgeMessage, { type: T }>>,
  ) {
    if (!this.handlers[type]) (this.handlers as any)[type] = [];
    (this.handlers[type] as any[]).push(handler);
  }

  off<T extends BridgeMessage["type"]>(
    type: T,
    handler: Handler<Extract<BridgeMessage, { type: T }>>,
  ) {
    const arr = this.handlers[type] as any[] | undefined;
    if (arr) (this.handlers as any)[type] = arr.filter((h) => h !== handler);
  }

  private dispatch(msg: BridgeMessage) {
    (this.handlers[msg.type] as Handler<any>[] | undefined)?.forEach((h) =>
      h(msg),
    );
  }

  ngOnDestroy() {
    this.channel.close();
  }
}
