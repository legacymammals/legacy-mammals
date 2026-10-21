#!/usr/bin/env node
/* Legacy Mammals — post new stories to X and Instagram.
 *
 * Runs in GitHub Actions (.github/workflows/publish.yml) after each push that changes
 * index.html, in two phases:
 *
 *   node scripts/publish.js render
 *     Opens the site (served locally from the checkout), finds the stories that are not yet in
 *     social/posted.json, draws each one's share image with the site's own share.js (so the
 *     fonts, photos and the sign-off are exactly what the Share button gives), and writes
 *       social/<id>.png      the share image, as the site draws it
 *       social/<id>-ig.png   the Instagram version: the same image, and if the story is
 *                            taller than Instagram's 4:5 limit, shrunk to fit 1080 x 1350
 *                            with black bars at the sides
 *     The workflow then pushes the images, so Instagram can fetch them from a public URL.
 *
 *   node scripts/publish.js check
 *     Verifies the keys without posting anything (see check() below).
 *
 *   node scripts/publish.js refresh
 *     Renews the Instagram token and stores it (see refresh() below). Runs on a schedule.
 *
 *   node scripts/publish.js post
 *     Posts each pending story to X (image + headline + permalink) and Instagram (image +
 *     headline + "link in bio"), then records it in social/posted.json so it never posts twice.
 *
 * One story per run (MAX_PER_RUN), oldest first; an hourly schedule drains any backlog.
 *
 * Dry run: when no keys are configured, or SOCIAL_DRY_RUN=true, the images are drawn and the
 * stories are recorded as seen, but nothing is posted. Stories first seen during a dry run are
 * not posted later; only stories added after the keys exist go out.
 *
 * FORCE_STORY=<id> re-renders that story even if it is already recorded (and, outside a dry
 * run, posts it again). A forced story is recorded only when it is actually posted.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://legacymammals.com";
const RAW = "https://raw.githubusercontent.com/legacymammals/legacy-mammals/main";
const OUT = path.join(ROOT, "social");
const LEDGER = path.join(OUT, "posted.json");
const PENDING = path.join(process.env.LM_TMP || process.env.RUNNER_TEMP || os.tmpdir(), "legacymammals-pending.json");
const LOCAL = process.env.LOCAL_URL || "http://127.0.0.1:8080/";
const IG_W = 1080, IG_H = 1350; // 4:5, the tallest Instagram allows in the feed

const env = (k) => (process.env[k] || "").trim();
const X = { key: env("X_API_KEY"), secret: env("X_API_SECRET"), token: env("X_ACCESS_TOKEN"), tokenSecret: env("X_ACCESS_SECRET") };
// Two kinds of Instagram token exist. A Facebook Page token (starts with "EAA") talks to
// graph.facebook.com; a token from "Instagram API with Instagram Login" (starts with "IG") talks
// to graph.instagram.com. The host follows the token unless IG_API_HOST says otherwise.
const IG = { user: env("IG_USER_ID"), token: env("IG_ACCESS_TOKEN"), version: env("IG_API_VERSION") || "v23.0" };
IG.host = env("IG_API_HOST") || (IG.token.startsWith("IG") ? "graph.instagram.com" : "graph.facebook.com");
const haveX = !!(X.key && X.secret && X.token && X.tokenSecret);
const haveIG = !!(IG.user && IG.token);
const DRY = env("SOCIAL_DRY_RUN").toLowerCase() === "true" || (!haveX && !haveIG);
const FORCE = env("FORCE_STORY");
const MAX = Math.max(1, parseInt(env("MAX_PER_RUN") || "1", 10)); // stories per run; the rest wait for the next hourly run

// In Actions, the lines worth keeping are also raised as annotations, which show on the run's summary page.
const note = (m) => { console.log(m); if (process.env.GITHUB_ACTIONS) console.log("::notice::" + m.replace(/\n/g, "%0A")); };
const readJSON = (p, fallback) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { return fallback; } };
const writeJSON = (p, v) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n"); };

// ---------------------------------------------------------------- render
async function render() {
  const { chromium } = require("playwright");
  const ledger = readJSON(LEDGER, { posted: {} });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", (e) => console.log("page error:", e.message));
  await page.goto(LOCAL, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.LM && window.LM.render, null, { timeout: 30000 });

  const stories = await page.evaluate(() => Array.prototype.map.call(document.querySelectorAll(".thread[id]"), (t) => ({
    id: t.id,
    title: ((t.querySelector(".card .t") || {}).textContent || "").trim(),
    href: (t.querySelector(".card") || {}).getAttribute("href") || "",
  })));
  const rec = (id) => ledger.posted[id] || null;
  const queue = stories.filter((s) => !rec(s.id)).reverse(); // oldest first, so a backlog posts in order
  let fresh = queue.slice(0, MAX);
  // Each platform catches up on its own: the oldest story that failed on X, and the oldest
  // that failed on Instagram, are tried again every run until they go through.
  const retries = [];
  for (const side of ["x", "ig"]) {
    const c = stories.filter((s) => rec(s.id) && rec(s.id)[side + "Error"] && !rec(s.id)[side]).pop();
    if (c && !fresh.some((f) => f.id === c.id) && !retries.some((f) => f.id === c.id)) retries.push(Object.assign({ retry: true }, c));
  }
  fresh = fresh.concat(retries);
  if (FORCE) {
    const f = stories.find((s) => s.id === FORCE);
    if (!f) throw new Error("FORCE_STORY " + FORCE + " is not on the page");
    const already = fresh.find((s) => s.id === FORCE);
    if (already) already.forced = true; else fresh.push(Object.assign({ forced: true }, f));
  }
  note((queue.length ? "next up: " + fresh.filter((s) => !s.retry).map((s) => s.id).join(", ") + (queue.length > MAX ? " (" + (queue.length - MAX) + " more waiting, one per hour)" : "") : "nothing new") + (retries.length ? "; retrying " + retries.map((s) => s.id).join(", ") : ""));

  fs.mkdirSync(OUT, { recursive: true });
  for (const s of fresh) {
    if (!s.forced && fs.existsSync(path.join(OUT, s.id + ".png")) && fs.existsSync(path.join(OUT, s.id + "-ig.png"))) { console.log("images for " + s.id + " already drawn"); continue; }
    const pngB64 = await page.evaluate(async (id) => {
      const r = await window.LM.render(document.getElementById(id));
      return await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result.split(",")[1]); fr.readAsDataURL(r.png); });
    }, s.id);
    fs.writeFileSync(path.join(OUT, s.id + ".png"), Buffer.from(pngB64, "base64"));

    const ig = await page.evaluate(async ({ b64, W, H }) => {
      const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
      const c = document.createElement("canvas"); let boxed = false;
      if (img.height / img.width <= H / W) { c.width = img.width; c.height = img.height; c.getContext("2d").drawImage(img, 0, 0); }
      else {
        boxed = true; c.width = W; c.height = H; const ctx = c.getContext("2d");
        ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
        const w = Math.round(img.width * H / img.height); ctx.drawImage(img, Math.round((W - w) / 2), 0, w, H);
      }
      return { b64: c.toDataURL("image/png").split(",")[1], w: c.width, h: c.height, boxed, srcH: img.height };
    }, { b64: pngB64, W: IG_W, H: IG_H });
    fs.writeFileSync(path.join(OUT, s.id + "-ig.png"), Buffer.from(ig.b64, "base64"));
    note("drew " + s.id + ": 1080 x " + ig.srcH + (ig.boxed ? " -> Instagram " + ig.w + " x " + ig.h + " with side bars" : " (fits Instagram as is)"));
  }
  await browser.close();
  writeJSON(PENDING, fresh);
}

// ---------------------------------------------------------------- X (OAuth 1.0a user context)
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
function oauthHeader(method, url) {
  const o = {
    oauth_consumer_key: X.key, oauth_nonce: crypto.randomBytes(16).toString("hex"), oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(), oauth_token: X.token, oauth_version: "1.0",
  };
  const paramStr = Object.keys(o).sort().map((k) => enc(k) + "=" + enc(o[k])).join("&");
  const base = [method.toUpperCase(), enc(url), enc(paramStr)].join("&");
  o.oauth_signature = crypto.createHmac("sha1", enc(X.secret) + "&" + enc(X.tokenSecret)).update(base).digest("base64");
  return "OAuth " + Object.keys(o).sort().map((k) => enc(k) + '="' + enc(o[k]) + '"').join(", ");
}
async function xUploadMedia(png) {
  const url = "https://api.x.com/2/media/upload";
  const form = new FormData();
  form.append("media", new Blob([png], { type: "image/png" }), "story.png");
  form.append("media_category", "tweet_image");
  form.append("media_type", "image/png");
  const r = await fetch(url, { method: "POST", headers: { Authorization: oauthHeader("POST", url) }, body: form });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("X media upload failed: " + r.status + " " + JSON.stringify(j));
  return (j.data && j.data.id) || j.media_id_string || j.id;
}
async function xPost(text, mediaId) {
  const url = "https://api.x.com/2/tweets";
  const r = await fetch(url, { method: "POST", headers: { Authorization: oauthHeader("POST", url), "Content-Type": "application/json" }, body: JSON.stringify({ text, media: { media_ids: [String(mediaId)] } }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("X post failed: " + r.status + " " + JSON.stringify(j));
  return j.data && j.data.id;
}

// ---------------------------------------------------------------- Instagram (Graph API)
async function igPost(imageUrl, caption) {
  const base = "https://" + IG.host + "/" + IG.version + "/";
  let r = await fetch(base + IG.user + "/media", { method: "POST", body: new URLSearchParams({ image_url: imageUrl, caption, access_token: IG.token }) });
  let j = await r.json().catch(() => ({}));
  if (!r.ok || !j.id) throw new Error("Instagram container failed: " + r.status + " " + JSON.stringify(j));
  const creation = j.id;
  for (let i = 0; i < 20; i++) {
    const s = await (await fetch(base + creation + "?fields=status_code&access_token=" + enc(IG.token))).json().catch(() => ({}));
    if (s.status_code === "FINISHED") break;
    if (s.status_code === "ERROR" || s.status_code === "EXPIRED") throw new Error("Instagram container " + s.status_code + ": " + JSON.stringify(s));
    await new Promise((res) => setTimeout(res, 3000));
  }
  r = await fetch(base + IG.user + "/media_publish", { method: "POST", body: new URLSearchParams({ creation_id: creation, access_token: IG.token }) });
  j = await r.json().catch(() => ({}));
  if (!r.ok || !j.id) throw new Error("Instagram publish failed: " + r.status + " " + JSON.stringify(j));
  return j.id;
}

// ---------------------------------------------------------------- post
async function post() {
  const ledger = readJSON(LEDGER, { posted: {} });
  const pending = readJSON(PENDING, []);
  if (!pending.length) { console.log("nothing to post"); return; }
  note(DRY ? "dry run: nothing will be posted" + (haveX || haveIG ? " (SOCIAL_DRY_RUN is true)" : " (no keys configured)") : "posting to " + [haveX && "X", haveIG && "Instagram"].filter(Boolean).join(" and "));

  for (const s of pending) {
    const permalink = SITE + "/#" + s.id;
    const title = s.title || "Legacy Mammals";
    const xText = (title.length > 240 ? title.slice(0, 237) + "…" : title) + "\n\n" + permalink;
    const igCaption = title + "\n\nThe whole exchange, and the link to the story, at legacymammals.com — link in bio.";
    const prev = ledger.posted[s.id] || {}; // a forced re-run only fills in what is missing
    const record = Object.assign({}, prev, { title, at: new Date().toISOString() });

    if (DRY) {
      note("would post " + s.id + ":\n" + xText.replace(/^/gm, "    "));
      if (s.forced || s.retry) continue; // a test render leaves the ledger alone
      record.dryRun = true;
    } else {
      const png = fs.readFileSync(path.join(OUT, s.id + ".png"));
      let sent = false;
      if (haveX && !prev.x) {
        try { record.x = await xPost(xText, await xUploadMedia(png)); delete record.xError; sent = true; note("posted " + s.id + " to X: " + record.x); }
        catch (e) { record.xError = e.message; note(e.message); }
      }
      if (haveIG && !prev.ig) {
        // Instagram fetches the image itself, from the copy the workflow pushed a moment ago.
        try { record.ig = await igPost(RAW + "/social/" + s.id + "-ig.png", igCaption); delete record.igError; sent = true; note("posted " + s.id + " to Instagram: " + record.ig); }
        catch (e) { record.igError = e.message; note(e.message); }
      }
      if (!sent && !prev.x && !prev.ig) { note("nothing went out for " + s.id + "; it stays pending for the next run"); continue; }
      delete record.dryRun;
    }
    ledger.posted[s.id] = record;
    writeJSON(LEDGER, ledger);
  }
}

// ---------------------------------------------------------------- check
// Verifies the keys without posting anything. X: who the keys sign in as, then a test image
// upload (unused media is discarded by X within a day, so nothing appears). Instagram: the
// account, the token's permissions and expiry, and the publishing quota. Prints no secrets.
const TEST_PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
async function check() {
  let ok = true;
  const missing = (names) => names.filter((n) => !env(n));
  const xMissing = missing(["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET"]);
  if (xMissing.length === 4) note("X: no keys yet (X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET)");
  else if (xMissing.length) { ok = false; note("X: incomplete, missing " + xMissing.join(", ")); }
  else {
    const url = "https://api.x.com/2/users/me";
    const r = await fetch(url, { headers: { Authorization: oauthHeader("GET", url) } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.data) { ok = false; note("X: the keys were rejected (" + r.status + "): " + JSON.stringify(j).slice(0, 300)); }
    else {
      note("X: signed in as @" + j.data.username);
      try { await xUploadMedia(TEST_PNG); note("X: write access works (a test image uploaded and was not posted)"); }
      catch (e) { ok = false; note("X: can read but cannot upload media, so posting will fail. " + e.message.slice(0, 400)); }
    }
  }
  const igMissing = missing(["IG_USER_ID", "IG_ACCESS_TOKEN"]);
  if (igMissing.length === 2) note("Instagram: no keys yet (IG_USER_ID, IG_ACCESS_TOKEN)");
  else if (igMissing.length) { ok = false; note("Instagram: incomplete, missing " + igMissing.join(", ")); }
  else {
    const base = "https://" + IG.host + "/" + IG.version + "/";
    note("Instagram: token looks like " + (IG.token.startsWith("IG") ? "an Instagram Login token" : IG.token.startsWith("EAA") ? "a Facebook token" : "neither a Facebook (EAA...) nor an Instagram Login (IG...) token; check what was pasted") + ", using " + IG.host);
    // Who does the token belong to, and does IG_USER_ID point at that account?
    const who = await (await fetch(base + "me?fields=id,username" + (IG.host === "graph.instagram.com" ? ",user_id" : "") + "&access_token=" + enc(IG.token))).json().catch(() => ({}));
    if (who.username) {
      const ids = [who.id, who.user_id].filter(Boolean);
      note("Instagram: token belongs to @" + who.username + "; IG_USER_ID " + (ids.includes(IG.user) ? "matches it" : "does not match it (" + (IG.host === "graph.instagram.com" ? "use the user_id this token reports" : "it must be the Instagram business account id linked to the Page, not the Page id or the app id") + ")"));
    } else if (who.error) note("Instagram: me lookup: " + who.error.message);
    const me = await (await fetch(base + IG.user + "?fields=id,username,media_count&access_token=" + enc(IG.token))).json().catch(() => ({}));
    if (me.error || !me.username) { ok = false; note("Instagram: rejected: " + ((me.error && me.error.message) || JSON.stringify(me).slice(0, 300))); }
    else {
      note("Instagram: account @" + me.username + " (" + me.media_count + " posts)");
      const dbg = await (await fetch(base + "debug_token?input_token=" + enc(IG.token) + "&access_token=" + enc(IG.token))).json().catch(() => ({}));
      if (dbg.data) {
        const scopes = dbg.data.scopes || [], exp = dbg.data.expires_at ? new Date(dbg.data.expires_at * 1000).toISOString().slice(0, 10) : "never";
        const canPublish = scopes.includes("instagram_content_publish");
        if (!canPublish) ok = false;
        note("Instagram: " + (dbg.data.type || "token") + " token, expires " + exp + ", publish permission " + (canPublish ? "granted" : "MISSING (needs instagram_content_publish)"));
      }
      const q = await (await fetch(base + IG.user + "/content_publishing_limit?fields=quota_usage,config&access_token=" + enc(IG.token))).json().catch(() => ({}));
      if (q.data && q.data[0]) note("Instagram: publishing quota used " + q.data[0].quota_usage + " of " + q.data[0].config.quota_total + " per " + Math.round(q.data[0].config.quota_duration / 3600) + " hours");
      else if (q.error) { ok = false; note("Instagram: publishing check failed: " + q.error.message); }
    }
  }
  note(ok ? "Check finished: everything configured works." : "Check finished: something above needs fixing.");
}

// ---------------------------------------------------------------- refresh
// An Instagram Login token lasts 60 days. This asks Instagram for a fresh one and stores it
// back in the repository's secrets with `gh secret set`, which needs SECRETS_TOKEN: a
// fine-grained GitHub token for this repository with Secrets read-and-write. The new token
// goes to gh over stdin and is never printed. A Facebook Page token does not expire.
async function refresh() {
  if (!IG.token) { note("Instagram: no token to refresh"); return; }
  if (IG.host !== "graph.instagram.com") { note("Instagram: a Facebook token does not expire; nothing to refresh"); return; }
  const r = await fetch("https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=" + enc(IG.token));
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error("Instagram refused to refresh the token: " + JSON.stringify(j).slice(0, 300) + " (if it has expired, generate a new one in the Meta developer portal and paste it into IG_ACCESS_TOKEN)");
  const days = Math.round((j.expires_in || 0) / 86400);
  if (!env("SECRETS_TOKEN")) throw new Error("Instagram gave a fresh token good for " + days + " days, but it cannot be stored: add a SECRETS_TOKEN secret (fine-grained GitHub token, this repository, Secrets: read and write)");
  const { spawnSync } = require("child_process");
  const res = spawnSync("gh", ["secret", "set", "IG_ACCESS_TOKEN", "--repo", process.env.GITHUB_REPOSITORY || "legacymammals/legacy-mammals"], { input: j.access_token, env: Object.assign({}, process.env, { GH_TOKEN: env("SECRETS_TOKEN") }), encoding: "utf8" });
  if (res.status !== 0) throw new Error("gh secret set failed: " + (res.stderr || "").slice(0, 300));
  note("Instagram: token refreshed and stored; good for " + days + " days");
}

const mode = process.argv[2];
(mode === "render" ? render() : mode === "post" ? post() : mode === "check" ? check() : mode === "refresh" ? refresh() : Promise.reject(new Error("usage: publish.js render|post|check|refresh")))
  .catch((e) => { console.error(e.message || e); process.exit(1); });
