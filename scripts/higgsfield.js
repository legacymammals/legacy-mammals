#!/usr/bin/env node
/* Legacy Mammals — Higgsfield's API from the command line (runs in GitHub Actions; see .github/workflows).
 *
 * Clips (a storyboard frame → a few seconds of video):
 *   node scripts/higgsfield.js clip <image file> "<motion prompt>" [--seconds 5] [--out clips/name.mp4] [--model kling-video/v3.0-turbo/image-to-video]
 *   node scripts/higgsfield.js estimate <image file> "<motion prompt>" [--seconds 5]      price only, nothing generated
 *
 * Images (character sheets, frames; reference pictures steer the look):
 *   node scripts/higgsfield.js image "<prompt>" [--ref img/header.jpg]... [--model xai/grok-imagine-image-2.0] [--aspect 1:1]
 *                                   [--resolution 1k] [--count 1] [--out characters/mech.png] [--max-usd 1] [--estimate-only]
 *   --ref takes a file in the repo or an https URL, and may be repeated (order matters: image 1, image 2, ...).
 *   --count N runs the job N times and writes <out>-1.png ... <out>-N.png.
 *   Models known here: xai/grok-imagine-image-2.0 (up to 10 refs), alibaba/qwen-image-3/edit (1 to 3 refs),
 *   ideogram/v4.0 (one ref), higgsfield-ai/soul/v2/standard (no refs). Anything else is sent prompt + image_urls.
 *
 * Keys come from the environment (set as repository secrets, never in chat or in this file):
 *   HIGGSFIELD_API_KEY      the key id, or the whole "id:secret" string as the console shows it
 *   HIGGSFIELD_API_SECRET   the secret, when it was saved separately
 * The API wants them joined: Authorization: Key <id>:<secret>. Nothing here prints the values.
 *
 * Every job is priced with the estimate endpoint first and refused above --max-usd (default $1 per image, $3 per clip).
 * Failed or refused jobs are not billed. Outputs are downloaded into the repo; Higgsfield deletes its copy in 7 days.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const API = "https://api.higgsfield.ai";
const note = (m) => { console.log(m); if (process.env.GITHUB_ACTIONS) console.log("::notice::" + m.replace(/\n/g, "%0A")); };
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

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
/* Put a picture where Higgsfield can read it: a repo file is uploaded to its file store; an https URL is
 * fetched here first (Dropbox "dl=1" links and the like redirect, which the API's own fetcher may not follow)
 * and uploaded the same way. Returns the public URL to put in the request. */
async function upload(file) {
  let data, type;
  if (/^https?:\/\//.test(file)) {
    const r = await fetch(file, { redirect: "follow" }); if (!r.ok) throw new Error("could not fetch reference " + r.status + ": " + file.replace(/\?.*/, ""));
    data = Buffer.from(await r.arrayBuffer());
    type = (r.headers.get("content-type") || "").split(";")[0].trim();
    if (!/^image\/(png|jpeg|webp)$/.test(type)) type = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" }[path.extname(file.replace(/\?.*/, "")).toLowerCase()];
    if (!type) throw new Error("reference is not a png/jpeg/webp: " + file.replace(/\?.*/, ""));
  } else {
    type = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" }[path.extname(file).toLowerCase()];
    if (!type) throw new Error("unsupported image type: " + file);
    if (!fs.existsSync(file)) throw new Error("no such image: " + file);
    data = fs.readFileSync(file);
  }
  const u = await api("POST", API + "/files/generate-upload-url", { content_type: type });
  const r = await fetch(u.upload_url, { method: "PUT", headers: u.upload_headers || { "Content-Type": type }, body: data });
  if (!r.ok) throw new Error("upload failed: " + r.status);
  return u.public_url;
}
async function estimate(model, body) {
  const est = await api("POST", API + "/estimate/" + model, body).catch((e) => ({ error: e.message }));
  return est.usd != null ? Number(est.usd) : est;
}
async function submitAndWait(model, body, minutes = 20) {
  const sub = await api("POST", API + "/" + model, body, { "Idempotency-Key": crypto.randomUUID() });
  note("submitted " + sub.request_id + " (" + sub.status + ")");
  const until = Date.now() + minutes * 60000; let wait = 3000, st;
  while (Date.now() < until) {
    await sleep(wait); wait = Math.min(10000, wait + 1000);
    st = await api("GET", sub.status_url);
    if (["completed", "failed", "nsfw", "canceled"].includes(st.status)) break;
  }
  if (!st || st.status !== "completed") throw new Error("job ended as " + (st && st.status) + ": " + JSON.stringify(st).slice(0, 400));
  return st;
}
async function download(url, out) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const v = await fetch(url); if (!v.ok) throw new Error("download failed: " + v.status);
  fs.writeFileSync(out, Buffer.from(await v.arrayBuffer()));
  note("wrote " + out + " (" + Math.round(fs.statSync(out).size / 1024) + " KB)");
}

