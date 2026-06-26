import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { MicoCard } from "./MicoCard";
import { colors, font, spacing } from "../theme";

interface HandCard { id: string; kind: string }

/** Uma carta da minha mao que pode ser arrastada para "oferecer". */
function OfferCard({
  card, index, canOffer, offered, onOffer, size,
}: {
  card: HandCard; index: number; canOffer: boolean; offered: boolean;
  onOffer: (i: number | null) => void; size: number;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(canOffer)
    .onStart(() => runOnJS(onOffer)(index))
    .onUpdate((e) => {
      ty.value = Math.max(-72, Math.min(10, e.translationY));
      tx.value = e.translationX * 0.35;
    })
    .onEnd(() => {
      tx.value = withSpring(0);
      ty.value = withSpring(0);
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
    zIndex: offered ? 10 : 1,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>
        <MicoCard
          kind={card.kind}
          cardId={card.id}
          faceUp
          size={size}
          index={index}
          highlight={offered}
          wiggle={offered}
        />
      </Animated.View>
    </GestureDetector>
  );
}

export function HandTray({
  cards, canOffer, offeredIndex, onOffer, size = 96,
}: {
  cards: HandCard[];
  canOffer: boolean;
  offeredIndex: number | null;
  onOffer: (i: number | null) => void;
  size?: number;
}) {
  return (
    <View style={{ gap: spacing(1) }}>
      {canOffer ? (
        <Text style={styles.hint}>👀 Arraste uma carta para cima para oferecer ao adversário</Text>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {cards.length === 0 ? (
          <Text style={styles.safe}>🎉 Você está salvo!</Text>
        ) : (
          cards.map((c, i) => (
            <OfferCard
              key={c.id}
              card={c}
              index={i}
              canOffer={canOffer}
              offered={offeredIndex === i}
              onOffer={onOffer}
              size={size}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing(4), paddingHorizontal: spacing(3), paddingVertical: spacing(3),
    alignItems: "flex-end", minHeight: 156 },
  hint: { fontFamily: font.semibold, fontSize: 13, color: "#b8860b", textAlign: "center" },
  safe: { fontFamily: font.bold, fontSize: 16, color: colors.leaf, padding: spacing(4) },
});
