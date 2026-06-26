import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Caption, IconButton, Panel, PlayerRow, Title } from "../ui";
import { colors, font, spacing } from "../theme";
import type { useMico } from "../useMico";

export function LobbyScreen({ mico }: { mico: ReturnType<typeof useMico> }) {
  const { view, isHost, start, leave } = mico;
  const enough = view.players.length >= 2;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <IconButton icon="‹" onPress={leave} />
        <Title color={colors.onDark} size={24}>Sala de espera</Title>
        <View style={{ width: 44 }} />
      </View>

      <Panel style={{ alignItems: "center", gap: spacing(2) }}>
        <Caption>Código da sala</Caption>
        <Text style={styles.code}>{view.roomId}</Text>
        <Caption center>Compartilhe este código com quem vai jogar</Caption>
      </Panel>

      <Panel style={{ flex: 1 }}>
        <Title size={18}>Jogadores ({view.players.length})</Title>
        <ScrollView contentContainerStyle={{ gap: spacing(2.5) }}>
          {view.players.map((p) => (
            <PlayerRow
              key={p.id}
              name={p.name}
              you={p.id === view.playerId}
              host={p.id === view.hostId}
              badge={p.connected ? undefined : "offline"}
            />
          ))}
        </ScrollView>
      </Panel>

      {isHost ? (
        <Button
          label={enough ? "Começar partida" : "Esperando jogadores…"}
          icon="🚀"
          onPress={() => start()}
          disabled={!enough}
        />
      ) : (
        <Caption color={colors.onDarkSoft} center>
          Aguardando o host iniciar a partida…
        </Caption>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing(5), paddingTop: spacing(14),
    paddingBottom: spacing(8), gap: spacing(4) },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  code: { fontFamily: font.extrabold, fontSize: 44, letterSpacing: 10, color: colors.leaf },
});
