import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const LABELS: Record<string, string> = {
  mico: "🐒 MICO",
  hidden: "",
};

function label(kind: string): string {
  return LABELS[kind] ?? kind;
}

export interface PlayingCardProps {
  kind: string;
  faceUp: boolean;
  /** When set, the card is tappable (used to draw from an opponent). */
  onPress?: () => void;
  /** Stagger entrance by index for a dealt-hand feel. */
  index?: number;
  highlight?: boolean;
}

/** A single card with a spring entrance and a flip between face-down/face-up. */
export function PlayingCard({ kind, faceUp, onPress, index = 0, highlight }: PlayingCardProps) {
  const enter = useSharedValue(0);
  const flip = useSharedValue(faceUp ? 1 : 0);
  const press = useSharedValue(1);

  useEffect(() => {
    enter.value = withSpring(1, { damping: 14, stiffness: 120, mass: 0.6 });
  }, [enter]);

  useEffect(() => {
    flip.value = withTiming(faceUp ? 1 : 0, { duration: 320 });
  }, [faceUp, flip]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateY: interpolate(enter.value, [0, 1], [24, 0]) },
      { scale: press.value },
      { rotateY: `${interpolate(flip.value, [0, 1], [180, 0])}deg` },
    ],
  }));

  const isMico = kind === "mico";

  return (
    <Pressable
      disabled={!onPress}
      onPressIn={() => (press.value = withSpring(0.94))}
      onPressOut={() => (press.value = withSpring(1))}
      onPress={onPress}
      style={{ marginHorizontal: -10 }}
    >
      <Animated.View
        style={[
          styles.card,
          faceUp ? (isMico ? styles.mico : styles.faceUp) : styles.faceDown,
          highlight && styles.highlight,
          containerStyle,
        ]}
      >
        {faceUp ? (
          <Text style={[styles.label, isMico && styles.micoLabel]} numberOfLines={2}>
            {label(kind)}
          </Text>
        ) : (
          <View style={styles.backPattern} />
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 64,
    height: 92,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  faceUp: { backgroundColor: "#fffdf5", borderWidth: 1, borderColor: "#e3d9b8" },
  faceDown: { backgroundColor: "#2b3a67", borderWidth: 1, borderColor: "#1c2747" },
  mico: { backgroundColor: "#ffe3b3", borderWidth: 2, borderColor: "#d98324" },
  highlight: { borderColor: "#52b788", borderWidth: 2 },
  backPattern: {
    width: "70%",
    height: "70%",
    borderRadius: 6,
    backgroundColor: "#3d4f86",
    borderWidth: 1,
    borderColor: "#6478b8",
  },
  label: { fontSize: 12, fontWeight: "600", textAlign: "center", color: "#3a2f12" },
  micoLabel: { fontSize: 13, color: "#7a3b00" },
});
