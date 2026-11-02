#!/usr/bin/env node
/* Legacy Mammals — turn a storyboard frame into a short clip with Higgsfield's API.
 *
 *   node scripts/higgsfield.js clip <image file> "<motion prompt>" [--seconds 5] [--out clips/name.mp4] [--model kling-video/v3.0-turbo/image-to-video]
 *   node scripts/higgsfield.js estimate <image file> "<motion prompt>" [--seconds 5]      price only, nothing generated
 *
 * Keys come from the environment (set as repository secrets, never in chat or in this file):
 *   HIGGSFIELD_API_KEY      the key id, or the whole "id:secret" string as the console shows it
 *   HIGGSFIELD_API_SECRET   the secret, when it was saved separately
 * The API wants them joined: Authorization: Key <id>:<secret>. Nothing here prints the values.
 *
 * Runs in GitHub Actions (.github/workflows/clips.yml): uploads the image to Higgsfield's file
 * store, submits the job, polls until it finishes, downloads the mp4, and raises a notice with
 * the cost and length. Failed or refused jobs are not billed.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const API = "https://api.higgsfield.ai";
const note = (m) => { console.log(m); if (process.env.GITHUB_ACTIONS) console.log("::notice::" + m.replace(/\n/g, "%0A")); };

function auth() {
  const key = (process.env.HIGGSFIELD_API_KEY || "").trim(), secret = (process.env.HIGGSFIELD_API_SECRET || "").trim();
  if (!key) throw new Error("HIGGSFIELD_API_KEY is not set");
  const pair = key.includes(":") ? key : secret ? key + ":" + secret : null;
  if (!pair) throw new Error("the key has no secret: set HIGGSFIELD_API_SECRET, or store the key as id:secret");
  return { Authorization: "Key " + pair };
}
async function api(method, url, body, extra = {}) {
  const r = await fetch(url, { method, headers: Object.assign({ "Content-Type": "application/json" }, auth(), extra), body: body ? JSON.stringify(body) : undefined });
  const text = await r.text(); let j; try { j = JSON.parse(text); } catch (e) { j = { raw: text.slice(0, 400) }; }
  if (!r.ok) throw new Error(method + " " + url.replace(API, "") + " -> " + r.status + " " + JSON.stringify(j).slice(0, 400));
  return j;
}
async function upload(file) {
  const type = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" }[path.extname(file).toLowerCase()];
  if (!type) throw new Error("unsupported image type: " + file);
  const u = await api("POST", API + "/files/generate-upload-url", { content_type: type });
  const r = await fetch(u.upload_url, { method: "PUT", headers: u.upload_headers || { "Content-Type": type }, body: fs.readFileSync(file) });
  if (!r.ok) throw new Error("upload failed: " + r.status);
  return u.public_url;
}
function args() {
  const a = process.argv.slice(2), opt = { seconds: 5, model: "kling-video/v3.0-turbo/image-to-video", resolution: "720p" }, pos = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--seconds") opt.seconds = parseInt(a[++i], 10);
    else if (a[i] === "--out") opt.out = a[++i];
    else if (a[i] === "--model") opt.model = a[++i];
    else if (a[i] === "--resolution") opt.resolution = a[++i];
    else pos.push(a[i]);
  }
  return { mode: pos[0], image: pos[1], prompt: pos[2], opt };
}
(async () => {
  const { mode, image, prompt, opt } = args();
  if (!["clip", "estimate"].includes(mode) || !image || !prompt) { console.log("usage: higgsfield.js clip|estimate <image> \"<prompt>\" [--seconds 5] [--out clips/x.mp4]"); process.exit(2); }
  if (!fs.existsSync(image)) throw new Error("no such image: " + image);
  const imageUrl = await upload(image);
  const body = { prompt, image_url: imageUrl, duration: opt.seconds, resolution: opt.resolution };
  const est = await api("POST", API + "/estimate/" + opt.model, body).catch((e) => ({ error: e.message }));
  note("estimate for " + opt.seconds + " s of " + opt.model + ": " + (est.usd != null ? "$" + est.usd : JSON.stringify(est)));
  if (mode === "estimate") return;
  const sub = await api("POST", API + "/" + opt.model, body, { "Idempotency-Key": crypto.randomUUID() });
  note("submitted " + sub.request_id + " (" + sub.status + ")");
  const until = Date.now() + 20 * 60000; let wait = 3000, st;
  while (Date.now() < until) {
    await new Promise((res) => setTimeout(res, wait)); wait = Math.min(10000, wait + 1000);
    st = await api("GET", sub.status_url);
    if (["completed", "failed", "nsfw", "canceled"].includes(st.status)) break;
  }
  if (!st || st.status !== "completed") throw new Error("job ended as " + (st && st.status) + ": " + JSON.stringify(st).slice(0, 400));
  const out = opt.out || path.join("clips", path.basename(image, path.extname(image)) + ".mp4");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const v = await fetch(st.video.url); if (!v.ok) throw new Error("download failed: " + v.status);
  fs.writeFileSync(out, Buffer.from(await v.arrayBuffer()));
  note("wrote " + out + " (" + Math.round(fs.statSync(out).size / 1024) + " KB)");
})().catch((e) => { console.error("::error::" + e.message); process.exit(1); });
