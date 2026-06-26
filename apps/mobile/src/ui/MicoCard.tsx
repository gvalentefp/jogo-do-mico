import { memo, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SvgXml } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colors, font, radius } from "../theme";
import { kindEmoji, kindLabel } from "../kinds";
import { CARD_ART, artKeyFor } from "../cardArt";
import { Banana } from "./graphics";

export interface MicoCardProps {
  kind: string;
  faceUp: boolean;
  /** Id do card do baralho (define macho "-a" / femea "-b" da arte). */
  cardId?: string;
  onPress?: () => void;
  index?: number;
  highlight?: boolean;
  /** Sacode a carta (alguem a esta "oferecendo"). */
  wiggle?: boolean;
  size?: number;
}

/** Carta do jogo: verso (selva + banana) ou face (arte do animal). */
export const MicoCard = memo(function MicoCard({
  kind, faceUp, cardId, onPress, index = 0, highlight, wiggle, size = 66,
}: MicoCardProps) {
  const w = size;
  const h = Math.round(size * 1.4);
  const enter = useSharedValue(0);
  const press = useSharedValue(1);
  const shake = useSharedValue(0);
  const isMico = kind === "mico";

  useEffect(() => {
    enter.value = withTiming(0, { duration: 0 });
    enter.value = withSpring(1, { damping: 13, stiffness: 120, mass: 0.6 });
  }, [enter]);

  useEffect(() => {
    if (wiggle) {
      shake.value = withRepeat(
        withSequence(
          withTiming(-1, { duration: 90 }),
          withTiming(1, { duration: 90 }),
        ), -1, true);
    } else {
      shake.value = withTiming(0, { duration: 120 });
    }
  }, [wiggle, shake]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateY: (1 - enter.value) * 22 - (wiggle ? 6 : 0) },
      { rotate: `${shake.value * 7}deg` },
      { scale: press.value },
    ],
  }));

  const art = faceUp ? CARD_ART[artKeyFor(kind, cardId)] : undefined;

  return (
    <Pressable
      disabled={!onPress}
      onPressIn={() => (press.value = withSpring(0.93))}
      onPressOut={() => (press.value = withSpring(1))}
      onPress={onPress}
      style={{ marginHorizontal: -size * 0.14 }}
    >
      <Animated.View
        style={[
          art ? { width: w, height: h } : styles.card,
          !art && { width: w, height: h },
          highlight && (art ? styles.highlightArt : styles.highlight),
          animStyle,
        ]}
      >
        {faceUp ? (
          art ? (
            <SvgXml xml={art} width="100%" height="100%" />
          ) : (
            <View style={[styles.face, isMico && styles.micoFace]}>
              <Text style={{ fontSize: size * 0.46 }}>{kindEmoji(kind)}</Text>
              <Text style={[styles.faceLabel, { fontSize: size * 0.16 }]} numberOfLines={1}>
                {kindLabel(kind)}
              </Text>
            </View>
          )
        ) : (
          <LinearGradient
            colors={[colors.jungleTop, colors.jungleBot]}
            style={styles.back}
          >
            <View style={styles.backInner}>
              <Banana size={size * 0.7} />
            </View>
          </LinearGradient>
        )}
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    backgroundColor: "#fff",
    padding: 3,
    shadowColor: colors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  highlight: {
    borderWidth: 3,
    borderColor: colors.gold,
    padding: 0,
  },
  highlightArt: {
    borderWidth: 3,
    borderColor: colors.gold,
    borderRadius: radius.lg,
  },
  face: {
    flex: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: "#e3d9b8",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  micoFace: { backgroundColor: "#ffe9c2", borderColor: colors.mico },
  faceLabel: { fontFamily: font.bold, color: colors.ink },
  back: {
    flex: 1,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  backInner: {
    width: "76%",
    height: "76%",
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: "#ffffff66",
    alignItems: "center",
    justifyContent: "center",
  },
});
