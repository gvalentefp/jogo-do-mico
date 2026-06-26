import { StyleSheet, Text, View } from "react-native";
import { Button, Caption, MicoCard, Panel, Title } from "../ui";
import { colors, font, spacing } from "../theme";
import type { GameController } from "../gameController";

export function GameOverScreen({ ctrl }: { ctrl: GameController }) {
  const { view, leave, restart } = ctrl;
  const game = view.game!;
  const loser = game.players.find((p) => p.id === game.loserId);
  const iLost = game.loserId === view.playerId;

  return (
    <View style={styles.root}>
      <Title color={colors.onDark} size={30}>Fim de jogo!</Title>

      <Panel style={{ alignItems: "center", gap: spacing(4) }}>
        <MicoCard kind="mico" faceUp size={120} />
        <Text style={[styles.result, { color: iLost ? colors.danger : colors.leaf }]}>
          {iLost
            ? "😅 Você ficou com o Mico!"
            : `🎉 ${loser?.name ?? "Alguém"} ficou com o Mico!`}
        </Text>
        <Caption center>
          {iLost ? "Faz parte! Bora de revanche?" : "Mandou bem, escapou do macaco!"}
        </Caption>
      </Panel>

      <View style={{ gap: spacing(3) }}>
        {restart ? (
          <Button label="Jogar de novo" icon="🔁" onPress={restart} />
        ) : null}
        <Button
          label="Voltar ao início"
          icon="🏠"
          variant={restart ? "secondary" : "primary"}
          onPress={leave}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing(6), paddingTop: spacing(20),
    paddingBottom: spacing(10), justifyContent: "space-between" },
  result: { fontFamily: font.extrabold, fontSize: 22, textAlign: "center" },
});
