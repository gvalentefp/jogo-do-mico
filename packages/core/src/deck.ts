import type { Card } from "./types.js";

/**
 * A small set of themed "kinds" for the Jogo do Mico deck. Each kind becomes a
 * matching pair; one extra unpaired card is the Mico (the monkey). Add more
 * entries here to support larger games.
 */
// Mantido em sincronia com as especies que possuem arte (tools/svg-cards
// animals.py SPECIES). Cada kind tem arte macho (carta -a) e femea (carta -b).
export const KINDS: readonly string[] = [
  "leao",
  "tigre",
  "gato",
  "cao",
  "touro",
  "cavalo",
  "porco",
  "bode",
  "carneiro",
  "coelho",
  "rato",
  "elefante",
  "urso",
  "lobo",
  "raposa",
  "veado",
  "camelo",
  "burro",
  "galo",
  "pato",
  "peru",
  "pavao",
  "hipopotamo",
  "zebra",
];

export const MICO_KIND = "mico";

/** Maximum number of pairs supported by the built-in kind list. */
export const MAX_PAIRS = KINDS.length;

/**
 * Build an unshuffled deck: `pairCount` pairs plus a single Mico card.
 * Total cards = pairCount * 2 + 1.
 */
export function buildDeck(pairCount: number): Card[] {
  if (pairCount < 1) {
    throw new Error(`pairCount must be >= 1, got ${pairCount}`);
  }
  if (pairCount > MAX_PAIRS) {
    throw new Error(
      `pairCount ${pairCount} exceeds available kinds (${MAX_PAIRS}). Add more KINDS.`,
    );
  }

  const cards: Card[] = [];
  for (let i = 0; i < pairCount; i++) {
    const kind = KINDS[i]!;
    cards.push({ id: `${kind}-a`, kind, isMico: false });
    cards.push({ id: `${kind}-b`, kind, isMico: false });
  }
  cards.push({ id: MICO_KIND, kind: MICO_KIND, isMico: true });
  return cards;
}
