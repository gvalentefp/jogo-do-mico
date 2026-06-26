import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applyMove,
  createGame,
  redactStateFor,
  type GameState,
  type PlayerInput,
} from "@mico/core";
import type { MicoView } from "./useMico";

const HUMAN_ID = "you";
const BOT_NAMES = ["Téo", "Bia", "Léo", "Mia", "Zeca", "Lila"];

const clone = (s: GameState): GameState => JSON.parse(JSON.stringify(s));
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Indice do proximo jogador ativo (com cartas) a partir de `start`. */
function nextActive(state: GameState, start: number): number {
  const n = state.players.length;
  for (let s = 0; s < n; s++) {
    const i = (start + s) % n;
    if (state.players[i]!.hand.length > 0) return i;
  }
  return start % n;
}

export interface LocalGameOptions {
  humanName: string;
  botCount: number; // 1..3
  onExit: () => void;
}

/**
 * Partida offline contra a IA. Roda o motor (@mico/core) localmente: os bots
 * jogam sozinhos com um pequeno atraso, e podem "morder a isca" quando voce
 * oferece (sacode) uma carta na sua vez de ser comprado.
 */
export function useLocalGame(opts: LocalGameOptions) {
  const stateRef = useRef<GameState | null>(null);
  const [snapshot, setSnapshot] = useState<GameState | null>(null);
  const [offeredIndex, setOfferedIndex] = useState<number | null>(null);
  const [targetTeaseIndex, setTargetTeaseIndex] = useState<number | null>(null);
  const offeredRef = useRef<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sync = useCallback(() => {
    if (stateRef.current) setSnapshot(clone(stateRef.current));
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  // (re)inicia a partida
  const startGame = useCallback(() => {
    const botCount = clamp(opts.botCount, 1, 3);
    const inputs: PlayerInput[] = [{ id: HUMAN_ID, name: opts.humanName || "Você" }];
    for (let i = 0; i < botCount; i++) {
      inputs.push({ id: `bot${i}`, name: BOT_NAMES[i % BOT_NAMES.length]! });
    }
    const pairCount = clamp(inputs.length * 4, 8, 20);
    const seed = (Date.now() & 0xffffffff) >>> 0;
    stateRef.current = createGame(inputs, { id: "solo", seed, pairCount });
    offeredRef.current = null;
    setOfferedIndex(null);
    setTargetTeaseIndex(null);
    sync();
  }, [opts.botCount, opts.humanName, sync]);

  useEffect(() => {
    startGame();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- IA: quando for a vez de um bot, joga sozinho ----
  const runBots = useCallback(() => {
    const state = stateRef.current;
    if (!state || state.phase !== "playing") return;
    const current = state.players[state.turnIndex]!;
    if (current.id === HUMAN_ID) return; // vez do humano: para

    const t = setTimeout(() => {
      const s = stateRef.current;
      if (!s || s.phase !== "playing") return;
      const cur = s.players[s.turnIndex]!;
      if (cur.id === HUMAN_ID) return;
      const target = s.players[nextActive(s, s.turnIndex + 1)]!;

      let idx = Math.floor(Math.random() * target.hand.length);
      // morde a isca: se compra do humano e ha carta oferecida, costuma pega-la
      if (target.id === HUMAN_ID && offeredRef.current != null &&
          offeredRef.current < target.hand.length && Math.random() < 0.7) {
        idx = offeredRef.current;
      }
      applyMove(s, cur.id, { type: "draw", cardIndex: idx });
      offeredRef.current = null;
      setOfferedIndex(null);
      sync();
      runBots(); // encadeia ate voltar pro humano ou acabar
    }, 1500 + Math.random() * 700);
    timers.current.push(t);
  }, [sync]);

  // dispara os bots sempre que o snapshot muda e e a vez deles
  useEffect(() => {
    if (snapshot && snapshot.phase === "playing") {
      const cur = snapshot.players[snapshot.turnIndex]!;
      if (cur.id !== HUMAN_ID) runBots();
    }
    return clearTimers;
  }, [snapshot, runBots, clearTimers]);

  // ---- bot "sacode" uma carta pra te tentar quando e a SUA vez ----
  useEffect(() => {
    if (!snapshot || snapshot.phase !== "playing") return;
    const cur = snapshot.players[snapshot.turnIndex]!;
    if (cur.id !== HUMAN_ID) { setTargetTeaseIndex(null); return; }
    const target = snapshot.players[nextActive(snapshot, snapshot.turnIndex + 1)]!;
    if (target.hand.length === 0) return;
    const tick = setInterval(() => {
      setTargetTeaseIndex(Math.floor(Math.random() * target.hand.length));
    }, 1100);
    return () => clearInterval(tick);
  }, [snapshot]);

  // ---- acoes do humano ----
  const draw = useCallback((cardIndex: number) => {
    const s = stateRef.current;
    if (!s || s.phase !== "playing") return;
    if (s.players[s.turnIndex]!.id !== HUMAN_ID) return;
    try {
      applyMove(s, HUMAN_ID, { type: "draw", cardIndex });
    } catch { return; }
    setTargetTeaseIndex(null);
    sync();
  }, [sync]);

  const tease = useCallback((cardIndex: number | null) => {
    offeredRef.current = cardIndex;
    setOfferedIndex(cardIndex);
  }, []);

  const leave = useCallback(() => {
    clearTimers();
    stateRef.current = null;
    opts.onExit();
  }, [clearTimers, opts]);

  const view: MicoView = useMemo(() => ({
    status: "connected",
    playerId: HUMAN_ID,
    hostId: HUMAN_ID,
    roomId: "solo",
    players: [],
    game: snapshot ? redactStateFor(snapshot, HUMAN_ID) : null,
    error: null,
  }), [snapshot]);

  const isMyTurn = !!snapshot && snapshot.phase === "playing" &&
    snapshot.players[snapshot.turnIndex]!.id === HUMAN_ID;

  const teasingFor = useCallback((playerId: string): number | null => {
    if (playerId === HUMAN_ID) return offeredIndex;
    if (!snapshot || !isMyTurn) return null;
    const target = snapshot.players[nextActive(snapshot, snapshot.turnIndex + 1)]!;
    return playerId === target.id ? targetTeaseIndex : null;
  }, [snapshot, isMyTurn, offeredIndex, targetTeaseIndex]);

  return {
    view, isMyTurn, draw, leave, offer: tease, teasingFor, restart: startGame,
  };
}
