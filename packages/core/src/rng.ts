/**
 * Deterministic, seedable PRNG (mulberry32).
 *
 * The host runs the authoritative game simulation. Using a seeded RNG means a
 * given seed + sequence of moves always produces the same state, which makes
 * the game reproducible, testable, and verifiable by clients.
 */
export interface Rng {
  /** Returns a float in [0, 1). */
  next(): number;
  /** Returns an integer in [0, maxExclusive). */
  int(maxExclusive: number): number;
  /** Current internal state, so it can be serialized/restored. */
  readonly state: number;
}

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  const api: Rng = {
    next() {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    int(maxExclusive: number) {
      return Math.floor(api.next() * maxExclusive);
    },
    get state() {
      return a >>> 0;
    },
  };
  return api;
}

/** Fisher-Yates shuffle using the provided Rng. Returns a new array. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}
