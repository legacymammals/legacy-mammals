// Slides for the No. 37 reel: each chosen frame with its line in a comic speech balloon, so the set
// can go out as an image slideshow (9:16) or a feed carousel (4:5) before the animated cut.
//
//   node reels/no37/slides.js               writes reels/no37/slides/slide-01.png ... slide-11.png (1080×1920)
//   node reels/no37/slides.js --ratio 4:5   writes reels/no37/slides-4x5/slide-NN.png (1080×1350)
//
// Lines and pictures come from the `shots` list in sheet.js (one place to edit). A shot says where the
// speaker's mouth is (`mouth: [x, y]`, fractions of the 9:16 frame) and where the balloon sits
// (`bubble: [x, y, width]`) when the speaker is in the picture; when they are not, `cam:` names a
// cut-out from the expression sheet and they stand beside their balloon.
//
// The balloons are drawn like a printed comic: white, a thick ink outline the weight of the art's own
// lines, hand-lettered capitals, and a tail that reaches the mouth. Meatbag speaks in an oval with a
// curved tail; Mech, being a machine, in a squared-off balloon with a straight tail.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const here = __dirname, fonts = path.resolve(here, "..", "fonts");
const INK = "#1B1613", PAPER = "#FFFDFA";
const RATIO = process.argv.includes("--ratio") ? process.argv[process.argv.indexOf("--ratio") + 1] : "9:16";
const W = 1080, H = RATIO === "4:5" ? 1350 : 1920;
const OUTDIR = RATIO === "4:5" ? "slides-4x5" : "slides";
// where to keep the picture when the 4:5 crop cuts the top and bottom off the 9:16 frame (fraction of the overflow taken from the top)
const FOCUS = { 1: 0.5, 3: 0.4, 4: 0.5, 6: 0.25, 7: 0.6, 8: 0.3, 9: 0.5, 10: 0.25, 11: 0.7 };
const shift = (n) => (RATIO === "4:5" ? (1920 - 1350) * (FOCUS[n] == null ? 0.5 : FOCUS[n]) : 0); // pixels of the 9:16 frame cut off the top

// pull the shots list out of sheet.js without running it
const src = fs.readFileSync(path.join(here, "sheet.js"), "utf8");
const shots = eval(src.slice(src.indexOf("const shots = ") + "const shots = ".length, src.indexOf("];", src.indexOf("const shots = ")) + 1));

