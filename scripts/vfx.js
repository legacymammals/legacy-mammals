#!/usr/bin/env node
/* Private VFX jobs on Higgsfield's API (runs in GitHub Actions on the `vfx` branch; see .github/workflows/vfx.yml).
 *
 *   node scripts/vfx.js <plan.json> <out dir>
 *
 * The plan and its input pictures arrive encrypted (inbox/<job>.tar.enc), the workflow opens them into work/,
 * and everything this script writes under <out dir> is sealed again into outbox/<job>.tar.enc. Nothing from the
 * plan (prompts, pictures, API responses) is printed: the public log only ever shows job names, model ids,
 * prices and HTTP status codes.
 *
 * plan.json:
 *   { "fetch": [ { "name": "docs", "url": "https://...", "auth": false } ],          -> out/fetch/<name>.txt
 *     "jobs":  [ { "name": "shot", "model": "vendor/model/variant", "body": {...},    -> out/<name>[-n][a].<ext> + out/<name>.json
 *                  "count": 1, "max_usd": 1, "estimate_only": false } ] }
 *   Any string "@file:<path>" inside a body (relative to the plan's folder) is uploaded to Higgsfield's file store
 *   and replaced by the URL it gets there. Jobs run a few at a time; a failure is written to out/<name>.error.json
 *   and the rest carry on.
 *
 * Keys come from the environment (repository secrets): HIGGSFIELD_API_KEY (id, or "id:secret") and HIGGSFIELD_API_SECRET.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const API = "https://api.higgsfield.ai";
const log = (m) => console.log(m);
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function auth() {
  const key = (process.env.HIGGSFIELD_API_KEY || "").trim(), secret = (process.env.HIGGSFIELD_API_SECRET || "").trim();
  if (!key) throw new Error("HIGGSFIELD_API_KEY is not set");
  const pair = key.includes(":") ? key : secret ? key + ":" + secret : null;
  if (!pair) throw new Error("the key has no secret");
  return { Authorization: "Key " + pair };
}
class ApiError extends Error { constructor(status, body, where) { super("HTTP " + status + " from " + where); this.status = status; this.body = body; } }
async function api(method, url, body, extra = {}) {
  const r = await fetch(url, { method, headers: Object.assign({ "Content-Type": "application/json" }, auth(), extra), body: body ? JSON.stringify(body) : undefined });
  const text = await r.text(); let j; try { j = JSON.parse(text); } catch (e) { j = { raw: text.slice(0, 2000) }; }
  if (!r.ok) throw new ApiError(r.status, j, method + " " + url.replace(API, "").replace(/\/[0-9a-f-]{20,}.*/, "/…"));
  return j;
}

const uploads = new Map();
async function upload(file) {
  if (uploads.has(file)) return uploads.get(file);
  const type = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".mp4": "video/mp4", ".mov": "video/quicktime" }[path.extname(file).toLowerCase()];
  if (!type) throw new Error("unsupported file type: " + path.extname(file));
  if (!fs.existsSync(file)) throw new Error("no such input file: " + path.basename(file));
  const data = fs.readFileSync(file);
  const u = await api("POST", API + "/files/generate-upload-url", { content_type: type });
  const r = await fetch(u.upload_url, { method: "PUT", headers: u.upload_headers || { "Content-Type": type }, body: data });
  if (!r.ok) throw new Error("upload failed: " + r.status);
  uploads.set(file, u.public_url);
  log("  uploaded " + path.basename(file) + " (" + Math.round(data.length / 1024) + " KB)");
  return u.public_url;
}
async function resolveFiles(value, base) {
  if (typeof value === "string") return value.startsWith("@file:") ? upload(path.resolve(base, value.slice(6))) : value;
  if (Array.isArray(value)) { const out = []; for (const v of value) out.push(await resolveFiles(v, base)); return out; }
  if (value && typeof value === "object") { const out = {}; for (const k of Object.keys(value)) out[k] = await resolveFiles(value[k], base); return out; }
  return value;
}

