import { describe, expect, it } from "vitest";
import { GameServer } from "./server.js";
import { encode } from "./protocol.js";
import type { ServerMessage } from "./protocol.js";

/** In-memory harness: capture the latest message delivered to each connection. */
function harness() {
  const inbox = new Map<string, ServerMessage[]>();
  const server = new GameServer({
    send: (connId, msg) => {
      const list = inbox.get(connId) ?? [];
      list.push(msg);
      inbox.set(connId, list);
    },
    seed: () => 4242,
  });
  const last = (connId: string) => {
    const list = inbox.get(connId) ?? [];
    return list[list.length - 1];
  };
  const find = <T extends ServerMessage["t"]>(connId: string, t: T) =>
    (inbox.get(connId) ?? []).find((m): m is Extract<ServerMessage, { t: T }> => m.t === t);
  return { server, inbox, last, find };
}

describe("GameServer", () => {
  it("creates a room for the first joiner and makes them host", () => {
    const { server, find } = harness();
    server.handleMessage("c1", encode({ t: "join", roomId: "sala", name: "Ana" }));
    const joined = find("c1", "joined");
    expect(joined).toBeDefined();
    expect(joined!.playerId).toBe(joined!.hostId);
  });

  it("rejects start from a non-host", () => {
    const { server, last } = harness();
    server.handleMessage("c1", encode({ t: "join", roomId: "sala", name: "Ana" }));
    server.handleMessage("c2", encode({ t: "join", roomId: "sala", name: "Bia" }));
    server.handleMessage("c2", encode({ t: "start" }));
    const err = last("c2");
    expect(err?.t).toBe("error");
    if (err?.t === "error") expect(err.code).toBe("not_host");
  });

  it("plays a full match to completion, hiding opponents' cards", () => {
    const { server, last } = harness();
    const conns = ["c1", "c2", "c3"];
    const names = ["Ana", "Bia", "Caio"];
    conns.forEach((c, i) =>
      server.handleMessage(c, encode({ t: "join", roomId: "sala", name: names[i]! })),
    );
    server.handleMessage("c1", encode({ t: "start", pairCount: 10 }));

    const playerIdOf = (connId: string) => {
      const j = (server as unknown as { conns: Map<string, { playerId: string }> }).conns;
      return j.get(connId)!.playerId;
    };

    let guard = 0;
    while (guard++ < 5000) {
      const view = last("c1");
      if (view?.t !== "state") break;
      if (view.state.phase === "finished") break;
      const turnId = view.state.players[view.state.turnIndex]!.id;
      const connId = conns.find((c) => playerIdOf(c) === turnId)!;
      server.handleMessage(connId, encode({ t: "move", move: { type: "draw", cardIndex: 0 } }));
    }

    const view = last("c1");
    expect(view?.t).toBe("state");
    if (view?.t === "state") {
      expect(view.state.phase).toBe("finished");
      expect(view.state.loserId).not.toBeNull();
      // c1 sees opponents' hands redacted.
      const me = playerIdOf("c1");
      for (const p of view.state.players) {
        if (p.id === me) continue;
        expect(p.hand.every((card) => card.kind === "hidden")).toBe(true);
      }
    }
  });
});