function args() {
  const a = process.argv.slice(2), pos = [];
  const opt = { seconds: 5, resolution: "", aspect: "1:1", count: 1, refs: [], maxUsd: null, estimateOnly: false };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--seconds") opt.seconds = parseInt(a[++i], 10);
    else if (a[i] === "--out") opt.out = a[++i];
    else if (a[i] === "--model") opt.model = a[++i];
    else if (a[i] === "--resolution") opt.resolution = a[++i];
    else if (a[i] === "--aspect") opt.aspect = a[++i];
    else if (a[i] === "--count") opt.count = Math.max(1, parseInt(a[++i], 10) || 1);
    else if (a[i] === "--ref") opt.refs.push(a[++i]);
    else if (a[i] === "--max-usd") opt.maxUsd = parseFloat(a[++i]);
    else if (a[i] === "--estimate-only") opt.estimateOnly = true;
    else pos.push(a[i]);
  }
  return { mode: pos[0], pos: pos.slice(1), opt };
}

/* The request body each image model wants. */
function imageBody(model, prompt, refs, opt) {
  const res = opt.resolution;
  if (model.startsWith("xai/grok-imagine-image")) {
    const b = { prompt, aspect_ratio: opt.aspect, resolution: res || "1k", quality: "medium" };
    if (refs.length) b.image_urls = refs.slice(0, 10);
    return b;
  }
  if (model.startsWith("alibaba/qwen-image-3/edit")) {
    if (!refs.length) throw new Error(model + " needs 1 to 3 --ref images");
    return { prompt, image_urls: refs.slice(0, 3), aspect_ratio: opt.aspect, resolution: res || "1k" };
  }
  if (model.startsWith("ideogram/")) {
    const b = { prompt, aspect_ratio: opt.aspect, rendering_speed: "DEFAULT" };
    if (refs.length) { b.image_url = refs[0]; b.image_weight = 60; }
    return b;
  }
  if (model.startsWith("higgsfield-ai/soul/")) return { prompt, aspect_ratio: opt.aspect, resolution: res || "1080p" };
  const b = { prompt, aspect_ratio: opt.aspect };
  if (res) b.resolution = res;
  if (refs.length) b.image_urls = refs;
  return b;
}

async function clipMode(mode, [image, prompt], opt) {
  if (!image || !prompt) { console.log("usage: higgsfield.js clip|estimate <image> \"<prompt>\" [--seconds 5] [--out clips/x.mp4]"); process.exit(2); }
  const model = opt.model || "kling-video/v3.0-turbo/image-to-video";
  const imageUrl = await upload(image);
  const body = { prompt, image_url: imageUrl, duration: opt.seconds, resolution: opt.resolution || "720p" };
  const usd = await estimate(model, body);
  note("estimate for " + opt.seconds + " s of " + model + ": " + (typeof usd === "number" ? "$" + usd : JSON.stringify(usd)));
  if (mode === "estimate" || opt.estimateOnly) return;
  const max = opt.maxUsd == null ? 3 : opt.maxUsd;
  if (typeof usd === "number" && usd > max) throw new Error("estimate $" + usd + " is above --max-usd " + max + "; nothing generated");
  const st = await submitAndWait(model, body);
  const out = opt.out || path.join("clips", path.basename(image, path.extname(image)) + ".mp4");
  await download(st.video.url, out);
}

async function imageMode([prompt], opt) {
  if (!prompt) { console.log("usage: higgsfield.js image \"<prompt>\" [--ref file|url]... [--model ...] [--aspect 1:1] [--count 1] [--out characters/x.png]"); process.exit(2); }
  const model = opt.model || "xai/grok-imagine-image-2.0";
  const refs = [];
  for (const r of opt.refs) refs.push(await upload(r));
  const body = imageBody(model, prompt, refs, opt);
  const usd = await estimate(model, body);
  note("estimate for one image from " + model + " (" + refs.length + " reference" + (refs.length === 1 ? "" : "s") + "): " + (typeof usd === "number" ? "$" + usd + (opt.count > 1 ? " × " + opt.count : "") : JSON.stringify(usd)));
  if (opt.estimateOnly) return;
  const max = opt.maxUsd == null ? 1 : opt.maxUsd;
  if (typeof usd === "number" && usd > max) throw new Error("estimate $" + usd + " per image is above --max-usd " + max + "; nothing generated");
  const stem = opt.out ? opt.out.replace(/\.(png|jpe?g|webp)$/i, "") : path.join("characters", "image");
  const made = [];
  for (let n = 1; n <= opt.count; n++) {
    const st = await submitAndWait(model, body);
    const imgs = st.images || (st.image ? [st.image] : []);
    if (!imgs.length) throw new Error("no image in result: " + JSON.stringify(st).slice(0, 300));
    for (let i = 0; i < imgs.length; i++) {
      const ext = (imgs[i].url.match(/\.(png|jpe?g|webp)(\?|$)/i) || [, "png"])[1].toLowerCase();
      const out = (opt.count === 1 && imgs.length === 1 ? stem : stem + "-" + n + (imgs.length > 1 ? String.fromCharCode(96 + i + 1) : "")) + "." + ext;
      await download(imgs[i].url, out); made.push(out);
    }
  }
  note("made " + made.length + " image" + (made.length === 1 ? "" : "s") + ": " + made.join(", "));
}

(async () => {
  const { mode, pos, opt } = args();
  if (mode === "clip" || mode === "estimate") return clipMode(mode, pos, opt);
  if (mode === "image") return imageMode(pos, opt);
  console.log("usage: higgsfield.js clip|estimate|image ..."); process.exit(2);
})().catch((e) => { console.error("::error::" + e.message); process.exit(1); });
