import { buildDeck } from "./deck.js";
import { createRng, shuffle } from "./rng.js";
import type {
  Card,
  CreateGameOptions,
  GameEvent,
  GameState,
  Move,
  Player,
  PlayerInput,
} from "./types.js";

const DEFAULT_PAIR_COUNT = 10;

/** Placeholder card used when redacting another player's hidden hand. */
export const HIDDEN_CARD: Card = { id: "hidden", kind: "hidden", isMico: false };

/**
 * Create and deal a new game. The deck is built from a seed and shuffled
 * deterministically, cards are dealt round-robin, and every player's initial
 * pairs are discarded. The first turn goes to the first player who still has
 * cards.
 */
export function createGame(
  playerInputs: readonly PlayerInput[],
  options: CreateGameOptions,
): GameState {
  if (playerInputs.length < 2) {
    throw new Error("A game needs at least 2 players.");
  }
  const pairCount = options.pairCount ?? DEFAULT_PAIR_COUNT;
  const rng = createRng(options.seed);
  const deck = shuffle(buildDeck(pairCount), rng);

  const players: Player[] = playerInputs.map((p) => ({
    id: p.id,
    name: p.name,
    hand: [],
    finished: false,
  }));

  // Deal round-robin.
  deck.forEach((card, i) => {
    players[i % players.length]!.hand.push(card);
  });

  const state: GameState = {
    id: options.id,
    phase: "playing",
    players,
    turnIndex: 0,
    pairCount,
    seed: options.seed,
    loserId: null,
    log: [{ type: "dealt", at: 0 }],
  };

  // Initial discard of pairs for every player.
  for (const player of players) {
    discardAllPairs(player, state.log);
  }
  markFinishedPlayers(state);
  state.turnIndex = nextActiveFrom(state, 0);

  checkGameOver(state);
  return state;
}

/**
 * Apply a move. Validates that it is `playerId`'s turn, draws the chosen hidden
 * card from the next active player, discards a pair if one forms, then advances
 * the turn. Mutates and returns `state`.
 */
export function applyMove(
  state: GameState,
  playerId: string,
  move: Move,
): GameState {
  if (state.phase !== "playing") {
    throw new Error(`Cannot move while game phase is "${state.phase}".`);
  }
  const drawer = state.players[state.turnIndex]!;
  if (drawer.id !== playerId) {
    throw new Error(`It is not ${playerId}'s turn (current: ${drawer.id}).`);
  }

  const targetIndex = nextActiveFrom(state, state.turnIndex + 1);
  const target = state.players[targetIndex]!;
  if (target.id === drawer.id) {
    throw new Error("No valid target to draw from.");
  }
  if (move.cardIndex < 0 || move.cardIndex >= target.hand.length) {
    throw new Error(
      `cardIndex ${move.cardIndex} out of range for target hand of size ${target.hand.length}.`,
    );
  }

  const at = state.log.length;
  const [card] = target.hand.splice(move.cardIndex, 1) as [Card];
  drawer.hand.push(card);

  // The hand invariant guarantees at most one existing card per kind, so the
  // drawn card forms at most one pair.
  const matchIndex = drawer.hand.findIndex(
    (c) => c !== card && c.kind === card.kind,
  );
  const paired = matchIndex !== -1;
  if (paired) {
    const drawnIndex = drawer.hand.indexOf(card);
    // Remove both cards (remove the higher index first to keep indices valid).
    const [hi, lo] = [Math.max(matchIndex, drawnIndex), Math.min(matchIndex, drawnIndex)];
    drawer.hand.splice(hi, 1);
    drawer.hand.splice(lo, 1);
    state.log.push({ type: "discardedPair", playerId: drawer.id, kind: card.kind, at });
  }

  state.log.push({
    type: "drew",
    drawerId: drawer.id,
    fromId: target.id,
    cardId: card.id,
    paired,
    at,
  });

  markFinishedPlayers(state);
  if (checkGameOver(state)) {
    return state;
  }
  state.turnIndex = nextActiveFrom(state, state.turnIndex + 1);
  return state;
}

/**
 * Return a copy of the state safe to send to `viewerId`: every other player's
 * hand is replaced by hidden placeholders (counts are preserved). The viewer
 * sees their own hand in full.
 */
export function redactStateFor(state: GameState, viewerId: string): GameState {
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === viewerId
        ? { ...p, hand: p.hand.slice() }
        : { ...p, hand: p.hand.map(() => HIDDEN_CARD) },
    ),
    log: state.log.slice(),
  };
}

// --- internal helpers ---

function discardAllPairs(player: Player, log: GameEvent[]): void {
  const byKind = new Map<string, Card[]>();
  for (const card of player.hand) {
    const bucket = byKind.get(card.kind);
    if (bucket) bucket.push(card);
    else byKind.set(card.kind, [card]);
  }
  const keep: Card[] = [];
  for (const [kind, cards] of byKind) {
    const pairs = Math.floor(cards.length / 2);
    for (let i = 0; i < pairs; i++) {
      log.push({ type: "discardedPair", playerId: player.id, kind, at: log.length });
    }
    // Keep the leftover (0 or 1) card.
    if (cards.length % 2 === 1) keep.push(cards[cards.length - 1]!);
  }
  player.hand = keep;
}

function markFinishedPlayers(state: GameState): void {
  for (const player of state.players) {
    if (!player.finished && player.hand.length === 0) {
      player.finished = true;
      state.log.push({
        type: "playerFinished",
        playerId: player.id,
        at: state.log.length,
      });
    }
  }
}

function activeCount(state: GameState): number {
  return state.players.reduce((n, p) => n + (p.hand.length > 0 ? 1 : 0), 0);
}

/** Index of the next player (clockwise, wrapping) at or after `start` who still holds cards. */
function nextActiveFrom(state: GameState, start: number): number {
  const n = state.players.length;
  for (let step = 0; step < n; step++) {
    const idx = (((start + step) % n) + n) % n;
    if (state.players[idx]!.hand.length > 0) return idx;
  }
  // No active players (all hands empty) — should not happen mid-game.
  return ((start % n) + n) % n;
}

/** End the game if one or zero players still hold cards. Returns true if over. */
function checkGameOver(state: GameState): boolean {
  if (activeCount(state) <= 1) {
    const holder = state.players.find((p) => p.hand.length > 0);
    state.phase = "finished";
    state.loserId = holder ? holder.id : null;
    if (holder) {
      state.log.push({ type: "gameOver", loserId: holder.id, at: state.log.length });
    }
    return true;
  }
  return false;
}
