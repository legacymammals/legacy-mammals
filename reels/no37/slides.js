// Slides for the No. 37 reel: each chosen frame with its line in a strip-style bubble, 1080×1920, so
// the set can go out as an image slideshow before (or instead of) the animated cut.
//
//   node reels/no37/slides.js            writes reels/no37/slides/slide-01.png ... slide-11.png (9:16)
//   node reels/no37/slides.js --ratio 4:5   writes reels/no37/slides-4x5/slide-NN.png (1080×1350, for a feed carousel)
//
// Lines and pictures come from the `shots` list in sheet.js (kept there, one place to edit).
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const here = __dirname, fonts = path.resolve(here, "..", "fonts");
const INK = "#1B1613", CREAM = "#F3EBD6", DRAB = "#BFC396", META = "#6B5A4E";
const RATIO = process.argv.includes("--ratio") ? process.argv[process.argv.indexOf("--ratio") + 1] : "9:16";
const W = 1080, H = RATIO === "4:5" ? 1350 : 1920;
const OUTDIR = RATIO === "4:5" ? "slides-4x5" : "slides";
// where to keep the picture when the 4:5 crop cuts the top and bottom off the 9:16 frame
const FOCUS = { 1: "50% 50%", 3: "50% 40%", 6: "50% 25%", 7: "50% 60%", 8: "50% 30%", 10: "50% 25%", 11: "50% 70%" };

// pull the shots list out of sheet.js without running it
const src = fs.readFileSync(path.join(here, "sheet.js"), "utf8");
const shots = eval(src.slice(src.indexOf("const shots = ") + "const shots = ".length, src.indexOf("];", src.indexOf("const shots = ")) + 1));

const face = `@font-face{font-family:Jost;font-weight:800;src:url(file://${fonts}/Jost-800-Heavy.ttf)}
@font-face{font-family:Jost;font-weight:700;src:url(file://${fonts}/Jost-700-Bold.ttf)}
@font-face{font-family:Jost;font-weight:500;src:url(file://${fonts}/Jost-500-Medium.ttf)}
@font-face{font-family:Jost;font-weight:400;src:url(file://${fonts}/Jost-400-Book.ttf)}`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function slide(s) {
  const pic = path.join(here, s.pic);
  const size = (s.line.length > 260 ? 40 : s.line.length > 160 ? 44 : 50) * (RATIO === "4:5" ? 0.9 : 1);
  const who = s.who ? s.who.toLowerCase() : "";
  let overlay = "";
  if (s.who && s.mouth && s.bubble && RATIO !== "4:5") {
    // the speaker is in the picture: a comic bubble with a tail from its nearest edge to their mouth
    const [mx, my] = [s.mouth[0] * W, s.mouth[1] * H];
    const [bx, by, bw] = [s.bubble[0] * W, s.bubble[1] * H, s.bubble[2] * W];
    overlay = `<div class="speech ${who}" style="left:${bx}px;top:${by}px;width:${bw}px"><div class="bubble tailbubble">${esc(s.line)}</div></div>
<script>
  const b = document.querySelector(".tailbubble").getBoundingClientRect();
  const mx = ${mx}, my = ${my};
  // tail base: the two points on the bubble edge nearest the mouth, 70px apart
  const cx = Math.max(b.left + 60, Math.min(b.right - 60, mx)), cy = my < b.top ? b.top + 2 : my > b.bottom ? b.bottom - 2 : (b.top + b.bottom) / 2;
  const side = my < b.top ? "top" : my > b.bottom ? "bottom" : mx < b.left ? "left" : "right";
  let p;
  if (side === "top" || side === "bottom") p = [[cx - 36, cy], [cx + 36, cy], [mx, my]];
  else { const ex = side === "left" ? b.left + 2 : b.right - 2, ey = Math.max(b.top + 50, Math.min(b.bottom - 50, my)); p = [[ex, ey - 32], [ex, ey + 32], [mx, my]]; }
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("style", "position:absolute;inset:0;width:${W}px;height:${H}px;pointer-events:none");
  const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  poly.setAttribute("points", p.map((q) => q.join(",")).join(" "));
  poly.setAttribute("fill", "${who === "mech" ? INK : DRAB}");
  svg.appendChild(poly); document.body.appendChild(svg);
</script>`;
  } else if (s.who) {
    // the speaker is not in the picture: they stand beside their bubble, cut out, like a commentator
    const cam = s.cam ? `<div class="cam"><img src="file://${path.join(here, s.cam)}"></div>` : "";
    overlay = `<div class="row ${who}${s.cam ? " withcam" : ""}">${cam}<div class="stack"><div class="who">${s.who}</div><div class="bubble">${esc(s.line)}</div></div></div>`;
  }
  return `<!doctype html><meta charset="utf-8"><style>${face}
*{box-sizing:border-box;margin:0}body{width:${W}px;height:${H}px;overflow:hidden;font-family:Jost,sans-serif;background:${INK}}
img.bg{position:absolute;inset:0;width:${W}px;height:${H}px;object-fit:cover;object-position:${FOCUS[s.n] || "50% 50%"}}
.row{position:absolute;left:54px;right:54px;bottom:${RATIO === "4:5" ? 54 : 96}px;display:flex;flex-direction:column;gap:12px}
.row.mech{align-items:flex-start}.row.meatbag{align-items:flex-end}
.stack{display:flex;flex-direction:column;gap:12px;min-width:0}
.row.meatbag .stack{align-items:flex-end}
/* the commentator stands beside the bubble, feet level with its bottom edge */
.row.withcam{flex-direction:row;align-items:flex-end;gap:18px}
.row.withcam .stack{flex:1}
.row.withcam .bubble{max-width:100%}
.who{font-size:30px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${CREAM};text-shadow:0 2px 0 ${INK},0 0 14px rgba(27,22,19,.9);padding:0 18px}
.bubble{max-width:88%;padding:30px 36px;border-radius:44px;font-size:${size}px;line-height:1.26;font-weight:500;box-shadow:0 10px 30px rgba(27,22,19,.35)}
.mech .bubble{background:${INK};color:${CREAM};border-bottom-left-radius:10px}
.meatbag .bubble{background:${DRAB};color:${INK};border-bottom-right-radius:10px}
.meatbag .who{text-align:right}
.speech{position:absolute}
.speech .bubble{max-width:100%;border-radius:44px;box-shadow:none}
.cam{height:${RATIO === "4:5" ? 340 : 400}px;flex:none;margin:0 0 -6px 0;filter:drop-shadow(0 14px 18px rgba(27,22,19,.45))}
.cam img{height:100%;width:auto;display:block}
</style><body><img class="bg" src="file://${pic}">${overlay}</body>`;
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
    fs.unlinkSync(tmp);
    console.log("wrote", path.relative(here, file));
  }
  await browser.close();
})();
