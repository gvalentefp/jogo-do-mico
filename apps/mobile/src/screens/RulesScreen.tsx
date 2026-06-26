import { ScrollView, StyleSheet, Text, View } from "react-native";
import { IconButton, Panel, Title } from "../ui";
import { colors, font, spacing } from "../theme";

const RULES: { t: string; d: string }[] = [
  { t: "🎯 Objetivo", d: "Descartar todos os seus pares e não terminar a partida com a carta do Mico na mão." },
  { t: "🃏 As cartas", d: "Cada animal tem um par (macho e fêmea). Só o Mico não tem par — é a carta que ninguém quer." },
  { t: "▶️ Começo", d: "As cartas são distribuídas. Pares que já estiverem na sua mão são descartados automaticamente." },
  { t: "🔁 Na sua vez", d: "Você puxa uma carta (virada para baixo) do próximo jogador. Se formar um par, ele é descartado na hora." },
  { t: "🏆 Fim", d: "Quem fica sem cartas está salvo. No final, quem segurar o Mico perde a rodada!" },
];

export function RulesScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <IconButton icon="‹" onPress={onBack} />
        <Title color={colors.onDark} size={26}>Como jogar</Title>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing(8) }}>
        <Panel>
          {RULES.map((r, i) => (
            <View key={i} style={styles.rule}>
              <Text style={styles.ruleTitle}>{r.t}</Text>
              <Text style={styles.ruleText}>{r.d}</Text>
            </View>
          ))}
        </Panel>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing(5), paddingTop: spacing(14), gap: spacing(4) },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rule: { gap: spacing(1) },
  ruleTitle: { fontFamily: font.bold, fontSize: 18, color: colors.ink },
  ruleText: { fontFamily: font.regular, fontSize: 15, lineHeight: 21, color: colors.inkSoft },
});
