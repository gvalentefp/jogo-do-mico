import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { WebSocketServer, type WebSocket } from "ws";
import { GameServer, type ServerMessage } from "@mico/net";

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? "0.0.0.0";
const MAX_PLAYERS = Number(process.env.MAX_PLAYERS ?? 8);

/** connId -> live socket, so the GameServer can push to a single connection. */
const sockets = new Map<string, WebSocket>();

const game = new GameServer({
  maxPlayers: MAX_PLAYERS,
  send: (connId: string, msg: ServerMessage) => {
    const ws = sockets.get(connId);
    if (ws && ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
  },
});

const http = createServer((req, res) => {
  if (req.url === "/healthz" || req.url === "/") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok", rooms: "live" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server: http, path: "/ws" });

wss.on("connection", (ws) => {
  const connId = randomUUID();
  sockets.set(connId, ws);

  ws.on("message", (data) => {
    game.handleMessage(connId, data.toString());
  });
  ws.on("close", () => {
    game.onDisconnect(connId);
    sockets.delete(connId);
  });
  ws.on("error", () => {
    game.onDisconnect(connId);
    sockets.delete(connId);
  });
});

http.listen(PORT, HOST, () => {
  console.log(`[mico] lobby server listening on ws://${HOST}:${PORT}/ws`);
});

const shutdown = () => {
  console.log("[mico] shutting down");
  wss.close();
  http.close(() => process.exit(0));
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
