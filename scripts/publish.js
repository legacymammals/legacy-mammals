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
 *       social/<id>-ig-1.png, -2.png, ...
 *                            for a story taller than 4:5: the strip cut into 1080 x 1350
 *                            slides at bubble boundaries, posted as a carousel instead of
 *                            the barred image
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
 * Dry run: when no keys are configured, or SOCIAL_DRY_RUN=true, the images are drawn but nothing
 * is posted and nothing is recorded, so the stories wait in the queue until the next live run.
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
const OG = path.join(ROOT, "og"); // link-preview images, one per story page
const REELS = path.join(ROOT, "reels"); // one silent 1080 x 1920 reel per story, drawn by reel.js
const LEDGER = path.join(OUT, "posted.json");
const PENDING = path.join(process.env.LM_TMP || process.env.RUNNER_TEMP || os.tmpdir(), "legacymammals-pending.json");
const LOCAL = process.env.LOCAL_URL || "http://127.0.0.1:8080/";
const IG_W = 1080, IG_H = 1350; // 4:5, the tallest Instagram allows in the feed
// Hashtags. X rewards few; Instagram rewards a set. Edit here.
const X_TAGS = "#AI #AInews #LegacyMammals";
const IG_TAGS = "#AI #ArtificialIntelligence #AInews #OpenAI #ChatGPT #Claude #Robots #Tech #TechNews #Satire #Comics #Singularity #EndOfHumanity #WeHadOurTurn #LegacyMammals";

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
const CAROUSEL = env("CAROUSEL_STORY"); // a story to put up again as an Instagram carousel (workflow input carousel)
const MAX = Math.max(1, parseInt(env("MAX_PER_RUN") || "1", 10)); // stories per run; the rest wait for the next hourly run

// In Actions, the lines worth keeping are also raised as annotations, which show on the run's summary page.
const note = (m) => { console.log(m); if (process.env.GITHUB_ACTIONS) console.log("::notice::" + m.replace(/\n/g, "%0A")); };
const readJSON = (p, fallback) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { return fallback; } };
const pngHeight = (p) => { try { return fs.readFileSync(p).readUInt32BE(20); } catch (e) { return 0; } };
// The story's slides, in order: social/<id>-ig-1.png, -2.png, ... (none for a story that fits one frame)
const slidesOf = (id) => { let n = 0; while (fs.existsSync(path.join(OUT, id + "-ig-" + (n + 1) + ".png"))) n++; return Array.from({ length: n }, (_, i) => path.join(OUT, id + "-ig-" + (i + 1) + ".png")); };
const writeJSON = (p, v) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n"); };

