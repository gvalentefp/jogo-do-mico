import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { MicoCard, Panel } from "../ui";
import { colors, font, radius, shadow, spacing } from "../theme";
import type { useMico } from "../useMico";

export function GameScreen({ mico }: { mico: ReturnType<typeof useMico> }) {
  const { view, isMyTurn, draw } = mico;
  const game = view.game!;
  const me = game.players.find((p) => p.id === view.playerId);
  const opponents = game.players.filter((p) => p.id !== view.playerId);
  const turnName = game.players[game.turnIndex]?.name ?? "";

  // alvo: proximo jogador ativo no sentido horario a partir de voce
  const targetId = useMemo(() => {
    const order = game.players;
    const myIdx = order.findIndex((p) => p.id === view.playerId);
    for (let s = 1; s <= order.length; s++) {
      const c = order[(myIdx + s) % order.length]!;
      if (c.hand.length > 0 && c.id !== view.playerId) return c.id;
    }
    return null;
  }, [game.players, view.playerId]);

  return (
    <View style={styles.root}>
      <View style={[styles.turnBar, isMyTurn ? styles.turnMine : styles.turnOther]}>
        <Text style={styles.turnText}>
          {isMyTurn ? "🎯 Sua vez — puxe uma carta!" : `⏳ Vez de ${turnName}`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ gap: spacing(3), paddingBottom: spacing(4) }}>
        {opponents.map((opp) => {
          const isTarget = isMyTurn && opp.id === targetId;
          return (
            <View key={opp.id} style={[styles.opp, isTarget && styles.oppTarget]}>
              <View style={styles.oppHead}>
                <Text style={styles.oppName} numberOfLines={1}>{opp.name}</Text>
                <Text style={styles.oppMeta}>
                  {opp.finished ? "✅ salvo" : `${opp.hand.length} cartas`}
                </Text>
              </View>
              {isTarget ? (
                <Text style={styles.hintPick}>Toque numa carta para puxar 👇</Text>
              ) : null}
              <View style={styles.hand}>
                {opp.hand.map((_, i) => (
                  <MicoCard
                    key={i}
                    kind="hidden"
                    faceUp={false}
                    size={50}
                    index={i}
                    highlight={isTarget}
                    onPress={isTarget ? () => draw(i) : undefined}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Panel style={styles.myHand}>
        <View style={styles.oppHead}>
          <Text style={styles.myTitle}>Sua mão</Text>
          <Text style={styles.oppMeta}>{me?.hand.length ?? 0} cartas</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.myCards}>
          {me?.hand.map((c, i) => (
            <MicoCard key={c.id} kind={c.kind} faceUp size={64} index={i} />
          ))}
          {me && me.hand.length === 0 ? (
            <Text style={styles.safe}>🎉 Você está salvo!</Text>
          ) : null}
        </ScrollView>
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing(4), paddingTop: spacing(13),
    paddingBottom: spacing(6), gap: spacing(3) },
  turnBar: {
    borderRadius: radius.pill, paddingVertical: spacing(3),
    alignItems: "center", borderBottomWidth: 4, ...shadow.soft,
  },
  turnMine: { backgroundColor: colors.gold, borderColor: "#c79a00" },
  turnOther: { backgroundColor: colors.cream, borderColor: colors.inputBorder },
  turnText: { fontFamily: font.bold, fontSize: 17, color: colors.ink },
  opp: {
    backgroundColor: "#ffffffcc", borderRadius: radius.lg, padding: spacing(3),
    gap: spacing(2), borderWidth: 2, borderColor: "transparent",
  },
  oppTarget: { borderColor: colors.gold, backgroundColor: "#fffbe9" },
  oppHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  oppName: { fontFamily: font.bold, fontSize: 16, color: colors.ink, flex: 1 },
  oppMeta: { fontFamily: font.semibold, fontSize: 13, color: colors.inkSoft },
  hintPick: { fontFamily: font.semibold, fontSize: 13, color: "#b8860b" },
  hand: { flexDirection: "row", flexWrap: "wrap", gap: spacing(2), paddingLeft: spacing(2) },
  myHand: { padding: spacing(4), gap: spacing(2) },
  myTitle: { fontFamily: font.extrabold, fontSize: 18, color: colors.ink },
  myCards: { gap: spacing(2), paddingLeft: spacing(2), paddingVertical: spacing(2),
    alignItems: "center" },
  safe: { fontFamily: font.bold, fontSize: 16, color: colors.leaf, padding: spacing(4) },
});
