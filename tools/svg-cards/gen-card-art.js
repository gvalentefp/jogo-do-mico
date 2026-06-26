// Gera apps/mobile/src/cardArt.ts: um mapa { "<kind>_male"|"<kind>_female"|"mico"
// -> string SVG } para o app renderizar as cartas com SvgXml.
//   node gen-card-art.js   (rode build.py antes para ter out/*.svg)
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "out");
const dest = path.resolve(__dirname, "../../apps/mobile/src/cardArt.ts");

// inclui tambem back.svg -> chave "back" (verso da carta)
const files = fs.readdirSync(outDir).filter((f) => f.endsWith(".svg"));

const entries = files.map((f) => {
  const key = f.replace(/\.svg$/, "");
  const svg = fs.readFileSync(path.join(outDir, f), "utf8").trim();
  return `  ${JSON.stringify(key)}: ${JSON.stringify(svg)},`;
});

const ts = `// AUTO-GERADO por tools/svg-cards/gen-card-art.js — nao edite a mao.
// Arte das cartas (SVG) por especie/genero. Veja README do tools/svg-cards.
export const CARD_ART: Record<string, string> = {
${entries.join("\n")}
};

/** Chave da arte para um card do baralho. Cartas "-a" sao macho; "-b" femea. */
export function artKeyFor(kind: string, cardId?: string): string {
  if (kind === "mico") return "mico";
  const female = !!cardId && cardId.endsWith("-b");
  return \`\${kind}_\${female ? "female" : "male"}\`;
}
`;

fs.writeFileSync(dest, ts, "utf8");
console.log(`gerado ${dest} (${files.length} artes)`);