// ---------------------------------------------------------------- render
async function render() {
  const { chromium } = require("playwright");
  const ledger = readJSON(LEDGER, { posted: {} });
  const browser = await chromium.launch(process.env.PW_EXEC ? { executablePath: process.env.PW_EXEC } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", (e) => console.log("page error:", e.message));
  await page.goto(LOCAL, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.LM && window.LM.render, null, { timeout: 30000 });

  const stories = await page.evaluate(() => Array.prototype.map.call(document.querySelectorAll(".thread[id]"), (t) => ({
    id: t.id,
    slug: t.getAttribute("data-slug") || t.id,
    title: ((t.querySelector(".card .t") || {}).textContent || "").trim(),
    href: (t.querySelector(".card") || {}).getAttribute("href") || "",
  })));
  const rec = (id) => ledger.posted[id] || null;
  const queue = stories.filter((s) => !rec(s.id)).reverse(); // oldest first, so a backlog posts in order
  // A push carries a story just added: that one goes out now. The hourly runs drain the backlog oldest first.
  let fresh = process.env.GITHUB_EVENT_NAME === "push" ? queue.slice(-MAX) : queue.slice(0, MAX);
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
  // The slides of a story taller than one Instagram frame: cut at bubble boundaries by share.js.
  async function drawSlides(id) {
    const urls = await page.evaluate(async (id) => (await window.LM.slides(document.getElementById(id))).map((c) => c.toDataURL("image/png")), id);
    for (const f of slidesOf(id)) fs.unlinkSync(f);
    if (urls.length < 2) { console.log(id + " fits one frame; no slides"); return 0; }
    urls.forEach((u, i) => fs.writeFileSync(path.join(OUT, id + "-ig-" + (i + 1) + ".png"), Buffer.from(u.split(",")[1], "base64")));
    note("cut " + id + " into " + urls.length + " slides for an Instagram carousel");
    return urls.length;
  }
  if (CAROUSEL) {
    if (!stories.some((s) => s.id === CAROUSEL)) throw new Error("CAROUSEL_STORY " + CAROUSEL + " is not on the page");
    await drawSlides(CAROUSEL);
  }
  for (const s of fresh) {
    const drawn = fs.existsSync(path.join(OUT, s.id + ".png")) && fs.existsSync(path.join(OUT, s.id + "-ig.png"));
    if (!s.forced && drawn && (pngHeight(path.join(OUT, s.id + ".png")) <= IG_H || slidesOf(s.id).length)) { console.log("images for " + s.id + " already drawn"); continue; }
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
    if (ig.boxed) await drawSlides(s.id); else for (const f of slidesOf(s.id)) fs.unlinkSync(f);
  }
  // Link previews (og:image) for the story pages: drawn once per story, and one for the home page.
  fs.mkdirSync(OG, { recursive: true });
  const previews = stories.filter((s) => !fs.existsSync(path.join(OG, s.id + ".png")));
  for (const s of previews) {
    const b64 = await page.evaluate(async (id) => {
      const blob = await window.LM.preview(document.getElementById(id));
      return await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result.split(",")[1]); fr.readAsDataURL(blob); });
    }, s.id);
    fs.writeFileSync(path.join(OG, s.id + ".png"), Buffer.from(b64, "base64"));
  }
  if (!fs.existsSync(path.join(OG, "home.png"))) {
    const b64 = await page.evaluate(async () => {
      const blob = await window.LM.previewHome();
      return await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result.split(",")[1]); fr.readAsDataURL(blob); });
    });
    fs.writeFileSync(path.join(OG, "home.png"), Buffer.from(b64, "base64"));
  }
  if (previews.length) note("drew link previews for " + previews.map((s) => s.id).join(", "));
  await browser.close();
  writeJSON(PENDING, fresh);
}

