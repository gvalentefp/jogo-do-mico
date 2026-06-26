/**
 * Design tokens derivados da estetica das cartas (selva verde, painel branco
 * arredondado, badge, banana amarela). Toda a UI consome estes valores.
 */

export const colors = {
  // fundo de selva (mesmo gradiente do verso/painel das cartas)
  jungleTop: "#9ed95b",
  jungleMid: "#6fbf3c",
  jungleBot: "#3f8f2e",
  paw: "#2f7d22",

  // superficies
  card: "#ffffff",
  cream: "#fffdf5",
  panel: "#19223a", // (legado; evitar em telas novas)

  // tinta / texto
  ink: "#2c3a17",
  inkSoft: "#5c6b3e",
  onDark: "#ffffff",
  onDarkSoft: "#eaf6dd",

  // marca
  leaf: "#2f7d22",
  leafDark: "#236018",
  banana: "#ffd23f",
  bananaEdge: "#caa019",
  mico: "#f3a72e",
  micoTop: "#ffd86b",

  // acentos
  pink: "#ff5fa0",
  blue: "#3f7fd6",
  danger: "#e2553c",
  gold: "#f2c200",

  // utilit.
  shadow: "#1a3a12",
  inputBg: "#f1f6e9",
  inputBorder: "#cfe0b6",
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };

export const spacing = (n: number) => n * 4;

export const font = {
  regular: "Baloo2_400Regular",
  semibold: "Baloo2_600SemiBold",
  bold: "Baloo2_700Bold",
  extrabold: "Baloo2_800ExtraBold",
};

export const shadow = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  soft: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
};
