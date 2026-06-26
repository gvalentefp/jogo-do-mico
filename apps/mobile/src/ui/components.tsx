import * as React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { colors, font, radius, shadow, spacing } from "../theme";

/** Painel branco arredondado com sombra (a "carta" das telas). */
export function Panel({ children, style }: {
  children: React.ReactNode; style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function Title({ children, color = colors.ink, size = 24 }: {
  children: React.ReactNode; color?: string; size?: number;
}) {
  return (
    <Text style={[styles.title, { color, fontSize: size }]}>{children}</Text>
  );
}

export function Caption({ children, color = colors.inkSoft, center }: {
  children: React.ReactNode; color?: string; center?: boolean;
}) {
  return (
    <Text style={[styles.caption, { color }, center && { textAlign: "center" }]}>
      {children}
    </Text>
  );
}

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export function Button({
  label, onPress, variant = "primary", disabled, loading, icon, style,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const v = BTN[variant];
  const isOff = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isOff}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: v.bg, borderColor: v.border },
        pressed && !isOff && styles.btnPressed,
        isOff && styles.btnOff,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <Text style={[styles.btnText, { color: v.fg }]}>
          {icon ? `${icon}  ` : ""}{label}
        </Text>
      )}
    </Pressable>
  );
}

const BTN: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.leaf, fg: "#ffffff", border: colors.leafDark },
  secondary: { bg: colors.cream, fg: colors.ink, border: colors.inputBorder },
  danger: { bg: colors.danger, fg: "#ffffff", border: "#b13f2c" },
  ghost: { bg: "transparent", fg: "#ffffff", border: "transparent" },
};

/** Campo de texto rotulado, no estilo creme/verde. */
export function Field({ label, hint, style, ...props }: {
  label?: string; hint?: string; style?: StyleProp<ViewStyle>;
} & TextInputProps) {
  return (
    <View style={[{ gap: spacing(1.5) }, style]}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.inkSoft}
        style={styles.input}
        autoCapitalize="none"
        {...props}
      />
      {hint ? <Caption>{hint}</Caption> : null}
    </View>
  );
}

/** Botao redondo (voltar, fechar). */
export function IconButton({ icon, onPress, style }: {
  icon: string; onPress?: () => void; style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed, style]}
    >
      <Text style={styles.iconBtnText}>{icon}</Text>
    </Pressable>
  );
}

/** Chip de jogador na sala. */
export function PlayerRow({ name, you, host, badge }: {
  name: string; you?: boolean; host?: boolean; badge?: string;
}) {
  return (
    <View style={styles.playerRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.slice(0, 1).toUpperCase()}</Text>
      </View>
      <Text style={styles.playerName} numberOfLines={1}>
        {host ? "👑 " : ""}{name}{you ? "  (você)" : ""}
      </Text>
      {badge ? <Text style={styles.playerBadge}>{badge}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing(5),
    gap: spacing(3.5),
    ...shadow.card,
  },
  title: { fontFamily: font.extrabold },
  caption: { fontFamily: font.regular, fontSize: 14, lineHeight: 19 },
  btn: {
    minHeight: 54,
    borderRadius: radius.pill,
    borderBottomWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing(5),
    ...shadow.soft,
  },
  btnPressed: { transform: [{ translateY: 2 }], opacity: 0.92 },
  btnOff: { opacity: 0.5 },
  btnText: { fontFamily: font.bold, fontSize: 18 },
  fieldLabel: { fontFamily: font.semibold, fontSize: 14, color: colors.inkSoft },
  input: {
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    fontFamily: font.semibold,
    fontSize: 17,
    color: colors.ink,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#ffffff22", borderWidth: 2, borderColor: "#ffffff55",
    alignItems: "center", justifyContent: "center",
  },
  iconBtnText: { fontFamily: font.bold, fontSize: 20, color: "#ffffff" },
  playerRow: {
    flexDirection: "row", alignItems: "center", gap: spacing(3),
    backgroundColor: colors.cream, borderRadius: radius.md,
    paddingVertical: spacing(2.5), paddingHorizontal: spacing(3),
    borderWidth: 2, borderColor: colors.inputBorder,
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.leaf,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontFamily: font.extrabold, color: "#fff", fontSize: 18 },
  playerName: { flex: 1, fontFamily: font.bold, fontSize: 16, color: colors.ink },
  playerBadge: { fontFamily: font.semibold, fontSize: 13, color: colors.inkSoft },
});
