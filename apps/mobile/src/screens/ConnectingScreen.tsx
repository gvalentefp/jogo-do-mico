import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "../ui";
import { colors, font, spacing } from "../theme";

export function ConnectingScreen({ onCancel }: { onCancel: () => void }) {
  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={colors.onDark} />
      <Text style={styles.text}>Conectando à sala…</Text>
      <Button label="Cancelar" variant="ghost" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing(5) },
  text: { fontFamily: font.bold, fontSize: 18, color: colors.onDark },
});