const face = `@font-face{font-family:Comic;font-weight:700;src:url(file://${fonts}/ComicNeue-Bold.ttf)}
@font-face{font-family:Comic;font-weight:700;font-style:italic;src:url(file://${fonts}/ComicNeue-BoldItalic.ttf)}`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function slide(s) {
  const pic = path.join(here, s.pic);
  const who = s.who ? s.who.toLowerCase() : "";
  const size = Math.round((s.line.length > 260 ? 34 : s.line.length > 160 ? 38 : s.line.length > 80 ? 42 : 46) * (RATIO === "4:5" ? 0.92 : 1));
  const dy = shift(s.n);
  let body = "", script = "";
  if (s.who && s.mouth && s.bubble) {
    // the speaker is in the picture
    const mx = s.mouth[0] * W, my = s.mouth[1] * 1920 - dy;
    // keep the balloon (which reaches beyond its text box) inside the frame after the 4:5 crop
    const bx = Math.max(70, s.bubble[0] * W), by = Math.max(RATIO === "4:5" ? 120 : 60, s.bubble[1] * 1920 - dy), bw = s.bubble[2] * W;
    body = `<div class="txt ${who}" id="txt" style="left:${bx}px;top:${by}px;width:${bw}px">${esc(s.line)}</div>`;
    script = `balloon(document.getElementById("txt"), ${mx}, ${my}, "${who}");`;
  } else if (s.who) {
    // the speaker is not in the picture: they stand at the bottom, cut out, and speak from there
    const camH = Math.round((RATIO === "4:5" ? 330 : 400));
    const cam = s.cam ? `<img class="cam" id="cam" src="file://${path.join(here, s.cam)}" style="height:${camH}px;left:40px;bottom:70px">` : "";
    const bw = W - 40 - 300 - 90 - 50;
    body = `${cam}<div class="txt ${who}" id="txt" style="right:50px;bottom:${camH + 40}px;width:${bw}px">${esc(s.line)}</div>`;
    // the cut-out's mouth sits about a third of the way down the picture, in the middle
    script = `const c = document.getElementById("cam").getBoundingClientRect(); balloon(document.getElementById("txt"), c.left + c.width * 0.52, c.top + c.height * 0.30, "${who}");`;
  }
  return `<!doctype html><meta charset="utf-8"><style>${face}
*{box-sizing:border-box;margin:0}body{width:${W}px;height:${H}px;overflow:hidden;font-family:Comic,sans-serif;background:${INK};position:relative}
img.bg{position:absolute;left:0;top:${-dy}px;width:1080px;height:1920px}
svg.balloons{position:absolute;inset:0;width:${W}px;height:${H}px;pointer-events:none}
.txt{position:absolute;z-index:2;font-size:${size}px;line-height:1.14;font-weight:700;text-transform:uppercase;text-align:center;color:${INK};letter-spacing:.01em;padding:0 22px}
.cam{position:absolute;z-index:3;width:auto;filter:drop-shadow(0 12px 14px rgba(27,22,19,.45))}
</style><body><img class="bg" src="file://${pic}"><svg class="balloons" id="svg"></svg>${body}
<script>
const NS = "http://www.w3.org/2000/svg", svg = document.getElementById("svg");
const el = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); svg.appendChild(e); return e; };
function balloon(txt, mx, my, who) {
  const r = txt.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  // the tail stops a little short of the mouth, as a letterer would leave it
  { const dx = mx - cx, dy = my - cy, len = Math.hypot(dx, dy) || 1, back = Math.min(70, len * 0.12); mx -= dx / len * back; my -= dy / len * back; }
  const stroke = 7, pad = 26;
  if (who === "meatbag") {
    // an oval around the text block, big enough that the text's corners sit inside it
    const rx = r.width / 2 * 1.16 + pad, ry = r.height / 2 * 1.30 + pad;
    el("ellipse", { cx, cy, rx, ry, fill: "${PAPER}", stroke: "${INK}", "stroke-width": stroke });
    // a curved tail: two points on the rim toward the mouth, bowed out to the tip
    const a = Math.atan2((my - cy) / ry, (mx - cx) / rx), d = 0.16;
    const p = (t) => [cx + rx * Math.cos(t), cy + ry * Math.sin(t)];
    const [b1, b2] = [p(a - d), p(a + d)], midx = (b1[0] + b2[0]) / 2, midy = (b1[1] + b2[1]) / 2;
    const vx = mx - midx, vy = my - midy, nx = -vy, ny = vx, k = 0.22;
    const c1 = [midx + vx * 0.45 + nx * k, midy + vy * 0.45 + ny * k], c2 = [midx + vx * 0.45 + nx * k * 0.35, midy + vy * 0.45 + ny * k * 0.35];
    el("path", { d: "M" + b1.join(",") + " Q" + c1.join(",") + " " + mx + "," + my + " Q" + c2.join(",") + " " + b2.join(",") + " Z", fill: "${PAPER}", stroke: "${INK}", "stroke-width": stroke, "stroke-linejoin": "round" });
    el("ellipse", { cx, cy, rx: rx - stroke / 2, ry: ry - stroke / 2, fill: "${PAPER}" });
  } else {
    // Mech: a squared balloon with soft corners and a straight, pointed tail
    const x = r.left - pad, y = r.top - pad * 0.8, w = r.width + pad * 2, h = r.height + pad * 1.6, rad = 26;
    el("rect", { x, y, width: w, height: h, rx: rad, fill: "${PAPER}", stroke: "${INK}", "stroke-width": stroke });
    // tail from the nearest side
    const left = x, right = x + w, top = y, bottom = y + h;
    let b1, b2;
    if (my > bottom) { const tx = Math.max(left + 70, Math.min(right - 70, mx)); b1 = [tx - 34, bottom]; b2 = [tx + 34, bottom]; }
    else if (my < top) { const tx = Math.max(left + 70, Math.min(right - 70, mx)); b1 = [tx - 34, top]; b2 = [tx + 34, top]; }
    else if (mx < left) { const ty = Math.max(top + 60, Math.min(bottom - 60, my)); b1 = [left, ty - 30]; b2 = [left, ty + 30]; }
    else { const ty = Math.max(top + 60, Math.min(bottom - 60, my)); b1 = [right, ty - 30]; b2 = [right, ty + 30]; }
    el("polygon", { points: b1.join(",") + " " + mx + "," + my + " " + b2.join(","), fill: "${PAPER}", stroke: "${INK}", "stroke-width": stroke, "stroke-linejoin": "round" });
    el("rect", { x: x + stroke / 2, y: y + stroke / 2, width: w - stroke, height: h - stroke, rx: rad - 3, fill: "${PAPER}" });
  }
}
${script}
</script></body>`;
}

(async () => {
  const out = path.join(here, OUTDIR); fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  for (const s of shots) {
    const tmp = path.join(out, `slide-${String(s.n).padStart(2, "0")}.tmp.html`);
    fs.writeFileSync(tmp, slide(s));
    await page.goto("file://" + tmp, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(50);
    const file = path.join(out, `slide-${String(s.n).padStart(2, "0")}.png`);
    await page.screenshot({ path: file });
    fs.unlinkSync(tmp);
    console.log("wrote", path.relative(here, file));
  }
  await browser.close();
})();
