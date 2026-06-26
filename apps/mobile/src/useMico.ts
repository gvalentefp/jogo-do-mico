import { useCallback, useRef, useState } from "react";
import { MicoClient, type PlayerSummary, type ServerMessage } from "@mico/net";
import type { GameState } from "@mico/core";

export type ConnStatus = "idle" | "connecting" | "connected" | "closed";

export interface MicoView {
  status: ConnStatus;
  playerId: string | null;
  hostId: string | null;
  roomId: string | null;
  players: PlayerSummary[];
  game: GameState | null;
  error: string | null;
}

const INITIAL: MicoView = {
  status: "idle",
  playerId: null,
  hostId: null,
  roomId: null,
  players: [],
  game: null,
  error: null,
};

/**
 * React hook around {@link MicoClient}. Connects to a host-authoritative
 * server (LAN host or lobby server) and exposes the redacted view this player
 * is allowed to see, plus actions.
 */
export function useMico() {
  const [view, setView] = useState<MicoView>(INITIAL);
  // carta que estou oferecendo (minha) e a que um adversario esta sacudindo
  const [offeredIndex, setOfferedIndex] = useState<number | null>(null);
  const [teasing, setTeasing] = useState<{ fromId: string; cardIndex: number | null } | null>(null);
  const clientRef = useRef<MicoClient | null>(null);

  const onMessage = useCallback((msg: ServerMessage) => {
    if (msg.t === "tease") {
      setTeasing(msg.cardIndex == null ? null : { fromId: msg.fromId, cardIndex: msg.cardIndex });
      return;
    }
    setView((v) => {
      switch (msg.t) {
        case "joined":
          return { ...v, playerId: msg.playerId, hostId: msg.hostId, roomId: msg.roomId, error: null };
        case "lobby":
          return { ...v, hostId: msg.hostId, roomId: msg.roomId, players: msg.players, game: null };
        case "state":
          return { ...v, game: msg.state, players: msg.players, error: null };
        case "error":
          return { ...v, error: msg.message };
        default:
          return v;
      }
    });
  }, []);

  const connect = useCallback(
    (url: string, roomId: string, name: string) => {
      const client = new MicoClient({
        onOpen: () => {
          setView((v) => ({ ...v, status: "connected" }));
          client.join(roomId, name);
        },
        onClose: () => setView((v) => ({ ...v, status: "closed" })),
        onMessage,
      });
      clientRef.current = client;
      setView({ ...INITIAL, status: "connecting" });
      client.connect(url);
    },
    [onMessage],
  );

  const start = useCallback((pairCount?: number) => clientRef.current?.start(pairCount), []);
  const draw = useCallback((cardIndex: number) => {
    clientRef.current?.draw(cardIndex);
    setOfferedIndex(null);
  }, []);
  const offer = useCallback((cardIndex: number | null) => {
    setOfferedIndex(cardIndex);
    clientRef.current?.tease(cardIndex);
  }, []);
  const leave = useCallback(() => {
    clientRef.current?.leave();
    clientRef.current?.close();
    clientRef.current = null;
    setOfferedIndex(null);
    setTeasing(null);
    setView(INITIAL);
  }, []);

  const teasingFor = useCallback((playerId: string): number | null => {
    if (playerId === view.playerId) return offeredIndex;
    return teasing && teasing.fromId === playerId ? teasing.cardIndex : null;
  }, [view.playerId, offeredIndex, teasing]);

  const isMyTurn =
    view.game?.phase === "playing" &&
    view.game.players[view.game.turnIndex]?.id === view.playerId;
  const isHost = view.playerId !== null && view.playerId === view.hostId;

  return { view, connect, start, draw, offer, teasingFor, leave, isMyTurn, isHost };
}
