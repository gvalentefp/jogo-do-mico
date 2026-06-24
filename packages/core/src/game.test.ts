import { describe, expect, it } from "vitest";
import { buildDeck, MAX_PAIRS, MICO_KIND } from "./deck.js";
import { applyMove, createGame, redactStateFor } from "./game.js";
import { createRng } from "./rng.js";
import type { GameState, PlayerInput } from "./types.js";

const PLAYERS: PlayerInput[] = [
  { id: "p1", name: "Ana" },
  { id: "p2", name: "Bia" },
  { id: "p3", name: "Caio" },
];

/** Play a full game, picking the drawn card with a seeded RNG, until it ends. */
function playToEnd(state: GameState, pickSeed: number): GameState {
  const rng = createRng(pickSeed);
  let guard = 0;
  while (state.phase === "playing") {
    if (guard++ > 10_000) throw new Error("game did not terminate");
    const drawer = state.players[state.turnIndex]!;
    const target = state.players.find(
      (p, i) => i !== state.turnIndex && p.hand.length > 0,
    );
    // applyMove computes the real target; we only need a valid index bound.
    const bound = target ? target.hand.length : 1;
    applyMove(state, drawer.id, { type: "draw", cardIndex: rng.int(bound) });
  }
  return state;
}

describe("buildDeck", () => {
  it("builds pairCount pairs plus one Mico", () => {
    const deck = buildDeck(5);
    expect(deck).toHaveLength(11);
    expect(deck.filter((c) => c.isMico)).toHaveLength(1);
    const nonMico = deck.filter((c) => !c.isMico);
    const kinds = new Set(nonMico.map((c) => c.kind));
    expect(kinds.size).toBe(5);
  });

  it("rejects pair counts beyond the available kinds", () => {
    expect(() => buildDeck(MAX_PAIRS + 1)).toThrow();
  });
});

describe("createGame", () => {
  it("is deterministic for a given seed", () => {
    const a = createGame(PLAYERS, { id: "r", seed: 42, pairCount: 8 });
    const b = createGame(PLAYERS, { id: "r", seed: 42, pairCount: 8 });
    expect(a.players.map((p) => p.hand.map((c) => c.id))).toEqual(
      b.players.map((p) => p.hand.map((c) => c.id)),
    );
  });

  it("leaves no duplicate kinds in any hand after the initial discard", () => {
    const state = createGame(PLAYERS, { id: "r", seed: 7, pairCount: 10 });
    for (const player of state.players) {
      const kinds = player.hand.map((c) => c.kind);
      expect(new Set(kinds).size).toBe(kinds.length);
    }
  });
});

describe("full game", () => {
  it("ends with exactly one loser holding only the Mico", () => {
    const state = createGame(PLAYERS, { id: "r", seed: 123, pairCount: 10 });
    playToEnd(state, 999);

    expect(state.phase).toBe("finished");
    expect(state.loserId).not.toBeNull();

    const loser = state.players.find((p) => p.id === state.loserId)!;
    expect(loser.hand).toHaveLength(1);
    expect(loser.hand[0]!.kind).toBe(MICO_KIND);

    const others = state.players.filter((p) => p.id !== state.loserId);
    for (const p of others) expect(p.hand).toHaveLength(0);
  });

  it("rejects a move when it is not the player's turn", () => {
    const state = createGame(PLAYERS, { id: "r", seed: 1, pairCount: 6 });
    const notCurrent = state.players[(state.turnIndex + 1) % state.players.length]!;
    expect(() =>
      applyMove(state, notCurrent.id, { type: "draw", cardIndex: 0 }),
    ).toThrow();
  });
});

describe("redactStateFor", () => {
  it("hides other players' cards but preserves counts", () => {
    const state = createGame(PLAYERS, { id: "r", seed: 5, pairCount: 10 });
    const view = redactStateFor(state, "p1");
    const me = view.players.find((p) => p.id === "p1")!;
    const other = view.players.find((p) => p.id === "p2")!;
    const realOther = state.players.find((p) => p.id === "p2")!;

    expect(me.hand.every((c) => c.kind !== "hidden")).toBe(true);
    expect(other.hand).toHaveLength(realOther.hand.length);
    expect(other.hand.every((c) => c.kind === "hidden")).toBe(true);
  });
});
