import type { Move } from "@mico/core";
import {
  decodeServer,
  encode,
  PROTOCOL_VERSION,
  type ClientMessage,
  type ServerMessage,
} from "./protocol.js";

export interface MicoClientHandlers {
  onOpen?: () => void;
  onClose?: (ev: { code: number; reason: string }) => void;
  onMessage?: (msg: ServerMessage) => void;
}

/**
 * Thin WebSocket client. Uses the global `WebSocket`, which exists in the
 * browser, in React Native, and in modern Node — so this single class is the
 * client on every platform we ship (mobile, web, desktop).
 */
export class MicoClient {
  private ws: WebSocket | null = null;
  private readonly handlers: MicoClientHandlers;

  constructor(handlers: MicoClientHandlers = {}) {
    this.handlers = handlers;
  }

  connect(url: string): void {
    const ws = new WebSocket(url);
    this.ws = ws;
    ws.onopen = () => this.handlers.onOpen?.();
    ws.onclose = (ev) =>
      this.handlers.onClose?.({ code: ev.code, reason: ev.reason });
    ws.onmessage = (ev) => {
      try {
        this.handlers.onMessage?.(decodeServer(String(ev.data)));
      } catch {
        /* ignore malformed frames */
      }
    };
  }

  join(roomId: string, name: string): void {
    this.sendMessage({ t: "join", roomId, name, version: PROTOCOL_VERSION });
  }

  start(pairCount?: number): void {
    this.sendMessage({ t: "start", pairCount });
  }

  move(move: Move): void {
    this.sendMessage({ t: "move", move });
  }

  draw(cardIndex: number): void {
    this.move({ type: "draw", cardIndex });
  }

  tease(cardIndex: number | null): void {
    this.sendMessage({ t: "tease", cardIndex });
  }

  leave(): void {
    this.sendMessage({ t: "leave" });
  }

  close(): void {
    this.ws?.close();
    this.ws = null;
  }

  private sendMessage(msg: ClientMessage): void {
    if (this.ws && this.ws.readyState === 1 /* OPEN */) {
      this.ws.send(encode(msg));
    }
  }
}
