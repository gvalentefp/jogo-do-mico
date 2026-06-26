import * as React from "react";
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { colors, font } from "../theme";

/** Banana amarela (mesma do verso da carta). */
export function Banana({ size = 48, color = colors.banana, edge = colors.bananaEdge }) {
  return (
    <Svg width={size} height={size} viewBox="-60 -50 120 80">
      <Path
        d="M -52,8 C -34,-34 34,-44 56,-14 C 49,-20 41,-21 36,-18 C 22,-30 -18,-24 -34,16 C -40,16 -47,13 -52,8 Z"
        fill={color}
        stroke={edge}
        strokeWidth={3}
      />
      <Circle cx={-50} cy={6} r={3} fill="#7a5a16" />
      <Circle cx={54} cy={-12} r={3} fill="#7a5a16" />
    </Svg>
  );
}

/** Uma patinha (pad + 4 dedos), para o padrao de fundo. */
function Paw({ x, y, s = 1, color = colors.paw, opacity = 1 }: {
  x: number; y: number; s?: number; color?: string; opacity?: number;
}) {
  const toes: [number, number][] = [[-1.15, 4], [-0.4, -1.5], [0.4, -1.5], [1.15, 4]];
  return (
    <G opacity={opacity}>
      <Ellipse cx={x} cy={y + 3.5 * s} rx={7 * s} ry={5.6 * s} fill={color} />
      {toes.map(([dx, dy], i) => (
        <Circle key={i} cx={x + dx * 7 * s} cy={y - 5 * s + dy} r={3 * s} fill={color} />
      ))}
    </G>
  );
}

/** Tile de patinhas para repetir (usa-se desenhando varias vezes). */
export function PawField({ width, height, color = colors.paw, opacity = 0.16 }: {
  width: number; height: number; color?: string; opacity?: number;
}) {
  const step = 70;
  const cols = Math.ceil(width / step) + 1;
  const rows = Math.ceil(height / step) + 1;
  const paws: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * step + (r % 2 ? step / 2 : 0);
      const y = r * step;
      paws.push(
        <Paw key={`${r}-${c}`} x={x} y={y} s={0.9}
          color={color} opacity={opacity} />,
      );
    }
  }
  return <>{paws}</>;
}

/** Wordmark "MICO" com banana, no estilo do verso da carta. */
export function Logo({ size = 96 }: { size?: number }) {
  const w = size * 4.2;
  const h = size * 1.7;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Defs>
        <SvgLinearGradient id="logoFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffffff" />
          <Stop offset="1" stopColor="#eaffd6" />
        </SvgLinearGradient>
      </Defs>
      <G transform={`translate(${w / 2} ${h * 0.18}) rotate(-8) scale(${size / 96})`}>
        <Path
          d="M -52,8 C -34,-34 34,-44 56,-14 C 49,-20 41,-21 36,-18 C 22,-30 -18,-24 -34,16 C -40,16 -47,13 -52,8 Z"
          fill={colors.banana}
          stroke={colors.bananaEdge}
          strokeWidth={3}
        />
      </G>
      <SvgText
        x={w / 2}
        y={h * 0.82}
        fontFamily={font.extrabold}
        fontSize={size}
        fontWeight="800"
        textAnchor="middle"
        fill={colors.leafDark}
        stroke={colors.leafDark}
        strokeWidth={size * 0.14}
        strokeLinejoin="round"
      >
        MICO
      </SvgText>
      <SvgText
        x={w / 2}
        y={h * 0.82}
        fontFamily={font.extrabold}
        fontSize={size}
        fontWeight="800"
        textAnchor="middle"
        fill="url(#logoFill)"
      >
        MICO
      </SvgText>
    </Svg>
  );
}
