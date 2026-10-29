#!/usr/bin/env node
/* Legacy Mammals — a story as an Instagram carousel: 1080 x 1350 slides, split at bubble boundaries.
 *
 *   node scripts/slides.js no-24 [no-1 ...]   write social/<id>-ig-1.png, -2.png, ... (and remove stale ones)
 *
 * The slides come from share.js (window.LM.slides). A story short enough for one slide gets one file.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "social");
const LOCAL = process.env.LOCAL_URL || "http://127.0.0.1:8080/";

(async () => {
  const ids = process.argv.slice(2).map((s) => s.trim()).filter(Boolean);
  if (!ids.length) { console.log("usage: slides.js <story id> [...]"); return; }
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch(process.env.PW_EXEC ? { executablePath: process.env.PW_EXEC } : {});
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.log("page error:", e.message));
  await page.goto(LOCAL, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.LM && window.LM.slides, null, { timeout: 30000 });
  for (const id of ids) {
    const urls = await page.evaluate(async (id) => {
      const el = document.getElementById(id); if (!el) return null;
      const cs = await window.LM.slides(el);
      return cs.map((c) => c.toDataURL("image/png"));
    }, id);
    if (!urls) { console.log(id + ": not on the page"); continue; }
    // clear old slides for this story, then write the new set
    for (const f of fs.readdirSync(OUT)) if (f.startsWith(id + "-ig-") && f.endsWith(".png")) fs.unlinkSync(path.join(OUT, f));
    urls.forEach((u, i) => fs.writeFileSync(path.join(OUT, id + "-ig-" + (i + 1) + ".png"), Buffer.from(u.split(",")[1], "base64")));
    const msg = "slides " + id + ": " + urls.length + " slide" + (urls.length === 1 ? "" : "s");
    console.log(msg); if (process.env.GITHUB_ACTIONS) console.log("::notice::" + msg);
  }
  await browser.close();
})().catch((e) => { console.error(e.message || e); process.exit(1); });
