import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colors, font, radius } from "../theme";
import { kindEmoji, kindLabel } from "../kinds";
import { Banana } from "./graphics";

export interface MicoCardProps {
  kind: string;
  faceUp: boolean;
  onPress?: () => void;
  index?: number;
  highlight?: boolean;
  size?: number;
}

/** Carta do jogo: verso (selva + banana) ou face (creme + animal). */
export function MicoCard({
  kind, faceUp, onPress, index = 0, highlight, size = 66,
}: MicoCardProps) {
  const w = size;
  const h = Math.round(size * 1.4);
  const enter = useSharedValue(0);
  const press = useSharedValue(1);
  const isMico = kind === "mico";

  useEffect(() => {
    enter.value = withTiming(0, { duration: 0 });
    enter.value = withSpring(1, { damping: 13, stiffness: 120, mass: 0.6 });
  }, [enter]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateY: (1 - enter.value) * 22 },
      { scale: press.value },
    ],
  }));

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
          styles.card,
          { width: w, height: h },
          highlight && styles.highlight,
          animStyle,
        ]}
      >
        {faceUp ? (
          <View style={[styles.face, isMico && styles.micoFace]}>
            <Text style={{ fontSize: size * 0.46 }}>{kindEmoji(kind)}</Text>
            <Text style={[styles.faceLabel, { fontSize: size * 0.16 }]} numberOfLines={1}>
              {kindLabel(kind)}
            </Text>
          </View>
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
}

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
