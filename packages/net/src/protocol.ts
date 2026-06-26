import type { GameState, Move } from "@mico/core";

/**
 * Wire protocol for the host-authoritative model. One node (a player's device
 * or the lobby server) runs the authoritative `GameServer`; every participant
 * — including the host's own UI — talks to it through these messages.
 *
 * The transport is a plain WebSocket, so the exact same protocol works for a
 * browser client, a React Native client, and the dockerized lobby server.
 */

export const PROTOCOL_VERSION = 1;

export interface PlayerSummary {
  id: string;
  name: string;
  handCount: number;
  finished: boolean;
  connected: boolean;
}

/** Messages sent from a client to the server. */
export type ClientMessage =
  | { t: "join"; roomId: string; name: string; version?: number }
  | { t: "start"; pairCount?: number }
  | { t: "move"; move: Move }
  | { t: "tease"; cardIndex: number | null }
  | { t: "leave" }
  | { t: "ping" };

/** Messages sent from the server to a client. */
export type ServerMessage =
  | { t: "joined"; playerId: string; roomId: string; hostId: string }
  | { t: "lobby"; roomId: string; hostId: string; players: PlayerSummary[] }
  | { t: "state"; state: GameState; players: PlayerSummary[] }
  | { t: "tease"; fromId: string; cardIndex: number | null }
  | { t: "error"; code: ErrorCode; message: string }
  | { t: "pong" };

export type ErrorCode =
  | "room_full"
  | "room_not_found"
  | "name_taken"
  | "not_host"
  | "bad_request"
  | "not_your_turn"
  | "game_in_progress"
  | "version_mismatch"
  | "internal";

export function encode(msg: ClientMessage | ServerMessage): string {
  return JSON.stringify(msg);
}

export function decodeClient(data: string): ClientMessage {
  return JSON.parse(data) as ClientMessage;
}

export function decodeServer(data: string): ServerMessage {
  return JSON.parse(data) as ServerMessage;
}
