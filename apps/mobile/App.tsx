import { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useMico } from "./src/useMico";
import { PlayingCard } from "./src/PlayingCard";

const DEFAULT_PORT = 8787;

export default function App() {
  const mico = useMico();
  const { view } = mico;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Text style={styles.title}>🐒 Jogo do Mico</Text>
        {view.status !== "connected" ? (
          <ConnectScreen onConnect={mico.connect} status={view.status} />
        ) : view.game ? (
          <Board mico={mico} />
        ) : (
          <Lobby mico={mico} />
        )}
        {view.error ? <Text style={styles.error}>{view.error}</Text> : null}
      </View>
    </GestureHandlerRootView>
  );
}

function ConnectScreen({
  onConnect,
  status,
}: {
  onConnect: (url: string, roomId: string, name: string) => void;
  status: string;
}) {
  const [host, setHost] = useState(Platform.OS === "web" ? "localhost" : "192.168.0.10");
  const [room, setRoom] = useState("sala-1");
  const [name, setName] = useState("");

  return (
    <View style={styles.card}>
      <Text style={styles.hint}>Servidor (host na sua rede ou lobby)</Text>
      <View style={styles.row}>
        <TextInput style={[styles.input, { flex: 1 }]} value={host} onChangeText={setHost} placeholder="IP do host" autoCapitalize="none" />
      </View>
      <Field label="Sala" value={room} onChangeText={setRoom} />
      <Field label="Seu nome" value={name} onChangeText={setName} />
      <Pressable
        style={[styles.button, status === "connecting" && styles.buttonDisabled]}
        disabled={status === "connecting"}
        onPress={() => onConnect(`ws://${host}:${DEFAULT_PORT}/ws`, room.trim() || "sala-1", name.trim() || "Jogador")}
      >
        <Text style={styles.buttonText}>{status === "connecting" ? "Conectando..." : "Entrar"}</Text>
      </Pressable>
    </View>
  );
}

function Lobby({ mico }: { mico: ReturnType<typeof useMico> }) {
  const { view, isHost, start, leave } = mico;
  return (
    <View style={styles.card}>
      <Text style={styles.subtitle}>Sala {view.roomId}</Text>
      {view.players.map((p) => (
        <Text key={p.id} style={styles.player}>
          {p.id === view.hostId ? "👑 " : "• "}
          {p.name}
          {p.id === view.playerId ? " (você)" : ""}
        </Text>
      ))}
      {isHost ? (
        <Pressable
          style={[styles.button, view.players.length < 2 && styles.buttonDisabled]}
          disabled={view.players.length < 2}
          onPress={() => start()}
        >
          <Text style={styles.buttonText}>Começar partida</Text>
        </Pressable>
      ) : (
        <Text style={styles.hint}>Aguardando o host iniciar…</Text>
      )}
      <Pressable style={styles.linkButton} onPress={leave}>
        <Text style={styles.link}>Sair</Text>
      </Pressable>
    </View>
  );
}

function Board({ mico }: { mico: ReturnType<typeof useMico> }) {
  const { view, isMyTurn, draw, leave } = mico;
  const game = view.game!;
  const me = game.players.find((p) => p.id === view.playerId);
  const opponents = game.players.filter((p) => p.id !== view.playerId);

  // The target you draw from is the next active player clockwise from you.
  const targetId = useMemo(() => {
    const order = game.players;
    const myIdx = order.findIndex((p) => p.id === view.playerId);
    for (let step = 1; step <= order.length; step++) {
      const cand = order[(myIdx + step) % order.length]!;
      if (cand.hand.length > 0 && cand.id !== view.playerId) return cand.id;
    }
    return null;
  }, [game.players, view.playerId]);

  const turnName = game.players[game.turnIndex]?.name ?? "";

  if (game.phase === "finished") {
    const loser = game.players.find((p) => p.id === game.loserId);
    const iLost = game.loserId === view.playerId;
    return (
      <View style={styles.card}>
        <Text style={styles.subtitle}>Fim de jogo!</Text>
        <Text style={styles.result}>
          {iLost ? "😅 Você ficou com o Mico!" : `🎉 ${loser?.name ?? "Alguém"} ficou com o Mico!`}
        </Text>
        <Pressable style={styles.linkButton} onPress={leave}>
          <Text style={styles.link}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ gap: 18 }}>
      <Text style={styles.turn}>{isMyTurn ? "Sua vez — puxe uma carta" : `Vez de ${turnName}`}</Text>

      {opponents.map((opp) => {
        const isTarget = isMyTurn && opp.id === targetId;
        return (
          <View key={opp.id} style={styles.opponent}>
            <Text style={styles.player}>
              {opp.name} · {opp.hand.length} cartas {opp.finished ? "✅" : ""}
            </Text>
            <View style={styles.hand}>
              {opp.hand.map((_, i) => (
                <PlayingCard
                  key={i}
                  kind="hidden"
                  faceUp={false}
                  index={i}
                  highlight={isTarget}
                  onPress={isTarget ? () => draw(i) : undefined}
                />
              ))}
            </View>
          </View>
        );
      })}

      <View style={styles.myHandBox}>
        <Text style={styles.player}>Sua mão</Text>
        <View style={styles.hand}>
          {me?.hand.map((c, i) => (
            <PlayingCard key={c.id} kind={c.kind} faceUp index={i} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.hint}>{label}</Text>
      <TextInput style={styles.input} autoCapitalize="none" {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#101626" },
  container: { flex: 1, padding: 20, paddingTop: 60, gap: 18 },
  title: { fontSize: 28, fontWeight: "800", color: "#ffe3b3", textAlign: "center" },
  subtitle: { fontSize: 18, fontWeight: "700", color: "#e8edf7" },
  card: { backgroundColor: "#19223a", borderRadius: 16, padding: 18, gap: 12 },
  row: { flexDirection: "row", gap: 8 },
  input: {
    backgroundColor: "#0d1322",
    color: "#e8edf7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#2b3a67",
  },
  button: { backgroundColor: "#52b788", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  buttonDisabled: { backgroundColor: "#3a4a44", opacity: 0.6 },
  buttonText: { color: "#06231a", fontWeight: "800", fontSize: 16 },
  linkButton: { alignItems: "center", paddingVertical: 8 },
  link: { color: "#9db4e8" },
  hint: { color: "#8ea0c4", fontSize: 13 },
  player: { color: "#e8edf7", fontSize: 15 },
  turn: { color: "#ffe3b3", fontSize: 16, fontWeight: "700", textAlign: "center" },
  opponent: { gap: 8 },
  hand: { flexDirection: "row", flexWrap: "wrap", paddingLeft: 10, rowGap: 12 },
  myHandBox: { backgroundColor: "#19223a", borderRadius: 16, padding: 14, gap: 8 },
  result: { color: "#e8edf7", fontSize: 18, textAlign: "center", paddingVertical: 12 },
  error: { color: "#ff8b8b", textAlign: "center" },
});
