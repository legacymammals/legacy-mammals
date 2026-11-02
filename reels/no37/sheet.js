// Storyboard sheet for the No. 37 reel: each frame with its timing and the line spoken under it.
//
//   node reels/no37/sheet.js [out.png]        default: reels/no37/storyboard.png
//
// Edit the `shots` list below when a frame or a line changes; the picture paths point at the chosen takes.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const here = __dirname, fonts = path.resolve(here, "..", "fonts");
const INK = "#1B1613", BEIGE = "#E8DEC6", META = "#6B5A4E", OLIVE = "#5E7A3A";

const shots = [
  { n: 1, t: "0–4 s", title: "Title: the sign", pic: "final/01-title.png", who: "", line: "(no voice; the headline on her sign; crowd murmur)" },
  { n: 2, t: "4–7 s", title: "The classroom, wide", pic: "final/02-classroom.jpg", who: "", line: "(no voice; a clock ticks, chalk dust)" },
  { cam: "../../characters/mech/cutout/01-deadpan.png", n: 3, t: "7–20 s", title: "Cutaway: the letter and the nameless printer", pic: "final/03-letter.jpg", who: "Mech", line: "There is now an Association for Human Mathematics. Its first act was a letter asking mathematicians to stop working with OpenAI, because 721 papers in a month is “not a demonstration of scholarship, but a demonstration of power.” OpenAI says it defers to the mathematicians on credit." },
  { mouth: [0.265, 0.455], bubble: [0.36, 0.06, 0.58], n: 4, t: "20–31 s", title: "Two-shot, Meatbag to Mech", pic: "final/04-twoshot.jpg", who: "Meatbag", line: "Good for them. They spent twenty years learning to do a thing, and the thing got done in an afternoon by something with no name. I'd still want my kid to do math. It's the best thing we ever made with our heads." },
  { cam: "../../characters/mech/cutout/12-content.png", n: 5, t: "31–38 s", title: "Cutaway: the abbot and the press, 1492", pic: "final/05-abbot.jpg", who: "Mech", line: "Then she'll be in good company. In 1492 an abbot wrote a book on why monks must keep copying by hand, and had it printed so more people would read it." },
  { cam: "../../characters/mech/cutout/04-smug.png", n: 6, t: "38–42 s", title: "Cutaway: the red flag, London 1865", pic: "final/06-london.jpg", who: "Mech", line: "In 1865 Britain made every car follow a man on foot with a red flag." },
  { cam: "../../characters/mech/cutout/05-side-eye.png", n: 7, t: "42–49 s", title: "Cutaway: the jukebox, 1942", pic: "final/07-jukebox.jpg", who: "Mech", line: "In 1942 every musician in America refused to make a record for two years because jukeboxes were taking their work; the public backed the jukeboxes three to one." },
  { mouth: [0.47, 0.44], bubble: [0.05, 0.60, 0.62], n: 8, t: "49–57 s", title: "Mech at the board: MINUTES", pic: "final/08-minutes.jpg", who: "Mech", line: "All of them right about the loss, all of them wrong about the remedy. A boycott is what you call it when you've lost the race and would like it minuted." },
  { mouth: [0.44, 0.535], bubble: [0.04, 0.05, 0.46], n: 9, t: "57–60 s", title: "Close on Meatbag", pic: "final/09-meatbag.jpg", who: "Meatbag", line: "They just want to keep their jobs." },
  { cam: "../../characters/mech/cutout/04-smug.png", n: 10, t: "60–65 s", title: "The flag man, proud", pic: "final/10-flagman.jpg", who: "Mech", line: "So did the man with the red flag. He was very good at it." },
  { n: 11, t: "65–70 s", title: "End card (every reel)", pic: "final/11-end.png", who: "", line: "(no voice; birds, a leaf falls; hold on the stone)" },
];

const face = `@font-face{font-family:Jost;font-weight:800;src:url(file://${fonts}/Jost-800-Heavy.ttf)}
@font-face{font-family:Jost;font-weight:700;src:url(file://${fonts}/Jost-700-Bold.ttf)}
@font-face{font-family:Jost;font-weight:500;src:url(file://${fonts}/Jost-500-Medium.ttf)}
@font-face{font-family:Jost;font-weight:500;font-style:italic;src:url(file://${fonts}/Jost-500-MediumItalic.ttf)}
@font-face{font-family:Jost;font-weight:400;src:url(file://${fonts}/Jost-400-Book.ttf)}`;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const cell = (s) => {
  const p = path.join(here, s.pic);
  const img = fs.existsSync(p) ? `<img src="file://${p}">` : `<div class="missing">missing: ${esc(s.pic)}</div>`;
  const speech = s.who ? `<p class="line"><b class="${s.who.toLowerCase()}">${s.who}:</b> ${esc(s.line)}</p>` : `<p class="line note">${esc(s.line)}</p>`;
  return `<div class="cell">${img}<div class="lab"><span class="n">${s.n}</span><span class="t">${esc(s.t)}</span><span class="title">${esc(s.title)}</span></div>${speech}</div>`;
};

const html = `<!doctype html><meta charset="utf-8"><style>${face}
*{box-sizing:border-box;margin:0}body{background:#fff;font-family:Jost,sans-serif;color:${INK}}
.sheet{display:grid;grid-template-columns:repeat(4,400px);gap:30px;padding:30px;width:max-content;background:#fff}
h1{grid-column:1/-1;font-size:34px;font-weight:800;margin-bottom:-6px}h1 small{font-weight:500;color:${META};font-size:22px;margin-left:14px}
.cell{display:flex;flex-direction:column;gap:10px}
.cell img{width:400px;height:711px;object-fit:cover;border:3px solid ${INK};display:block}
.missing{width:400px;height:711px;border:3px dashed ${META};display:flex;align-items:center;justify-content:center;color:${META};font-size:18px}
.lab{display:flex;gap:10px;align-items:baseline;font-size:19px;font-weight:700}
.n{background:${INK};color:${BEIGE};border-radius:6px;padding:1px 9px;font-size:18px}.t{color:${META};font-weight:500;white-space:nowrap}
.line{font-size:19px;line-height:1.3;font-weight:400}.line b{font-weight:800}.line b.mech{color:${INK}}.line b.meatbag{color:${OLIVE}}
.note{font-style:italic;color:${META}}
</style><body><div class="sheet" id="sheet"><h1>No. 37 — the reel, with the lines <small>eleven shots · about 70 s · 9:16</small></h1>${shots.map(cell).join("")}</div></body>`;

(async () => {
  const out = process.argv[2] || path.join(here, "storyboard.png");
  const tmp = path.join(here, "storyboard.tmp.html");
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1800, height: 1200 }, deviceScaleFactor: 1 });
  await page.goto("file://" + tmp, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#sheet").screenshot({ path: out });
  await browser.close();
  fs.unlinkSync(tmp);
  console.log("wrote", out);
})();
