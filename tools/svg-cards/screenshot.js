// Screenshot das telas do app (build web) via Edge headless (sem baixar browser).
//   node screenshot.js
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const root = path.resolve(__dirname, "../../apps/mobile/dist");
const outDir = path.join(__dirname, "out");
const types = {
  ".html": "text/html", ".js": "text/javascript", ".ttf": "font/ttf",
  ".png": "image/png", ".json": "application/json", ".css": "text/css",
  ".map": "application/json", ".ico": "image/x-icon", ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]);
  let f = path.join(root, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(root, "index.html");
  res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});

async function shot(page, name) {
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(outDir, `app_${name}.png`) });
  console.log("shot", name);
}

(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
  });
  page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
  await page.goto(`http://localhost:${port}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  await shot(page, "home");

  try {
    await page.getByText("Jogar sozinho").click();
    await page.waitForTimeout(500);
    await shot(page, "solo_setup");
    await page.getByText("Começar").click();
    await page.waitForTimeout(2000);
    await shot(page, "game");
    // compra do alvo (clica no baralho do 1o adversario) para avancar os turnos
    await page.mouse.click(80, 182);
    for (let i = 0; i < 9; i++) {
      await page.waitForTimeout(650);
      await page.screenshot({ path: path.join(outDir, `app_turn_${i}.png`) });
    }
    console.log("turns captured");
  } catch (e) { console.log("nav solo:", e.message); }

  await browser.close();
  server.close();
  console.log("done");
})();
