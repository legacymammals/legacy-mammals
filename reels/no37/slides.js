// Slides for the No. 37 reel: each chosen frame with its line in a strip-style bubble, 1080×1920, so
// the set can go out as an image slideshow before (or instead of) the animated cut.
//
//   node reels/no37/slides.js            writes reels/no37/slides/slide-01.png ... slide-11.png
//
// Lines and pictures come from the `shots` list in sheet.js (kept there, one place to edit).
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const here = __dirname, fonts = path.resolve(here, "..", "fonts");
const INK = "#1B1613", CREAM = "#F3EBD6", DRAB = "#BFC396", META = "#6B5A4E";
const W = 1080, H = 1920;

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
  // when the speaker is not in the picture, they float above their bubble, cut out, like a commentator
  const cam = s.cam ? `<div class="cam"><img src="file://${path.join(here, s.cam)}"></div>` : "";
  const bubble = s.who
    ? `<div class="row ${s.who.toLowerCase()}">${cam}<div class="who">${s.who}</div><div class="bubble">${esc(s.line)}</div></div>`
    : "";
  // long lines get a smaller size so the bubble stays under a third of the frame
  const size = s.line.length > 260 ? 40 : s.line.length > 160 ? 44 : 50;
  return `<!doctype html><meta charset="utf-8"><style>${face}
*{box-sizing:border-box;margin:0}body{width:${W}px;height:${H}px;overflow:hidden;font-family:Jost,sans-serif;background:${INK}}
img.bg{position:absolute;inset:0;width:${W}px;height:${H}px;object-fit:cover}
.row{position:absolute;left:54px;right:54px;bottom:96px;display:flex;flex-direction:column;gap:12px}
.row.mech{align-items:flex-start}.row.meatbag{align-items:flex-end}
.who{font-size:30px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${CREAM};text-shadow:0 2px 0 ${INK},0 0 14px rgba(27,22,19,.9);padding:0 18px}
.bubble{max-width:88%;padding:30px 36px;border-radius:44px;font-size:${size}px;line-height:1.26;font-weight:500;box-shadow:0 10px 30px rgba(27,22,19,.35)}
.mech .bubble{background:${INK};color:${CREAM};border-bottom-left-radius:10px}
.meatbag .bubble{background:${DRAB};color:${INK};border-bottom-right-radius:10px}
.meatbag .who{text-align:right}
.cam{height:420px;margin:0 0 -8px 14px;filter:drop-shadow(0 14px 18px rgba(27,22,19,.45))}
.cam img{height:100%;width:auto;display:block}
</style><body><img class="bg" src="file://${pic}">${bubble}</body>`;
}

(async () => {
  const out = path.join(here, "slides"); fs.mkdirSync(out, { recursive: true });
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
