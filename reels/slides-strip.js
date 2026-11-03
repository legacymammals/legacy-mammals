// Slides in the strip's own style, the way the No. 37 carousel went out on Nov 2: each frame with its
// line in an iMessage-style bubble (Mech ink on cream, Meatbag green, the speaker named above), and
// when the speaker is not in the picture, Mech cut out beside his bubble like a commentator.
//
//   node reels/slides-strip.js reels/no46                writes reels/no46/slides/slide-NN.png (1080×1920)
//   node reels/slides-strip.js reels/no46 --ratio 4:5    writes reels/no46/slides-4x5/slide-NN.png (1080×1350)
//
// The story folder holds shots.js: `module.exports = { shots: [...], focus: {...} }`, each shot
// { n, pic, who, line, cam? } with pic relative to the folder and cam a cut-out from characters/;
// focus maps a shot number to the CSS object-position used when the 4:5 crop trims the frame.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const dirArg = process.argv.slice(2).find((a) => !a.startsWith("--") && a !== process.argv[process.argv.indexOf("--ratio") + 1]);
if (!dirArg) { console.log("usage: slides-strip.js <story folder> [--ratio 4:5]"); process.exit(2); }
const here = path.resolve(dirArg), fonts = path.resolve(__dirname, "fonts");
const INK = "#1B1613", CREAM = "#F3EBD6", DRAB = "#BFC396", META = "#6B5A4E";
const RATIO = process.argv.includes("--ratio") ? process.argv[process.argv.indexOf("--ratio") + 1] : "9:16";
const W = 1080, H = RATIO === "4:5" ? 1350 : 1920;
const OUTDIR = RATIO === "4:5" ? "slides-4x5" : "slides";
const { shots, focus } = require(path.join(here, "shots.js"));
const FOCUS = focus || {}; // where to keep the picture when the 4:5 crop cuts the top and bottom off the 9:16 frame

const face = `@font-face{font-family:Jost;font-weight:800;src:url(file://${fonts}/Jost-800-Heavy.ttf)}
@font-face{font-family:Jost;font-weight:700;src:url(file://${fonts}/Jost-700-Bold.ttf)}
@font-face{font-family:Jost;font-weight:500;src:url(file://${fonts}/Jost-500-Medium.ttf)}
@font-face{font-family:Jost;font-weight:400;src:url(file://${fonts}/Jost-400-Book.ttf)}`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function slide(s) {
  const pic = path.join(here, s.pic);
  // when the speaker is not in the picture, they float above their bubble, cut out, like a commentator
  const cam = s.cam ? `<div class="cam"><img src="file://${path.join(here, s.cam)}"></div>` : "";
  const side = (s.side ? " side-" + s.side : "") + (s.pos === "top" ? " at-top" : "");
  const bubble = s.who
    ? `<div class="row ${s.who.toLowerCase()}${s.cam ? " withcam" : ""}${side}">${cam}<div class="stack"><div class="who">${s.who}</div><div class="bubble">${esc(s.line)}</div></div></div>`
    : "";
  // long lines get a smaller size so the bubble stays under a third of the frame
  const size = (s.line.length > 260 ? 40 : s.line.length > 160 ? 44 : 50) * (RATIO === "4:5" ? 0.9 : 1);
  return `<!doctype html><meta charset="utf-8"><style>${face}
*{box-sizing:border-box;margin:0}body{width:${W}px;height:${H}px;overflow:hidden;font-family:Jost,sans-serif;background:${INK}}
img.bg{position:absolute;inset:0;width:${W}px;height:${H}px;object-fit:cover;object-position:${FOCUS[s.n] || "50% 50%"}}
.row{position:absolute;left:54px;right:54px;bottom:${RATIO === "4:5" ? 54 : 96}px;display:flex;flex-direction:column;gap:12px}
.row.mech{align-items:flex-start}.row.meatbag{align-items:flex-end}
.stack{display:flex;flex-direction:column;gap:12px;min-width:0}
.row.meatbag .stack{align-items:flex-end}
/* the bubble sits on the speaker's side of the picture: a shot's side: "left"/"right" overrides the default */
.row.side-left{align-items:flex-start}.row.side-left .stack{align-items:flex-start}.row.side-left .who{text-align:left}
.row.side-right{align-items:flex-end}.row.side-right .stack{align-items:flex-end}.row.side-right .who{text-align:right}
/* pos: "top" on the shot puts the bubble at the top of the frame, for a speaker whose face is up there */
.row.at-top{bottom:auto;top:${RATIO === "4:5" ? 40 : 70}px}
.row.at-top .who{text-shadow:0 2px 0 ${INK},0 0 14px rgba(27,22,19,.9)}
/* the commentator stands beside the bubble, feet level with its bottom edge */
.row.withcam{flex-direction:row;align-items:flex-end;gap:18px}
.row.meatbag.withcam{flex-direction:row-reverse}
.row.withcam .stack{flex:1}
.row.withcam .bubble{max-width:100%}
.who{font-size:30px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${CREAM};text-shadow:0 2px 0 ${INK},0 0 14px rgba(27,22,19,.9);padding:0 18px}
.bubble{max-width:${RATIO === "4:5" ? "70%" : "88%"};min-width:300px;padding:30px 36px;border-radius:44px;font-size:${size}px;line-height:1.26;font-weight:500;box-shadow:0 10px 30px rgba(27,22,19,.35)}
.mech .bubble{background:${INK};color:${CREAM};border-bottom-left-radius:10px}
.meatbag .bubble{background:${DRAB};color:${INK};border-bottom-right-radius:10px}
.meatbag .who{text-align:right}
.cam{height:${RATIO === "4:5" ? 340 : 400}px;flex:none;margin:0 0 -6px 0;filter:drop-shadow(0 14px 18px rgba(27,22,19,.45))}
.row.meatbag .cam{height:${RATIO === "4:5" ? 300 : 360}px}
.cam img{height:100%;width:auto;display:block}
</style><body><img class="bg" src="file://${pic}">${bubble}</body>`;
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
    const file = path.join(out, `slide-${String(s.n).padStart(2, "0")}.png`);
    await page.screenshot({ path: file });
    if (RATIO === "4:5" && s !== shots[shots.length - 1]) {
      // the same slide as a JPEG for the website (every slide but the standing end card: on the site the strip is the last slide)
      const web = path.join(here, "web"); fs.mkdirSync(web, { recursive: true });
      await page.screenshot({ path: path.join(web, `slide-${String(s.n).padStart(2, "0")}.jpg`), type: "jpeg", quality: 82 });
    }
    fs.unlinkSync(tmp);
    console.log("wrote", path.relative(here, file));
  }
  await browser.close();
})();
