import { StyleSheet, Text, View } from "react-native";
import { MicoCard } from "./MicoCard";
import { colors, font, radius, shadow } from "../theme";

interface SpotPlayer {
  id: string;
  name: string;
  hand: { kind: string }[];
  pairs: number;
  finished: boolean;
}

const MAX_SHOWN = 7;
const CARD = 40;

/** Lugar de um adversario na mesa: baralho (verso), contagem e montinho de pares. */
export function PlayerSpot({
  player, isCurrent, isTarget, onPick, teaseIndex,
}: {
  player: SpotPlayer;
  isCurrent?: boolean;
  isTarget?: boolean;
  onPick?: (index: number) => void;
  teaseIndex?: number | null;
}) {
  const n = player.hand.length;
  const shown = Math.min(n, MAX_SHOWN);

  return (
    <View style={[styles.spot, isCurrent && styles.current, isTarget && styles.target]}>
      <View style={styles.head}>
        <View style={[styles.dot, isCurrent ? styles.dotOn : styles.dotOff]} />
        <Text style={styles.name} numberOfLines={1}>{player.name}</Text>
        <Text style={styles.count}>{player.finished ? "✅" : `🂠 ${n}`}</Text>
      </View>

      <View style={styles.deckRow}>
        {/* baralho (versos) */}
        <View style={styles.deck}>
          {n === 0 ? (
            <Text style={styles.safe}>salvo!</Text>
          ) : (
            Array.from({ length: shown }).map((_, i) => (
              <View key={i} style={{ marginLeft: i === 0 ? 0 : -CARD * 0.62 }}>
                <MicoCard
                  kind="hidden"
                  faceUp={false}
                  size={CARD}
                  index={i}
                  highlight={isTarget}
                  wiggle={teaseIndex === i}
                  onPress={isTarget && onPick ? () => onPick(i) : undefined}
                />
              </View>
            ))
          )}
          {n > MAX_SHOWN ? <Text style={styles.more}>+{n - MAX_SHOWN}</Text> : null}
        </View>

        {/* montinho de pares casados */}
        <View style={styles.pairs}>
          <View style={styles.pairStack}>
            <View style={[styles.pairCard, { top: 4, left: 4 }]} />
            <View style={[styles.pairCard, { top: 2, left: 2 }]} />
            <View style={[styles.pairCard, player.pairs === 0 && styles.pairEmpty]} />
          </View>
          <Text style={styles.pairsLabel}>{player.pairs} {player.pairs === 1 ? "par" : "pares"}</Text>
        </View>
      </View>

      {isTarget ? <Text style={styles.pick}>compre uma carta 👆</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  spot: {
    backgroundColor: "#ffffffd9",
    borderRadius: radius.lg,
    padding: 10,
    gap: 6,
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 150,
    ...shadow.soft,
  },
  current: { borderColor: colors.gold, backgroundColor: "#fffdf0" },
  target: { borderColor: colors.leaf, backgroundColor: "#f3fbe9" },
  head: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotOn: { backgroundColor: colors.gold },
  dotOff: { backgroundColor: "#cdd6c0" },
  name: { flex: 1, fontFamily: font.bold, fontSize: 14, color: colors.ink },
  count: { fontFamily: font.semibold, fontSize: 12, color: colors.inkSoft },
  deckRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  deck: { flexDirection: "row", alignItems: "center", minHeight: CARD * 1.4, flexShrink: 1 },
  more: { fontFamily: font.bold, fontSize: 12, color: colors.inkSoft, marginLeft: 4 },
  safe: { fontFamily: font.bold, fontSize: 13, color: colors.leaf },
  pairs: { alignItems: "center", gap: 3, marginLeft: 6 },
  pairStack: { width: 30, height: 40, justifyContent: "center", alignItems: "center" },
  pairCard: {
    position: "absolute", width: 24, height: 34, borderRadius: 5,
    backgroundColor: colors.cream, borderWidth: 1.5, borderColor: "#d8c9a0",
  },
  pairEmpty: { backgroundColor: "#eef1e6", borderStyle: "dashed" },
  pairsLabel: { fontFamily: font.semibold, fontSize: 11, color: colors.inkSoft },
  pick: { fontFamily: font.semibold, fontSize: 12, color: colors.leafDark, textAlign: "center" },
});
