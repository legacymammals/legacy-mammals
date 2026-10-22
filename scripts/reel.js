#!/usr/bin/env node
/* Legacy Mammals — a reel of a story: 1080 x 1920, silent, H.264.
 *
 *   node scripts/reel.js no-19 [no-18 ...]   render these stories to reels/<id>.mp4
 *   node scripts/reel.js                     render the stories the poster just handled (its pending list)
 *
 * The frames come from share.js (window.LM.reel): the headline first, then each bubble after a
 * typing pause, held for about one and a half times the time it takes to read, then three
 * seconds on the last one. Music is added in the Instagram app when posting; the file is silent
 * (with an empty audio track, which Instagram prefers to none).
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "reels");
const LOCAL = process.env.LOCAL_URL || "http://127.0.0.1:8080/";
const PENDING = path.join(process.env.LM_TMP || process.env.RUNNER_TEMP || os.tmpdir(), "legacymammals-pending.json");
const FPS = 30;

(async () => {
  let ids = process.argv.slice(2);
  if (!ids.length) { try { ids = JSON.parse(fs.readFileSync(PENDING, "utf8")).map((s) => s.id); } catch (e) { ids = []; } }
  ids = ids.filter((id) => !fs.existsSync(path.join(OUT, id + ".mp4")) || process.argv.length > 2);
  if (!ids.length) { console.log("no reels to make"); return; }
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch(process.env.PW_EXEC ? { executablePath: process.env.PW_EXEC } : {});
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.log("page error:", e.message));
  await page.goto(LOCAL, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.LM && window.LM.reel, null, { timeout: 30000 });

  for (const id of ids) {
    const info = await page.evaluate(async (id) => {
      const el = document.getElementById(id); if (!el) return null;
      const r = await window.LM.reel(el);
      window.__reel = r;
      document.body.innerHTML = ""; document.body.style.margin = "0"; document.body.style.background = "#F3EEE3";
      r.canvas.id = "reel"; r.canvas.style.display = "block"; document.body.appendChild(r.canvas);
      return { duration: r.duration, bubbles: r.events.filter((e) => e.pop != null).length };
    }, id);
    if (!info) { console.log(id + ": not on the page"); await page.goto(LOCAL, { waitUntil: "networkidle" }); continue; }
    const frames = fs.mkdtempSync(path.join(os.tmpdir(), "lm-frames-"));
    const n = Math.ceil(info.duration * FPS);
    // frames in batches: the page draws them and hands back JPEGs
    const BATCH = 12;
    for (let f = 0; f < n; f += BATCH) {
      const ts = []; for (let g = f; g < Math.min(n, f + BATCH); g++) ts.push(g / FPS);
      const jpgs = await page.evaluate((ts) => ts.map((t) => { window.__reel.frame(t); return window.__reel.canvas.toDataURL("image/jpeg", 0.92).split(",")[1]; }), ts);
      jpgs.forEach((b64, i) => fs.writeFileSync(path.join(frames, String(f + i).padStart(5, "0") + ".jpg"), Buffer.from(b64, "base64")));
    }
    const out = path.join(OUT, id + ".mp4");
    const ff = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(frames, "%05d.jpg"),
      "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100", "-shortest",
      "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", String(FPS),
      "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", out], { encoding: "utf8" });
    fs.rmSync(frames, { recursive: true, force: true });
    if (ff.status !== 0) { console.log(id + ": ffmpeg failed: " + ff.stderr); continue; }
    const msg = "reel " + id + ": " + info.duration.toFixed(1) + "s, " + info.bubbles + " bubbles, " + Math.round(fs.statSync(out).size / 1024) + " KB";
    console.log(msg); if (process.env.GITHUB_ACTIONS) console.log("::notice::" + msg);
    // back to the story page for the next one
    await page.goto(LOCAL, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.LM && window.LM.reel, null, { timeout: 30000 });
  }
  await browser.close();
})().catch((e) => { console.error(e.message || e); process.exit(1); });
