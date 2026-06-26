/** A single card. Cards pair up by `kind`; the Mico is the one card with no pair. */
export interface Card {
  /** Stable unique id within a game. */
  id: string;
  /** Cards with the same kind form a pair. The Mico has a unique kind. */
  kind: string;
  /** True only for the single unpaired "Mico" card. */
  isMico: boolean;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  /** Number of pairs this player has discarded (their "montinho"). */
  pairs: number;
  /** True once the player has emptied their hand (they are safe). */
  finished: boolean;
}

export type GamePhase = "lobby" | "playing" | "finished";

export interface GameState {
  /** Room / match id. */
  id: string;
  phase: GamePhase;
  players: Player[];
  /** Index into `players` of the player who draws on the current turn. */
  turnIndex: number;
  /** Number of pairs (excluding the Mico) the deck was built with. */
  pairCount: number;
  /** Seed used to build the deck, for reproducibility. */
  seed: number;
  /** Set when the game ends: the player left holding the Mico loses. */
  loserId: string | null;
  /** Append-only event log of everything that happened. */
  log: GameEvent[];
}

export type GameEvent =
  | { type: "dealt"; at: number }
  | { type: "discardedPair"; playerId: string; kind: string; at: number }
  | {
      type: "drew";
      drawerId: string;
      fromId: string;
      cardId: string;
      paired: boolean;
      at: number;
    }
  | { type: "playerFinished"; playerId: string; at: number }
  | { type: "gameOver"; loserId: string; at: number };

/** The only move available to a player: draw a hidden card from the target. */
export interface DrawMove {
  type: "draw";
  /** Index into the target player's hand (the drawer cannot see the cards). */
  cardIndex: number;
}

export type Move = DrawMove;

export interface CreateGameOptions {
  id: string;
  seed: number;
  /** Number of pairs in the deck (total cards = pairCount * 2 + 1). */
  pairCount?: number;
}

export interface PlayerInput {
  id: string;
  name: string;
}
