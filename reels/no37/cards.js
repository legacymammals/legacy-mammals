// The two frames of the No. 37 reel that carry type: the title card and the end card.
// The generator mangles letters, so these are set in code over flat colour (title) and over the
// chosen empty-room frame (end card), in the site's face (Jost) and the strip's colours.
//
//   node reels/no37/cards.js            writes reels/no37/card-01-title.png and card-11-end.png (1080×1920)
//
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const here = __dirname, fonts = path.resolve(here, "..", "fonts");
const INK = "#1B1613", BEIGE = "#E8DEC6", META = "#6B5A4E", OLIVE = "#5E7A3A", CREAM = "#F3EBD6", BROWN = "#5C3E2A";
const ROOM = path.join(here, "frame-11-cemetery-2.jpeg"); // the standing end card: the cemetery, the two of them in the back
const MARK = path.resolve(here, "..", "..", "img", "mark.png"); // the shrugging headstone

const face = `@font-face{font-family:Jost;font-weight:800;src:url(file://${fonts}/Jost-800-Heavy.ttf)}
@font-face{font-family:Jost;font-weight:700;src:url(file://${fonts}/Jost-700-Bold.ttf)}
@font-face{font-family:Jost;font-weight:500;src:url(file://${fonts}/Jost-500-Medium.ttf)}
@font-face{font-family:Jost;font-weight:500;font-style:italic;src:url(file://${fonts}/Jost-500-MediumItalic.ttf)}
@font-face{font-family:Jost;font-weight:400;src:url(file://${fonts}/Jost-400-Book.ttf)}
*{box-sizing:border-box;margin:0}body{width:1080px;height:1920px;overflow:hidden;font-family:Jost,sans-serif;color:${INK}}`;

// the site's mark: the shrugging headstone
const stone = (s = 1) => `<img class="mark" src="file://${MARK}" style="width:${Math.round(300 * s)}px;height:auto">`;

const title = `<!doctype html><meta charset="utf-8"><style>${face}
body{background:${BEIGE};padding:70px 64px;display:flex;flex-direction:column}
.frame{position:absolute;inset:28px;border:5px solid ${INK};pointer-events:none}
.meta{display:flex;justify-content:space-between;font-size:38px;font-weight:700;color:${META};letter-spacing:.04em}
h1{font-weight:800;font-size:140px;line-height:.94;letter-spacing:-.015em;margin-top:150px;text-wrap:balance}
h2{font-weight:700;font-size:54px;line-height:1.18;color:${OLIVE};margin-top:70px;text-wrap:balance}
.foot{margin-top:auto;display:flex;flex-direction:column;align-items:center;gap:18px;font-size:34px;font-weight:500;color:${META}}
</style><body><div class="frame"></div>
<div class="meta"><span>No. 37</span><span>OCT 29, 2026</span></div>
<h1>Human mathematicians can't keep up, so they're boycotting.</h1>
<h2>A new “Association for Human Mathematics” tells colleagues to stop working with OpenAI.</h2>
<div class="foot">${stone(1.1)}<span>legacymammals.com</span></div></body>`;

const end = `<!doctype html><meta charset="utf-8"><style>${face}
body{background:${INK}}
img.bg{position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover}
.stone{position:absolute;left:50%;bottom:345px;transform:translateX(-50%);width:960px;height:auto}
.text{position:absolute;left:0;right:0;bottom:70px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}
.line{font-size:44px;font-weight:500;font-style:italic;color:${CREAM};text-shadow:0 2px 0 ${INK},0 0 18px rgba(27,22,19,.9)}
.site{font-size:84px;font-weight:800;letter-spacing:-.01em;color:${CREAM};text-shadow:0 3px 0 ${INK},0 0 22px rgba(27,22,19,.9)}
.at{font-size:48px;font-weight:500;color:${CREAM};text-shadow:0 2px 0 ${INK},0 0 18px rgba(27,22,19,.9)}
</style><body><img class="bg" src="file://${ROOM}"><img class="stone" src="file://${MARK}">
<div class="text"><div class="line">A daily obituary from the</div><div class="site">legacymammals.com</div><div class="at">@legacymammals</div></div></body>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const [name, html] of [["card-01-title.png", title], ["card-11-end.png", end]]) {
    const tmp = path.join(here, name.replace(/\.png$/, ".html"));
    fs.writeFileSync(tmp, html);
    await page.goto("file://" + tmp, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    fs.unlinkSync(tmp);
    await page.screenshot({ path: path.join(here, name) });
    console.log("wrote", name);
  }
  await browser.close();
})();