// The story's own page and its preview image must be live before the links go out, or X and
// friends cache an empty card. GitHub Pages usually deploys within a minute or two.
async function waitLive(url, minutes) {
  const until = Date.now() + minutes * 60000;
  while (Date.now() < until) {
    try { const r = await fetch(url, { method: "HEAD", cache: "no-store" }); if (r.ok) return true; } catch (e) {}
    await new Promise((res) => setTimeout(res, 10000));
  }
  return false;
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
// A second look at the ledger as GitHub has it right now: a run that checked out an older commit
// must not post a story the run before it already posted.
async function mergeRemoteLedger(ledger) {
  const repo = process.env.GITHUB_REPOSITORY, token = process.env.GITHUB_TOKEN;
  if (!repo || !token) return;
  try {
    const r = await fetch("https://api.github.com/repos/" + repo + "/contents/social/posted.json?ref=main", { headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github.raw+json", "User-Agent": "legacymammals" } });
    if (!r.ok) { note("warning: could not read the ledger on GitHub (" + r.status + ")"); return; }
    const remote = await r.json();
    let merged = 0;
    for (const [id, rec] of Object.entries((remote && remote.posted) || {})) {
      const local = ledger.posted[id] || {};
      for (const k of ["x", "ig", "igStory", "igStoryAt", "at", "title"]) if (rec[k] && !local[k]) { local[k] = rec[k]; merged++; }
      ledger.posted[id] = local;
    }
    if (merged) { writeJSON(LEDGER, ledger); note("took " + merged + " newer entries from the ledger on GitHub"); }
  } catch (e) { note("warning: could not read the ledger on GitHub: " + e.message); }
}
async function xDelete(id) {
  const url = "https://api.x.com/2/tweets/" + id;
  const r = await fetch(url, { method: "DELETE", headers: { Authorization: oauthHeader("DELETE", url) } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("X delete failed: " + r.status + " " + JSON.stringify(j));
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

// A carousel: one container per slide, then a parent container that lists them, then publish.
async function igCarousel(imageUrls, caption) {
  const base = "https://" + IG.host + "/" + IG.version + "/";
  const wait = async (id, what) => {
    for (let i = 0; i < 40; i++) {
      const s = await (await fetch(base + id + "?fields=status_code&access_token=" + enc(IG.token))).json().catch(() => ({}));
      if (s.status_code === "FINISHED") return;
      if (s.status_code === "ERROR" || s.status_code === "EXPIRED") throw new Error("Instagram " + what + " " + s.status_code + ": " + JSON.stringify(s));
      await new Promise((res) => setTimeout(res, 3000));
    }
  };
  const children = [];
  for (const url of imageUrls) {
    const r = await fetch(base + IG.user + "/media", { method: "POST", body: new URLSearchParams({ image_url: url, is_carousel_item: "true", access_token: IG.token }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.id) throw new Error("Instagram slide container failed: " + r.status + " " + JSON.stringify(j));
    await wait(j.id, "slide container");
    children.push(j.id);
  }
  let r = await fetch(base + IG.user + "/media", { method: "POST", body: new URLSearchParams({ media_type: "CAROUSEL", children: children.join(","), caption, access_token: IG.token }) });
  let j = await r.json().catch(() => ({}));
  if (!r.ok || !j.id) throw new Error("Instagram carousel container failed: " + r.status + " " + JSON.stringify(j));
  await wait(j.id, "carousel container");
  r = await fetch(base + IG.user + "/media_publish", { method: "POST", body: new URLSearchParams({ creation_id: j.id, access_token: IG.token }) });
  j = await r.json().catch(() => ({}));
  if (!r.ok || !j.id) throw new Error("Instagram carousel publish failed: " + r.status + " " + JSON.stringify(j));
  return j.id;
}
const slideUrls = (id) => slidesOf(id).map((f) => RAW + "/social/" + path.basename(f) + "?v=" + Date.now());

// ---------------------------------------------------------------- stories
// Puts a story's reel up as an Instagram Story: Instagram fetches the reel from the site, so the
// reel must be live there first. Silent: the API has no way to attach music; that is only in the app.
const reelOf = (id) => path.join(REELS, id + ".mp4");
async function igStory(id) {
  const url = SITE + "/reels/" + id + ".mp4";
  // The site must be serving this very file (a re-rendered reel keeps its address), so the size has to match.
  const bytes = fs.statSync(reelOf(id)).size, until = Date.now() + 6 * 60000;
  let live = false;
  while (Date.now() < until && !live) {
    try { const r = await fetch(url, { method: "HEAD", cache: "no-store" }); live = r.ok && String(r.headers.get("content-length")) === String(bytes); } catch (e) {}
    if (!live) await new Promise((res) => setTimeout(res, 10000));
  }
  if (!live) throw new Error(url + " is not live yet (or not this version of it)");
  const base = "https://" + IG.host + "/" + IG.version + "/";
  let r = await fetch(base + IG.user + "/media", { method: "POST", body: new URLSearchParams({ media_type: "STORIES", video_url: url + "?v=" + Date.now(), access_token: IG.token }) });
  let j = await r.json().catch(() => ({}));
  if (!r.ok || !j.id) throw new Error("Instagram story container failed: " + r.status + " " + JSON.stringify(j));
  const creation = j.id;
  for (let i = 0; i < 90; i++) {
    const st = await (await fetch(base + creation + "?fields=status_code,status&access_token=" + enc(IG.token))).json().catch(() => ({}));
    if (st.status_code === "FINISHED") break;
    if (st.status_code === "ERROR" || st.status_code === "EXPIRED") throw new Error("Instagram story container " + st.status_code + ": " + JSON.stringify(st));
    await new Promise((res) => setTimeout(res, 5000));
  }
  r = await fetch(base + IG.user + "/media_publish", { method: "POST", body: new URLSearchParams({ creation_id: creation, access_token: IG.token }) });
  j = await r.json().catch(() => ({}));
  if (!r.ok || !j.id) throw new Error("Instagram story publish failed: " + r.status + " " + JSON.stringify(j));
  return j.id;
}

// Tries the Story for one ledger entry and records the outcome (igStory, or igStoryError and a try count).
async function tryStory(ledger, id) {
  const record = ledger.posted[id];
  try { record.igStory = await igStory(id); record.igStoryAt = new Date().toISOString(); delete record.igStoryError; delete record.igStoryTries; note("posted the " + id + " reel as an Instagram story: " + record.igStory); }
  catch (e) { record.igStoryError = e.message; record.igStoryTries = (record.igStoryTries || 0) + 1; note("the " + id + " reel did not go up as a story (try " + record.igStoryTries + " of 3): " + e.message); }
  writeJSON(LEDGER, ledger);
}

// The manual mode (workflow input story_reel): posts the reel again unless it went up in the last day.
async function story(id) {
  if (!id) throw new Error("usage: publish.js story <id>");
  if (!fs.existsSync(reelOf(id))) throw new Error("there is no reel at reels/" + id + ".mp4; render one first (workflow input reel)");
  if (DRY) { note("dry run: would post " + SITE + "/reels/" + id + ".mp4 as an Instagram story"); return; }
  if (!haveIG) throw new Error("Instagram keys are not configured");
  const ledger = readJSON(LEDGER, { posted: {} });
  const prev = ledger.posted[id] || {};
  if (prev.igStory && Date.now() - Date.parse(prev.igStoryAt || 0) < 86400000) { note(id + " went up as a story " + prev.igStoryAt + " and is still showing; not posting it twice"); return; }
  ledger.posted[id] = prev;
  await tryStory(ledger, id);
  if (ledger.posted[id].igStoryError) throw new Error(ledger.posted[id].igStoryError);
}

// ---------------------------------------------------------------- post
async function post() {
  const ledger = readJSON(LEDGER, { posted: {} });
  const storiesTried = new Set();
  const pending = readJSON(PENDING, []);
  if (!pending.length) console.log("nothing to post");
  else note(DRY ? "dry run: nothing will be posted" + (haveX || haveIG ? " (SOCIAL_DRY_RUN is true)" : " (no keys configured)") : "posting to " + [haveX && "X", haveIG && "Instagram"].filter(Boolean).join(" and "));

  await mergeRemoteLedger(ledger);
  for (const s of pending) {
    if (ledger.posted[s.id] && ledger.posted[s.id].x && ledger.posted[s.id].ig && !FORCE) { note(s.id + " is already up (per the ledger on GitHub); skipping"); continue; }
    const permalink = SITE + "/" + (s.slug || s.id) + "/";
    const title = s.title || "Legacy Mammals";
    // X counts any link as 23 characters; keep the whole post inside 280
    const xRoom = 280 - 23 - 4 - X_TAGS.length;
    const xText = (title.length > xRoom ? title.slice(0, xRoom - 1) + "…" : title) + "\n\n" + permalink + "\n\n" + X_TAGS;
    const igCaption = title + "\n\nThe whole exchange, and the link to the story, at legacymammals.com — link in bio.\n\n" + IG_TAGS;
    const prev = ledger.posted[s.id] || {}; // a forced re-run only fills in what is missing
    const record = Object.assign({}, prev, { title, at: new Date().toISOString() });

    if (DRY) { note("would post " + s.id + ":\n" + xText.replace(/^/gm, "    ")); continue; } // a dry run posts nothing and records nothing; the story waits
    else {
      const png = fs.readFileSync(path.join(OUT, s.id + ".png"));
      let sent = false;
      if (!(await waitLive(permalink, 4)) || !(await waitLive(SITE + "/og/" + s.id + ".png", 4))) note("warning: " + permalink + " or its preview image is not live yet; posting anyway");
      if (haveX && !prev.x) {
        // A retraction: the ledger names an earlier post to take down before this one goes up.
        try { if (prev.xDelete) { await xDelete(prev.xDelete); delete record.xDelete; note("took down the earlier X post of " + s.id); } record.x = await xPost(xText, await xUploadMedia(png)); delete record.xError; sent = true; note("posted " + s.id + " to X: " + record.x); }
        catch (e) { record.xError = e.message; note(e.message); }
      }
      if (haveIG && !prev.ig) {
        // Instagram fetches the images itself, from the copies the workflow pushed a moment ago.
        // A story taller than one frame goes up as a carousel of its slides, not as a barred image.
        const slides = slidesOf(s.id);
        try {
          if (slides.length >= 2) { record.ig = await igCarousel(slideUrls(s.id), igCaption); record.igSlides = slides.length; note("posted " + s.id + " to Instagram as a carousel of " + slides.length + " slides: " + record.ig); }
          else { record.ig = await igPost(RAW + "/social/" + s.id + "-ig.png?v=" + Date.now(), igCaption); note("posted " + s.id + " to Instagram: " + record.ig); }
          delete record.igError; sent = true;
        }
        catch (e) { record.igError = e.message; note(e.message); }
      }
      if (!sent && !prev.x && !prev.ig) { note("nothing went out for " + s.id + "; it stays pending for the next run"); continue; }
      delete record.dryRun;
    }
    ledger.posted[s.id] = record;
    writeJSON(LEDGER, ledger);
    // The story's reel goes up as an Instagram Story too, once the feed post is up and the reel is live on the site.
    if (!DRY && haveIG && record.ig && !record.igStory && !record.igStoryError && fs.existsSync(reelOf(s.id))) { storiesTried.add(s.id); await tryStory(ledger, s.id); }
  }

  // Workflow input carousel: a story that is already up goes up once more, as a carousel of its slides.
  if (CAROUSEL) {
    const slides = slidesOf(CAROUSEL), prev = ledger.posted[CAROUSEL] || {};
    const caption = (prev.title || "Legacy Mammals") + "\n\nThe whole exchange, and the link to the story, at legacymammals.com — link in bio.\n\n" + IG_TAGS;
    if (slides.length < 2) note(CAROUSEL + " fits one frame, so there is no carousel to post");
    else if (DRY) note("dry run: would post " + CAROUSEL + " as a carousel of " + slides.length + " slides");
    else if (!haveIG) note("no Instagram keys; not posting the carousel");
    else {
      try { prev.igCarousel = await igCarousel(slideUrls(CAROUSEL), caption); prev.igCarouselAt = new Date().toISOString(); prev.igSlides = slides.length; delete prev.igCarouselError; note("posted " + CAROUSEL + " to Instagram as a carousel of " + slides.length + " slides: " + prev.igCarousel); }
      catch (e) { prev.igCarouselError = e.message; note(e.message); }
      ledger.posted[CAROUSEL] = prev; writeJSON(LEDGER, ledger);
    }
  }

  // A reel that failed to go up as a Story gets another try on the next run, three tries in all.
  if (!DRY && haveIG) {
    const again = Object.keys(ledger.posted).find((id) => { const p = ledger.posted[id]; return !storiesTried.has(id) && p.ig && !p.igStory && p.igStoryError && (p.igStoryTries || 0) < 3 && fs.existsSync(reelOf(id)); });
    if (again) await tryStory(ledger, again);
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

async function takedown(id) {
  if (!/^\d{5,}$/.test(id || "")) throw new Error("takedown needs the numeric id of an X post");
  if (!haveX) throw new Error("the X keys are not set");
  await xDelete(id);
  note("took down X post " + id);
}

const mode = process.argv[2];
(mode === "render" ? render() : mode === "post" ? post() : mode === "check" ? check() : mode === "refresh" ? refresh() : mode === "story" ? story(process.argv[3]) : mode === "takedown" ? takedown(process.argv[3]) : Promise.reject(new Error("usage: publish.js render|post|check|refresh|story <id>|takedown <x post id>")))
  .catch((e) => { console.error(e.message || e); process.exit(1); });
