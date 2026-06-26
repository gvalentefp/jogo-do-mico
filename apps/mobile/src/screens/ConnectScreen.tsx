import { useMemo, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Button, Caption, Field, IconButton, Panel, Title } from "../ui";
import { colors, font, spacing } from "../theme";

const PORT = 8787;

function randomCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => a[Math.floor(Math.random() * a.length)]).join("");
}

export function ConnectScreen({
  mode, onBack, onConnect, connecting, error,
}: {
  mode: "create" | "join";
  onBack: () => void;
  onConnect: (url: string, room: string, name: string) => void;
  connecting?: boolean;
  error?: string | null;
}) {
  const create = mode === "create";
  const [name, setName] = useState("");
  const [room, setRoom] = useState(create ? randomCode() : "");
  const [host, setHost] = useState(Platform.OS === "web" ? "localhost" : "");
  const [showServer, setShowServer] = useState(false);

  const canGo = name.trim().length > 0 && room.trim().length > 0 && host.trim().length > 0;

  const submit = () =>
    onConnect(`ws://${host.trim()}:${PORT}/ws`, room.trim().toUpperCase(), name.trim());

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <IconButton icon="‹" onPress={onBack} />
        <Title color={colors.onDark} size={26}>
          {create ? "Criar sala" : "Entrar numa sala"}
        </Title>
        <View style={{ width: 44 }} />
      </View>

      <Panel>
        <Field label="Seu nome" value={name} onChangeText={setName}
          placeholder="Ex.: Bia" maxLength={16} />

        {create ? (
          <View style={{ gap: spacing(1.5) }}>
            <Text style={styles.codeLabel}>Código da sala (compartilhe!)</Text>
            <View style={styles.codeBox}>
              <Text style={styles.code}>{room}</Text>
              <IconButtonInline icon="🔄" onPress={() => setRoom(randomCode())} />
            </View>
          </View>
        ) : (
          <Field label="Código da sala" value={room}
            onChangeText={(t) => setRoom(t.toUpperCase())}
            placeholder="Ex.: K7QP" autoCapitalize="characters" maxLength={6} />
        )}

        {showServer ? (
          <Field label="Servidor (IP do host)" value={host} onChangeText={setHost}
            placeholder="192.168.0.10 ou localhost"
            hint="O host abre a sala no próprio aparelho/PC na mesma rede." />
        ) : (
          <Caption>
            Servidor: <Text style={styles.link} onPress={() => setShowServer(true)}>
              {host || "definir IP do host"} ✎</Text>
          </Caption>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={create ? "Criar e entrar" : "Entrar"}
          icon={create ? "🎲" : "🚪"}
          onPress={submit}
          disabled={!canGo}
          loading={connecting}
        />
      </Panel>
    </View>
  );
}

function IconButtonInline({ icon, onPress }: { icon: string; onPress: () => void }) {
  return (
    <Text onPress={onPress} style={styles.refresh}>{icon}</Text>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing(5), paddingTop: spacing(14), gap: spacing(5) },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  codeLabel: { fontFamily: font.semibold, fontSize: 14, color: colors.inkSoft },
  codeBox: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: spacing(3), backgroundColor: colors.inputBg, borderRadius: 16,
    borderWidth: 2, borderColor: colors.inputBorder, paddingVertical: spacing(3),
  },
  code: { fontFamily: font.extrabold, fontSize: 40, letterSpacing: 8, color: colors.leaf },
  refresh: { fontSize: 22 },
  link: { fontFamily: font.bold, color: colors.leaf },
  error: { fontFamily: font.semibold, color: colors.danger, textAlign: "center" },
});
