import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Caption, Field, IconButton, Panel, Title } from "../ui";
import { colors, font, radius, spacing } from "../theme";

export function SoloSetupScreen({
  onBack, onStart,
}: {
  onBack: () => void;
  onStart: (name: string, botCount: number) => void;
}) {
  const [name, setName] = useState("");
  const [bots, setBots] = useState(2);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <IconButton icon="‹" onPress={onBack} />
        <Title color={colors.onDark} size={26}>Jogar sozinho</Title>
        <View style={{ width: 44 }} />
      </View>

      <Panel>
        <Field label="Seu nome" value={name} onChangeText={setName}
          placeholder="Ex.: Bia" maxLength={16} />

        <View style={{ gap: spacing(2) }}>
          <Text style={styles.label}>Quantos adversários (IA)?</Text>
          <View style={styles.seg}>
            {[1, 2, 3].map((n) => (
              <Pressable
                key={n}
                onPress={() => setBots(n)}
                style={[styles.segItem, bots === n && styles.segOn]}
              >
                <Text style={[styles.segText, bots === n && styles.segTextOn]}>
                  {n} 🤖
                </Text>
              </Pressable>
            ))}
          </View>
          <Caption>Os bots jogam sozinhos — e às vezes mordem a isca que você oferecer 😏</Caption>
        </View>

        <Button label="Começar" icon="🎮"
          onPress={() => onStart(name.trim() || "Você", bots)} />
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing(5), paddingTop: spacing(14), gap: spacing(5) },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontFamily: font.semibold, fontSize: 14, color: colors.inkSoft },
  seg: { flexDirection: "row", gap: spacing(2) },
  segItem: {
    flex: 1, paddingVertical: spacing(3), borderRadius: radius.md,
    backgroundColor: colors.inputBg, borderWidth: 2, borderColor: colors.inputBorder,
    alignItems: "center",
  },
  segOn: { backgroundColor: colors.leaf, borderColor: colors.leafDark },
  segText: { fontFamily: font.bold, fontSize: 18, color: colors.ink },
  segTextOn: { color: "#fff" },
});
