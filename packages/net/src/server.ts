import {
  applyMove,
  createGame,
  redactStateFor,
  type GameState,
  type PlayerInput,
} from "@mico/core";
import {
  encode,
  decodeClient,
  PROTOCOL_VERSION,
  type ClientMessage,
  type ErrorCode,
  type PlayerSummary,
  type ServerMessage,
} from "./protocol.js";

export interface GameServerOptions {
  /** Deliver a message to a single connection. */
  send: (connId: string, msg: ServerMessage) => void;
  /** Max players per room. Defaults to 8. */
  maxPlayers?: number;
  /** Seed source for new games. Defaults to a time+counter based seed. */
  seed?: () => number;
}

interface RoomPlayer {
  id: string;
  name: string;
  connId: string | null;
}

interface Room {
  id: string;
  hostId: string;
  order: string[];
  players: Map<string, RoomPlayer>;
  game: GameState | null;
}

/**
 * Transport-agnostic, host-authoritative game server. It owns the canonical
 * `GameState`, validates every move, and pushes redacted state to each player.
 *
 * The same class backs two deployments:
 *  - run inside a player's app (native TCP/WS server) for LAN peer hosting;
 *  - run as the dockerized lobby server for play over the internet.
 */
export class GameServer {
  private readonly send: (connId: string, msg: ServerMessage) => void;
  private readonly maxPlayers: number;
  private readonly seedFn: () => number;
  private readonly rooms = new Map<string, Room>();
  /** connId -> { roomId, playerId } */
  private readonly conns = new Map<string, { roomId: string; playerId: string }>();
  private counter = 0;

  constructor(opts: GameServerOptions) {
    this.send = opts.send;
    this.maxPlayers = opts.maxPlayers ?? 8;
    let n = 0;
    this.seedFn = opts.seed ?? (() => (Date.now() ^ (n++ << 16)) >>> 0);
  }

  /** Handle a raw inbound message from a connection. */
  handleMessage(connId: string, raw: string): void {
    let msg: ClientMessage;
    try {
      msg = decodeClient(raw);
    } catch {
      return this.fail(connId, "bad_request", "Malformed message.");
    }
    switch (msg.t) {
      case "join":
        return this.onJoin(connId, msg);
      case "start":
        return this.onStart(connId, msg);
      case "move":
        return this.onMove(connId, msg);
      case "leave":
        return this.onDisconnect(connId);
      case "ping":
        return this.send(connId, { t: "pong" });
      default:
        return this.fail(connId, "bad_request", "Unknown message type.");
    }
  }

  /** Mark a connection gone; the player stays in the room so they can rejoin. */
  onDisconnect(connId: string): void {
    const ref = this.conns.get(connId);
    if (!ref) return;
    const room = this.rooms.get(ref.roomId);
    this.conns.delete(connId);
    if (!room) return;
    const player = room.players.get(ref.playerId);
    if (player) player.connId = null;

    const anyConnected = [...room.players.values()].some((p) => p.connId !== null);
    if (!anyConnected) {
      this.rooms.delete(room.id);
      return;
    }
    this.broadcast(room);
  }

  private onJoin(
    connId: string,
    msg: Extract<ClientMessage, { t: "join" }>,
  ): void {
    if ((msg.version ?? PROTOCOL_VERSION) !== PROTOCOL_VERSION) {
      return this.fail(connId, "version_mismatch", "Update your app to play.");
    }
    const name = msg.name.trim().slice(0, 24) || "Jogador";
    let room = this.rooms.get(msg.roomId);

    if (!room) {
      const playerId = this.nextId("pl");
      room = {
        id: msg.roomId,
        hostId: playerId,
        order: [playerId],
        players: new Map([[playerId, { id: playerId, name, connId }]]),
        game: null,
      };
      this.rooms.set(room.id, room);
      this.conns.set(connId, { roomId: room.id, playerId });
      this.send(connId, { t: "joined", playerId, roomId: room.id, hostId: room.hostId });
      return this.broadcast(room);
    }

    if (room.game) {
      return this.fail(connId, "game_in_progress", "This match already started.");
    }
    if (room.players.size >= this.maxPlayers) {
      return this.fail(connId, "room_full", "This room is full.");
    }
    if ([...room.players.values()].some((p) => p.name === name)) {
      return this.fail(connId, "name_taken", "That name is already taken.");
    }

    const playerId = this.nextId("pl");
    room.players.set(playerId, { id: playerId, name, connId });
    room.order.push(playerId);
    this.conns.set(connId, { roomId: room.id, playerId });
    this.send(connId, { t: "joined", playerId, roomId: room.id, hostId: room.hostId });
    this.broadcast(room);
  }

  private onStart(
    connId: string,
    msg: Extract<ClientMessage, { t: "start" }>,
  ): void {
    const { room, playerId } = this.locate(connId) ?? {};
    if (!room || !playerId) return this.fail(connId, "room_not_found", "Join a room first.");
    if (playerId !== room.hostId) {
      return this.fail(connId, "not_host", "Only the host can start the match.");
    }
    if (room.game) return this.fail(connId, "game_in_progress", "Already started.");
    if (room.players.size < 2) {
      return this.fail(connId, "bad_request", "Need at least 2 players.");
    }

    const inputs: PlayerInput[] = room.order.map((id) => ({
      id,
      name: room.players.get(id)!.name,
    }));
    room.game = createGame(inputs, {
      id: room.id,
      seed: this.seedFn(),
      pairCount: msg.pairCount,
    });
    this.broadcast(room);
  }

  private onMove(
    connId: string,
    msg: Extract<ClientMessage, { t: "move" }>,
  ): void {
    const { room, playerId } = this.locate(connId) ?? {};
    if (!room || !playerId) return this.fail(connId, "room_not_found", "Join a room first.");
    if (!room.game) return this.fail(connId, "bad_request", "The match has not started.");
    try {
      applyMove(room.game, playerId, msg.move);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid move.";
      const code: ErrorCode = /turn/i.test(message) ? "not_your_turn" : "bad_request";
      return this.fail(connId, code, message);
    }
    this.broadcast(room);
  }

  private broadcast(room: Room): void {
    const summaries = this.summaries(room);
    for (const player of room.players.values()) {
      if (player.connId === null) continue;
      if (room.game) {
        this.send(player.connId, {
          t: "state",
          state: redactStateFor(room.game, player.id),
          players: summaries,
        });
      } else {
        this.send(player.connId, {
          t: "lobby",
          roomId: room.id,
          hostId: room.hostId,
          players: summaries,
        });
      }
    }
  }

  private summaries(room: Room): PlayerSummary[] {
    return room.order.map((id) => {
      const p = room.players.get(id)!;
      const gamePlayer = room.game?.players.find((gp) => gp.id === id);
      return {
        id,
        name: p.name,
        handCount: gamePlayer ? gamePlayer.hand.length : 0,
        finished: gamePlayer ? gamePlayer.finished : false,
        connected: p.connId !== null,
      };
    });
  }

  private locate(connId: string): { room: Room; playerId: string } | null {
    const ref = this.conns.get(connId);
    if (!ref) return null;
    const room = this.rooms.get(ref.roomId);
    if (!room) return null;
    return { room, playerId: ref.playerId };
  }

  private fail(connId: string, code: ErrorCode, message: string): void {
    this.send(connId, { t: "error", code, message });
  }

  private nextId(prefix: string): string {
    return `${prefix}_${(++this.counter).toString(36)}`;
  }
}

export { encode };