async function estimate(model, body) {
  try { const est = await api("POST", API + "/estimate/" + model, body); return est.usd != null ? Number(est.usd) : est; }
  catch (e) { return { error: e.message, status: e.status, body: e.body }; }
}
async function submitAndWait(model, body, minutes = 25) {
  const sub = await api("POST", API + "/" + model, body, { "Idempotency-Key": crypto.randomUUID() });
  log("  submitted " + model + " (" + sub.status + ")");
  const until = Date.now() + minutes * 60000; let wait = 4000, st;
  while (Date.now() < until) {
    await sleep(wait); wait = Math.min(12000, wait + 1000);
    st = await api("GET", sub.status_url);
    if (["completed", "failed", "nsfw", "canceled"].includes(st.status)) break;
  }
  if (!st || st.status !== "completed") { const e = new Error("job ended as " + (st && st.status)); e.body = st; throw e; }
  return st;
}
function mediaOf(st) {
  const list = [];
  const push = (m) => { if (m && m.url) list.push(m); };
  if (Array.isArray(st.images)) st.images.forEach(push);
  push(st.image); push(st.video);
  if (Array.isArray(st.videos)) st.videos.forEach(push);
  if (Array.isArray(st.outputs)) st.outputs.forEach(push);
  return list;
}
async function download(url, out) {
  const v = await fetch(url); if (!v.ok) throw new Error("download failed: " + v.status);
  fs.writeFileSync(out, Buffer.from(await v.arrayBuffer()));
  log("  wrote " + path.basename(out) + " (" + Math.round(fs.statSync(out).size / 1024) + " KB)");
}

async function runJob(job, base, outDir) {
  const name = job.name, model = job.model;
  try {
    const body = await resolveFiles(job.body, base);
    const usd = await estimate(model, body);
    const priced = typeof usd === "number";
    log(name + ": " + model + " estimate " + (priced ? "$" + usd : "unavailable (" + (usd.error || "?") + ")"));
    fs.writeFileSync(path.join(outDir, name + ".estimate.json"), JSON.stringify({ model, usd }, null, 2));
    if (job.estimate_only) return;
    const max = job.max_usd == null ? 1 : job.max_usd;
    if (priced && usd > max) throw new Error("estimate $" + usd + " is above max_usd " + max + "; nothing generated");
    const count = Math.max(1, job.count || 1);
    for (let n = 1; n <= count; n++) {
      const st = await submitAndWait(model, body);
      fs.writeFileSync(path.join(outDir, name + (count > 1 ? "-" + n : "") + ".json"), JSON.stringify(st, null, 2));
      const media = mediaOf(st);
      if (!media.length) throw Object.assign(new Error("no media in result"), { body: st });
      for (let i = 0; i < media.length; i++) {
        const ext = (media[i].url.match(/\.(png|jpe?g|webp|mp4|mov|webm)(\?|$)/i) || [, media[i].url.includes("video") ? "mp4" : "png"])[1].toLowerCase();
        const out = path.join(outDir, name + (count > 1 ? "-" + n : "") + (media.length > 1 ? String.fromCharCode(96 + i + 1) : "") + "." + ext);
        await download(media[i].url, out);
      }
    }
    log(name + ": done");
  } catch (e) {
    log(name + ": failed (" + (e.status ? "HTTP " + e.status : e.message.replace(/https?:\/\/\S+/g, "<url>").slice(0, 120)) + ")");
    fs.writeFileSync(path.join(outDir, name + ".error.json"), JSON.stringify({ message: e.message, status: e.status, body: e.body }, null, 2));
  }
}

async function fetchOne(f, outDir) {
  const dir = path.join(outDir, "fetch"); fs.mkdirSync(dir, { recursive: true });
  try {
    const headers = f.auth ? auth() : {};
    const r = await fetch(f.url, { headers, redirect: "follow" });
    const text = await r.text();
    fs.writeFileSync(path.join(dir, f.name + ".txt"), "HTTP " + r.status + " " + r.headers.get("content-type") + "\n\n" + text);
    log("fetch " + f.name + ": HTTP " + r.status + " (" + text.length + " chars)");
  } catch (e) {
    fs.writeFileSync(path.join(dir, f.name + ".txt"), "ERROR " + e.message);
    log("fetch " + f.name + ": error");
  }
}

(async () => {
  const [planFile, outDir] = process.argv.slice(2);
  if (!planFile || !outDir) { console.log("usage: vfx.js <plan.json> <out dir>"); process.exit(2); }
  const plan = JSON.parse(fs.readFileSync(planFile, "utf8"));
  const base = path.dirname(planFile);
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of plan.fetch || []) await fetchOne(f, outDir);
  const jobs = plan.jobs || [];
  const limit = plan.concurrency || 4; let i = 0;
  const workers = Array.from({ length: Math.min(limit, jobs.length) }, async () => { while (i < jobs.length) await runJob(jobs[i++], base, outDir); });
  await Promise.all(workers);
  log("all " + jobs.length + " job(s) handled");
})().catch((e) => { console.error("::error::" + e.message.replace(/https?:\/\/\S+/g, "<url>").slice(0, 200)); process.exit(1); });
