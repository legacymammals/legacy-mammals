// The standing end card: the drawn cemetery scene with the shrugging headstone, and the site's name
// engraved into the blank lower half of the stone.
//
//   node reels/no37/endcard.js <scene.jpeg> <out.png> [--variant url|name] [--top 0.655] [--bottom 0.79] [--left 0.16] [--right 0.84]
//
// The fractions are where the blank face of the stone sits in the picture (top/bottom/left/right as
// fractions of the frame); the text block is fitted inside that box.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const here = __dirname, fonts = path.resolve(here, "..", "fonts");
const a = process.argv.slice(2), pos = [], opt = { variant: "url", top: 0.655, bottom: 0.79, left: 0.16, right: 0.84 };
for (let i = 0; i < a.length; i++) {
  if (a[i].startsWith("--")) opt[a[i].slice(2)] = isNaN(a[i + 1]) ? a[++i] : parseFloat(a[++i]);
  else pos.push(a[i]);
}
const [scene, out] = pos;
if (!scene || !out) { console.log("usage: endcard.js <scene> <out.png> [--variant url|name] [--top f] [--bottom f] [--left f] [--right f]"); process.exit(2); }

const W = 1080, H = 1920;
const box = { x: Math.round(W * opt.left), y: Math.round(H * opt.top), w: Math.round(W * (opt.right - opt.left)), h: Math.round(H * (opt.bottom - opt.top)) };

const face = `@font-face{font-family:Jost;font-weight:800;src:url(file://${fonts}/Jost-800-Heavy.ttf)}
@font-face{font-family:Jost;font-weight:700;src:url(file://${fonts}/Jost-700-Bold.ttf)}
@font-face{font-family:Jost;font-weight:500;src:url(file://${fonts}/Jost-500-Medium.ttf)}
@font-face{font-family:Cinzel;font-weight:900;src:url(file://${fonts}/Cinzel-Black.ttf)}
@font-face{font-family:Cinzel;font-weight:700;src:url(file://${fonts}/Cinzel-Bold.ttf)}`;

// engraved: letters a shade darker than the stone, a light bevel below-right, a dark cut above-left
const cut = `color:#2b2d33;text-shadow:-1px -1px 0 #1a1b1f, 3px 3px 0 #c3c6cc, 1px 1px 0 #9ea1a8, 0 0 10px rgba(0,0,0,.35)`;
const lines = opt.variant === "name"
  ? `<div class="small">A DAILY OBITUARY FROM THE</div><div class="huge">LEGACY</div><div class="huge">MAMMALS</div><div class="tiny">legacymammals.com &nbsp;·&nbsp; @legacymammals</div>`
  : `<div class="small">A DAILY OBITUARY FROM THE</div><div class="big">LEGACYMAMMALS.COM</div><div class="mid">@legacymammals</div>`;

const html = `<!doctype html><meta charset="utf-8"><style>${face}
*{box-sizing:border-box;margin:0}body{width:${W}px;height:${H}px;overflow:hidden;font-family:Jost,sans-serif;background:#000}
img.bg{position:absolute;inset:0;width:${W}px;height:${H}px;object-fit:cover}
.box{position:absolute;left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:0;transform:perspective(1400px) rotateX(2deg)}
.small{font-family:Cinzel;font-size:${Math.round(box.w * 0.056)}px;font-weight:700;letter-spacing:.1em;${cut};margin-bottom:${Math.round(box.h * 0.05)}px}
.big{font-family:Cinzel;font-size:${Math.round(box.w * 0.108)}px;line-height:1;font-weight:900;letter-spacing:0;${cut}}
.mid{font-family:Cinzel;font-size:${Math.round(box.w * 0.075)}px;font-weight:700;letter-spacing:.02em;${cut};margin-top:${Math.round(box.h * 0.07)}px}
.huge{font-family:Cinzel;font-size:${Math.round(box.w * 0.168)}px;line-height:1;font-weight:900;letter-spacing:.02em;${cut}}
.tiny{font-family:Cinzel;font-size:${Math.round(box.w * 0.062)}px;font-weight:700;letter-spacing:.01em;${cut};margin-top:${Math.round(box.h * 0.07)}px}
</style><body><img class="bg" src="file://${path.resolve(scene)}"><div class="box">${lines}</div></body>`;

(async () => {
  const tmp = out.replace(/\.png$/, "") + ".tmp.html";
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto("file://" + path.resolve(tmp), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out });
  await browser.close();
  fs.unlinkSync(tmp);
  console.log("wrote", out);
})();
