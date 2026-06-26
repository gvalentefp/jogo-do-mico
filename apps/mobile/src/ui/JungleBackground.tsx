import * as React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { colors } from "../theme";
import { PawField } from "./graphics";

/**
 * Fundo de selva usado em todas as telas: gradiente verde + padrao de patinhas
 * + silhueta de colinas no rodape. Espelha o verso/painel das cartas.
 */
export function JungleBackground({ children }: { children?: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.jungleTop, colors.jungleMid, colors.jungleBot]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Svg
        width={width}
        height={height}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <PawField width={width} height={height} opacity={0.14} />
        {/* colinas */}
        <Path
          d={`M0 ${height * 0.78} Q ${width * 0.28} ${height * 0.68} ${width * 0.55} ${height * 0.8}
              T ${width} ${height * 0.82} V ${height} H0 Z`}
          fill={colors.jungleBot}
          opacity={0.45}
        />
        <Path
          d={`M0 ${height * 0.88} Q ${width * 0.4} ${height * 0.78} ${width * 0.75} ${height * 0.9}
              T ${width * 1.4} ${height * 0.9} V ${height} H0 Z`}
          fill={colors.leafDark}
          opacity={0.35}
        />
      </Svg>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.jungleMid },
  content: { flex: 1 },
});
