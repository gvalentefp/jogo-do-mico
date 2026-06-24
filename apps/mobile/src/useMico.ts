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
  const clientRef = useRef<MicoClient | null>(null);

  const onMessage = useCallback((msg: ServerMessage) => {
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
  const draw = useCallback((cardIndex: number) => clientRef.current?.draw(cardIndex), []);
  const leave = useCallback(() => {
    clientRef.current?.leave();
    clientRef.current?.close();
    clientRef.current = null;
    setView(INITIAL);
  }, []);

  const isMyTurn =
    view.game?.phase === "playing" &&
    view.game.players[view.game.turnIndex]?.id === view.playerId;
  const isHost = view.playerId !== null && view.playerId === view.hostId;

  return { view, connect, start, draw, leave, isMyTurn, isHost };
}
