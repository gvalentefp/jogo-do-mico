// Rasteriza os SVGs de ./out para PNG (preview/uso direto).
//   node rasterize.js            # todos os .svg em ./out
//   node rasterize.js montage    # gera tambem um contact-sheet montage.png
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "out");
const DENSITY = 220; // ~3x para nitidez

async function render(file) {
  const out = path.join(dir, file.replace(/\.svg$/, ".png"));
  await sharp(path.join(dir, file), { density: DENSITY }).png().toFile(out);
  return out;
}

async function montage(pngs) {
  const cols = Number(process.env.COLS || 6);
  const thumb = Number(process.env.THUMB || 150);
  const imgs = await Promise.all(
    pngs.map(async (p) => ({
      buf: await sharp(p).resize(thumb).png().toBuffer(),
      name: path.basename(p),
    })),
  );
  const cellW = thumb + 10, cellH = Math.round(thumb * 1.4) + 12, pad = 8;
  const rows = Math.ceil(imgs.length / cols);
  const W = cols * cellW + (cols + 1) * pad;
  const H = rows * cellH + (rows + 1) * pad;
  const composites = imgs.map((im, i) => ({
    input: im.buf,
    left: pad + (i % cols) * (cellW + pad),
    top: pad + Math.floor(i / cols) * (cellH + pad),
  }));
  await sharp({ create: { width: W, height: H, channels: 4,
    background: { r: 240, g: 240, b: 240, alpha: 1 } } })
    .composite(composites).png().toFile(path.join(dir, "montage.png"));
  console.log("montage.png");
}

(async () => {
  const svgs = fs.readdirSync(dir).filter((f) => f.endsWith(".svg"));
  const pngs = [];
  for (const f of svgs) pngs.push(await render(f));
  console.log(`${pngs.length} PNGs`);
  if (process.argv.includes("montage")) await montage(pngs.sort());
})();
