import { StyleSheet, Text, View } from "react-native";
import { Button, Caption, Logo } from "../ui";
import { colors, font, spacing } from "../theme";

export function HomeScreen({
  onCreate, onJoin, onRules,
}: {
  onCreate: () => void; onJoin: () => void; onRules: () => void;
}) {
  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <Logo size={88} />
        <Text style={styles.tagline}>O macaco que ninguém quer na mão!</Text>
      </View>

      <View style={styles.actions}>
        <Button label="Criar sala" icon="🎲" onPress={onCreate} />
        <Button label="Entrar numa sala" icon="🚪" variant="secondary" onPress={onJoin} />
        <Button label="Como jogar" icon="❓" variant="ghost" onPress={onRules} />
      </View>

      <Caption color={colors.onDarkSoft} center>
        Jogue na mesma rede com amigos
      </Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing(6),
    paddingTop: spacing(20),
    paddingBottom: spacing(10),
    justifyContent: "space-between",
  },
  hero: { alignItems: "center", gap: spacing(3) },
  tagline: {
    fontFamily: font.semibold,
    fontSize: 17,
    color: colors.onDark,
    textAlign: "center",
    textShadowColor: "#1a3a1288",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  actions: { gap: spacing(3.5) },
});
