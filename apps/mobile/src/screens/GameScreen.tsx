import { ScrollView, StyleSheet, Text, View } from "react-native";
import { HandTray, IconButton, PlayerSpot } from "../ui";
import { colors, font, radius, shadow, spacing } from "../theme";
import type { GameController } from "../gameController";
import type { GameState } from "@mico/core";

function nextActive(game: GameState, start: number): number {
  const n = game.players.length;
  for (let s = 0; s < n; s++) {
    const i = (start + s) % n;
    if (game.players[i]!.hand.length > 0) return i;
  }
  return start % n;
}

export function GameScreen({ ctrl }: { ctrl: GameController }) {
  const { view, isMyTurn, draw, offer, teasingFor, leave } = ctrl;
  const game = view.game!;
  const players = game.players;
  const meIndex = players.findIndex((p) => p.id === view.playerId);
  const me = players[meIndex];

  // adversarios na ordem de assento, comecando depois de mim
  const opponents = Array.from({ length: players.length - 1 }, (_, k) =>
    players[(meIndex + 1 + k) % players.length]!);

  const current = players[game.turnIndex]!;
  const targetOfCurrent = players[nextActive(game, game.turnIndex + 1)]!;
  const myTarget = isMyTurn ? players[nextActive(game, meIndex + 1)]! : null;
  const beingDrawnFromMe =
    game.phase === "playing" && current.id !== view.playerId &&
    targetOfCurrent.id === view.playerId;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <IconButton icon="‹" onPress={leave} />
        <View style={[styles.turnBar, isMyTurn ? styles.turnMine : styles.turnOther]}>
          <Text style={styles.turnText}>
            {isMyTurn
              ? `🎯 Sua vez — compre de ${myTarget?.name ?? "..."}`
              : beingDrawnFromMe
                ? `👀 ${current.name} vai comprar de você!`
                : `⏳ Vez de ${current.name}`}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.table}>
        <View style={styles.opps}>
          {opponents.map((opp) => (
            <PlayerSpot
              key={opp.id}
              player={opp}
              isCurrent={opp.id === current.id}
              isTarget={isMyTurn && opp.id === myTarget?.id}
              onPick={draw}
              teaseIndex={isMyTurn && opp.id === myTarget?.id ? teasingFor(opp.id) : null}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.tray, beingDrawnFromMe && styles.trayActive]}>
        <View style={styles.trayHead}>
          <Text style={styles.trayTitle}>Sua mão</Text>
          <View style={styles.trayMeta}>
            <Text style={styles.metaText}>🂠 {me?.hand.length ?? 0}</Text>
            <Text style={styles.metaText}>· {me?.pairs ?? 0} pares</Text>
          </View>
        </View>
        <HandTray
          cards={me?.hand ?? []}
          canOffer={beingDrawnFromMe}
          offeredIndex={teasingFor(view.playerId ?? "")}
          onOffer={offer}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: spacing(12), paddingBottom: spacing(4), gap: spacing(2) },
  header: { flexDirection: "row", alignItems: "center", gap: spacing(2),
    paddingHorizontal: spacing(3) },
  turnBar: {
    flex: 1, borderRadius: radius.pill, paddingVertical: spacing(2.5),
    alignItems: "center", borderBottomWidth: 4, ...shadow.soft,
  },
  turnMine: { backgroundColor: colors.gold, borderColor: "#c79a00" },
  turnOther: { backgroundColor: colors.cream, borderColor: colors.inputBorder },
  turnText: { fontFamily: font.bold, fontSize: 15, color: colors.ink },
  table: { padding: spacing(3) },
  opps: { flexDirection: "row", flexWrap: "wrap", gap: spacing(3), justifyContent: "center" },
  tray: {
    backgroundColor: colors.card, borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl, padding: spacing(4), gap: spacing(1),
    borderTopWidth: 3, borderColor: "transparent", ...shadow.card,
  },
  trayActive: { borderColor: colors.gold, backgroundColor: "#fffdf3" },
  trayHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  trayTitle: { fontFamily: font.extrabold, fontSize: 18, color: colors.ink },
  trayMeta: { flexDirection: "row", gap: spacing(2) },
  metaText: { fontFamily: font.semibold, fontSize: 13, color: colors.inkSoft },
});
