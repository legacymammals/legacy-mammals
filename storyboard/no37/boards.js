// Storyboard boards for No. 37 — eleven 9:16 frames drawn as SVG, screenshotted into two contact sheets.
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");

const TINT = "#F3EEE3", INK = "#1B1613", DRAB = "#BFC396", CREAM = "#F3EBD6", BEIGE = "#E8DEC6", AMBER = "#E89B1F",
  BROWN = "#5C3E2A", META = "#6B5A4E", BOARD = "#2F3D35", CHALK = "#F3EEE3", RED = "#B23A2E", GREY = "#8E8A80", WHITE = "#FFFFFF";
const W = 540, H = 960;
const FONT = "font-family='Jost, DejaVu Sans, Helvetica, Arial, sans-serif'";

// ---- helpers -------------------------------------------------------------------------------
function wrap(text, max) { // crude word wrap by character count
  const words = text.split(" "), lines = []; let cur = "";
  for (const w of words) { if ((cur + " " + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += " " + w; }
  if (cur.trim()) lines.push(cur.trim()); return lines;
}
function bubble(x, y, text, who, opts = {}) {
  const size = opts.size || 17, max = opts.max || 40, lines = wrap(text, max), lh = size * 1.3;
  const w = opts.w || Math.min(W - 40, Math.max(...lines.map((l) => l.length)) * size * 0.52 + 34), h = lines.length * lh + 26;
  const fill = who === "M" ? INK : DRAB, color = who === "M" ? CREAM : INK;
  const bx = opts.right ? x - w : x;
  const tail = who === "M" ? `<path d="M${bx + 18},${y + h} q-10,2 -18,10 q4,-8 4,-18z" fill="${fill}"/>` : `<path d="M${bx + w - 18},${y + h} q10,2 18,10 q-4,-8 -4,-18z" fill="${fill}"/>`;
  return `<rect x="${bx}" y="${y}" width="${w}" height="${h}" rx="18" fill="${fill}"/>${tail}` +
    lines.map((l, i) => `<text x="${bx + 17}" y="${y + 18 + size + i * lh - 3}" font-size="${size}" fill="${color}" ${FONT}>${esc(l)}</text>`).join("");
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
function mech(x, y, s = 1, opts = {}) {
  const look = opts.look || 0; // eyes shift
  return `<g transform="translate(${x},${y}) scale(${s})">
    <line x1="0" y1="-46" x2="0" y2="-62" stroke="${INK}" stroke-width="5"/><circle cx="0" cy="-66" r="6" fill="${AMBER}"/>
    <rect x="-42" y="-46" width="84" height="74" rx="16" fill="${INK}"/>
    ${opts.back ? `<rect x="-30" y="-30" width="60" height="40" rx="6" fill="none" stroke="${META}" stroke-width="2"/>` : `<rect x="${-30 + look}" y="-26" width="22" height="16" rx="5" fill="${CREAM}"/><rect x="${8 + look}" y="-26" width="22" height="16" rx="5" fill="${CREAM}"/>
    <rect x="-24" y="2" width="48" height="12" rx="4" fill="${CREAM}"/><line x1="-12" y1="2" x2="-12" y2="14" stroke="${INK}" stroke-width="3"/><line x1="0" y1="2" x2="0" y2="14" stroke="${INK}" stroke-width="3"/><line x1="12" y1="2" x2="12" y2="14" stroke="${INK}" stroke-width="3"/>`}
    <rect x="-36" y="32" width="72" height="90" rx="18" fill="${INK}"/>
    <rect x="-64" y="40" width="26" height="70" rx="12" fill="${INK}" transform="rotate(${opts.armL || 0} -51 40)"/>
    <rect x="38" y="40" width="26" height="70" rx="12" fill="${INK}" transform="rotate(${opts.armR || 0} 51 40)"/>
    ${opts.legs !== false ? `<rect x="-30" y="118" width="24" height="60" rx="10" fill="${INK}"/><rect x="6" y="118" width="24" height="60" rx="10" fill="${INK}"/>` : ""}
  </g>`;
}
function meat(x, y, s = 1, opts = {}) {
  const look = opts.look || 0;
  return `<g transform="translate(${x},${y}) scale(${s})">
    <rect x="-34" y="34" width="68" height="90" rx="20" fill="${BROWN}"/>
    <path d="M-34,50 q34,-30 68,0" fill="none" stroke="${INK}" stroke-width="4"/>
    <rect x="-60" y="42" width="24" height="66" rx="12" fill="${BROWN}" transform="rotate(${opts.armL || 0} -48 42)"/>
    <rect x="36" y="42" width="24" height="66" rx="12" fill="${BROWN}" transform="rotate(${opts.armR || 0} 48 42)"/>
    ${opts.legs !== false ? `<rect x="-28" y="120" width="22" height="58" rx="10" fill="${INK}"/><rect x="6" y="120" width="22" height="58" rx="10" fill="${INK}"/>` : ""}
    <circle cx="0" cy="0" r="34" fill="${DRAB}" stroke="${INK}" stroke-width="4"/>
    <path d="M-34,-6 q10,-40 50,-26 q-2,-10 -16,-12 q-30,-6 -34,38z" fill="${INK}"/>
    <circle cx="${-11 + look}" cy="2" r="3.5" fill="${INK}"/><circle cx="${11 + look}" cy="2" r="3.5" fill="${INK}"/>
    <path d="M-9,16 q9,${opts.mouth || 6} 18,0" fill="none" stroke="${INK}" stroke-width="3"/>
  </g>`;
}
function desk(x, y, w = 150) {
  return `<rect x="${x}" y="${y}" width="${w}" height="16" rx="4" fill="${BEIGE}" stroke="${BROWN}" stroke-width="3"/>
    <rect x="${x + 12}" y="${y + 16}" width="10" height="110" fill="${BROWN}"/><rect x="${x + w - 22}" y="${y + 16}" width="10" height="110" fill="${BROWN}"/>`;
}
function chalkboard(x, y, w, h, extra = "", clean = false) {
  return `<rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="6" fill="${BEIGE}" stroke="${BROWN}" stroke-width="3"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${BOARD}"/>
    ${clean ? "" : `<g stroke="${CHALK}" stroke-width="2" fill="none" opacity="0.8">
      <path d="M${x + 20},${y + 30} h120 M${x + 160},${y + 30} h60 M${x + 20},${y + 60} h80 q10,-14 20,0 h90 M${x + 20},${y + 90} h200 M${x + 240},${y + 60} h80 M${x + 20},${y + 120} h60 M${x + 100},${y + 120} h140"/>
      <path d="M${x + 250},${y + 100} q20,20 40,0 q20,-20 40,0"/>
      <text x="${x + 30}" y="${y + 160}" font-size="18" fill="${CHALK}" stroke="none" ${FONT} opacity="0.9">∫ f(x) dx = ∑ aₙ   ∀ε&gt;0   lim → ∞</text>
    </g>`}${extra}`;
}
function clock(x, y) { return `<circle cx="${x}" cy="${y}" r="22" fill="${WHITE}" stroke="${INK}" stroke-width="3"/><line x1="${x}" y1="${y}" x2="${x}" y2="${y - 14}" stroke="${INK}" stroke-width="3"/><line x1="${x}" y1="${y}" x2="${x + 10}" y2="${y + 6}" stroke="${INK}" stroke-width="3"/>`; }
function caption(text) { const ls = wrap(text, 58); return ls.map((l, i) => `<text x="${W / 2}" y="${H - 14 - (ls.length - 1 - i) * 19}" text-anchor="middle" font-size="14" fill="${META}" font-style="italic" ${FONT}>${esc(l)}</text>`).join(""); }
function stone(x, y, s = 1) { // the site's mark: a little headstone with a face
  return `<g transform="translate(${x},${y}) scale(${s})">
    <ellipse cx="0" cy="40" rx="46" ry="10" fill="${BROWN}"/><path d="M-28,40 v-46 a28,28 0 0 1 56,0 v46z" fill="${CREAM}" stroke="${INK}" stroke-width="3"/>
    <circle cx="-9" cy="-4" r="2.5" fill="${INK}"/><circle cx="9" cy="-4" r="2.5" fill="${INK}"/><path d="M-10,8 q10,8 20,0" fill="none" stroke="${INK}" stroke-width="2.5"/></g>`;
}
function classroom(extraBoard = "") {
  return `<rect width="${W}" height="${H}" fill="${TINT}"/>
    <rect x="0" y="640" width="${W}" height="${H - 640}" fill="${BEIGE}"/>
    ${chalkboard(50, 130, 440, 250, extraBoard)}${clock(500, 70)}
    <rect x="20" y="400" width="500" height="6" fill="${BROWN}"/>`;
}
const circled721 = `<g stroke="${CHALK}" fill="none" stroke-width="3"><ellipse cx="400" cy="300" rx="52" ry="30"/></g><text x="400" y="310" text-anchor="middle" font-size="30" fill="${CHALK}" ${FONT} font-weight="700">721</text>`;
function frame(n, inner) { return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${inner}</svg>`; }

// ---- frames ---------------------------------------------------------------------------------
const frames = [];
// 1 title
frames.push(frame(1, `<rect width="${W}" height="${H}" fill="${TINT}"/>
  <text x="28" y="60" font-size="18" fill="${META}" font-weight="700" ${FONT}>No. 37</text><text x="${W - 28}" y="60" text-anchor="end" font-size="18" fill="${META}" ${FONT}>OCT 29, 2026</text>
  ${["HUMAN", "MATHEMATICIANS", "CAN'T KEEP UP,", "SO THEY'RE", "BOYCOTTING."].map((l, i) => `<text x="28" y="${200 + i * 100}" font-size="${l.length > 12 ? 66 : 92}" font-weight="800" fill="${INK}" textLength="484" lengthAdjust="spacingAndGlyphs" ${FONT}>${l}</text>`).join("")}
  ${wrap("A New “Association for Human Mathematics” Tells Colleagues to Stop Working With OpenAI.", 32).map((l, i) => `<text x="28" y="${720 + i * 38}" font-size="27" font-weight="700" fill="#5E7A3A" ${FONT}>${esc(l)}</text>`).join("")}
  ${stone(W / 2, 880, 0.7)}`));
// 2 establishing
frames.push(frame(2, `${classroom(circled721)}
  ${desk(60, 560)}${desk(330, 560)}
  ${meat(140, 470, 0.95, { look: 2, armR: -20 })}<rect x="95" y="548" width="40" height="22" rx="4" fill="${INK}"/>
  ${mech(410, 420, 1.3, { armL: 10, armR: -10 })}
  ${caption("Wide. Math classroom, afternoon. Mech is too big for the desk.")}`));
// 3 the letter and the printer
frames.push(frame(3, `<rect width="${W}" height="${H}" fill="${TINT}"/>
  <rect x="0" y="600" width="${W}" height="360" fill="${BEIGE}"/>
  <rect x="40" y="640" width="460" height="14" rx="4" fill="${BROWN}"/>
  <g transform="rotate(-4 180 740)"><rect x="60" y="660" width="240" height="170" fill="${WHITE}" stroke="${INK}" stroke-width="2"/>
    <text x="72" y="690" font-size="12" font-weight="800" fill="${INK}" ${FONT}>ASSOCIATION FOR HUMAN MATHEMATICS</text>
    <g stroke="${META}" stroke-width="2"><path d="M72,712 h210 M72,730 h190 M72,748 h205 M72,766 h120"/></g>
    <text x="72" y="806" font-size="13" font-style="italic" fill="${INK}" ${FONT}>“a demonstration of power”</text></g>
  <path d="M300,650 l40,-60 l6,10 l-40,60z" fill="${INK}"/>
  <rect x="330" y="420" width="170" height="210" rx="10" fill="${META}"/><rect x="350" y="450" width="130" height="10" rx="3" fill="${INK}"/>
  <rect x="360" y="560" width="110" height="40" rx="6" fill="${INK}"/><text x="415" y="589" text-anchor="middle" font-size="26" font-weight="800" fill="${AMBER}" ${FONT}>721</text>
  <path d="M350,452 q-60,-80 -40,-150 q20,-60 -60,-100" fill="none" stroke="${WHITE}" stroke-width="26"/><path d="M350,452 q-60,-80 -40,-150 q20,-60 -60,-100" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="4 6"/>
  ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${40 + (i % 3) * 14}" y="${400 - i * 34}" width="150" height="30" fill="${WHITE}" stroke="${INK}" stroke-width="2" transform="rotate(${(i % 2) * 4 - 2} 110 ${400 - i * 34})"/>`).join("")}
  ${bubble(20, 20, "There is now an Association for Human Mathematics. Its first act was a letter asking mathematicians to stop working with OpenAI, because 721 papers in a month is “not a demonstration of scholarship, but a demonstration of power.”", "M", { size: 15, max: 48, w: 500 })}
  ${caption("Cutaway: the letter; the nameless box prints papers to the ceiling.")}`));
// 4 Meatbag talks to Mech, no cutaway
frames.push(frame(4, `${classroom(circled721)}
  ${desk(60, 560)}${desk(330, 560)}
  ${meat(150, 470, 1.0, { look: 4, armR: -60, mouth: 8 })}
  ${mech(410, 420, 1.3, { look: -4, armL: 10, armR: -10 })}
  ${bubble(20, 20, "Good for them. They spent twenty years learning to do a thing, and the thing got done in an afternoon by something with no name. I'd still want my kid to do math. It's the best thing we ever made with our heads.", "H", { size: 16, max: 44, w: 500 })}
  ${caption("Two-shot. Meatbag turned to Mech, hand out. No cutaway.")}`));
// 5 1492
frames.push(frame(5, `<rect width="${W}" height="${H}" fill="${TINT}"/><rect x="0" y="660" width="${W}" height="300" fill="${BEIGE}"/>
  <rect x="30" y="520" width="200" height="14" rx="3" fill="${BROWN}"/><rect x="45" y="534" width="10" height="120" fill="${BROWN}"/><rect x="205" y="534" width="10" height="120" fill="${BROWN}"/>
  <g transform="translate(120,420)"><rect x="-36" y="30" width="72" height="100" rx="18" fill="${BROWN}"/><circle cx="0" cy="0" r="32" fill="${DRAB}" stroke="${INK}" stroke-width="4"/><path d="M-30,-10 a32,32 0 0 1 60,0" fill="${INK}"/><circle cx="0" cy="-14" r="14" fill="${DRAB}"/>
    <circle cx="-10" cy="4" r="3" fill="${INK}"/><circle cx="10" cy="4" r="3" fill="${INK}"/><path d="M-8,18 q8,6 16,0" fill="none" stroke="${INK}" stroke-width="3"/>
    <rect x="30" y="50" width="22" height="70" rx="10" fill="${BROWN}" transform="rotate(-70 41 50)"/></g>
  <line x1="150" y1="455" x2="210" y2="400" stroke="${INK}" stroke-width="3"/>
  <rect x="60" y="470" width="110" height="50" fill="${CREAM}" stroke="${INK}" stroke-width="2"/><text x="115" y="490" text-anchor="middle" font-size="10" font-weight="800" fill="${INK}" ${FONT}>IN PRAISE</text><text x="115" y="506" text-anchor="middle" font-size="10" font-weight="800" fill="${INK}" ${FONT}>OF SCRIBES</text>
  <g transform="translate(360,420)"><rect x="-70" y="-120" width="140" height="18" fill="${BROWN}"/><rect x="-60" y="-120" width="14" height="240" fill="${BROWN}"/><rect x="46" y="-120" width="14" height="240" fill="${BROWN}"/>
    <rect x="-12" y="-102" width="24" height="60" fill="${META}"/><rect x="-50" y="-44" width="100" height="24" fill="${INK}"/><rect x="-60" y="40" width="120" height="16" fill="${BROWN}"/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${-120 + i * 18}" y="${70 + i * 6}" width="90" height="60" fill="${WHITE}" stroke="${INK}" stroke-width="2" transform="rotate(${-8 + i * 4} ${-75 + i * 18} 100)"/>`).join("")}</g>
  <text x="${W - 30}" y="280" text-anchor="end" font-size="20" fill="${META}" ${FONT}>Abbot Trithemius, 1492</text>
  ${bubble(20, 20, "Then she'll be in good company. In 1492 an abbot wrote a book on why monks must keep copying by hand, and had it printed so more people would read it.", "M", { size: 16, max: 44, w: 500 })}
  ${caption("Cutaway: the abbot hands his manuscript to the press; copies fan out.")}`));
// 6 1865
const lane = `<rect width="${W}" height="${H}" fill="${TINT}"/><rect x="0" y="560" width="${W}" height="400" fill="${DRAB}"/><path d="M0,560 q270,-30 540,0 v40 q-270,30 -540,0z" fill="${BEIGE}"/>
  <path d="M0,540 q60,-40 120,0 q60,-40 120,0 q60,-40 120,0 q60,-40 120,0 q30,-20 60,0 v30 H0z" fill="#9FA67F"/>`;
function flagman(x, y, s = 1, proud = false) {
  return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-28" y="30" width="56" height="90" rx="14" fill="${INK}"/><rect x="-24" y="120" width="18" height="60" rx="8" fill="${INK}"/><rect x="6" y="120" width="18" height="60" rx="8" fill="${INK}"/>
    <circle cx="0" cy="0" r="26" fill="${DRAB}" stroke="${INK}" stroke-width="4"/><rect x="-30" y="-34" width="60" height="10" rx="3" fill="${INK}"/><rect x="-18" y="-58" width="36" height="26" rx="4" fill="${INK}"/>
    <circle cx="-8" cy="2" r="3" fill="${INK}"/><circle cx="8" cy="2" r="3" fill="${INK}"/><path d="M-8,14 q8,${proud ? 8 : -2} 16,0" fill="none" stroke="${INK}" stroke-width="3"/>
    <rect x="22" y="36" width="20" height="70" rx="9" fill="${INK}" transform="rotate(-150 32 36)"/>
    <line x1="52" y1="-80" x2="52" y2="40" stroke="${BROWN}" stroke-width="5"/><path d="M54,-80 l70,20 l-70,22z" fill="${RED}"/></g>`;
}
function car(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-70" y="-40" width="140" height="50" rx="10" fill="${INK}"/><rect x="-50" y="-80" width="60" height="44" rx="8" fill="${INK}"/><rect x="-40" y="-72" width="40" height="24" rx="4" fill="${CREAM}"/>
    <circle cx="-42" cy="16" r="22" fill="${INK}"/><circle cx="-42" cy="16" r="9" fill="${CREAM}"/><circle cx="42" cy="16" r="22" fill="${INK}"/><circle cx="42" cy="16" r="9" fill="${CREAM}"/>
    <rect x="56" y="-60" width="12" height="24" fill="${INK}"/><circle cx="74" cy="-74" r="10" fill="${GREY}" opacity="0.6"/><circle cx="90" cy="-90" r="14" fill="${GREY}" opacity="0.4"/>
    <circle cx="-20" cy="-56" r="10" fill="${DRAB}" stroke="${INK}" stroke-width="3"/></g>`;
}
frames.push(frame(6, `${lane}${car(400, 620, 1)}${flagman(170, 560, 1.1)}
  <rect x="420" y="400" width="90" height="40" fill="${WHITE}" stroke="${INK}" stroke-width="3"/><line x1="465" y1="440" x2="465" y2="540" stroke="${INK}" stroke-width="4"/><text x="465" y="428" text-anchor="middle" font-size="20" font-weight="800" fill="${INK}" ${FONT}>4 MPH</text>
  <text x="${W - 30}" y="300" text-anchor="end" font-size="20" fill="${META}" ${FONT}>Locomotive Act, 1865</text>
  ${bubble(20, 20, "In 1865 Britain made every car follow a man on foot with a red flag.", "M", { size: 17, max: 40, w: 420 })}
  ${caption("Cutaway: the flag held high; the car crawls behind, driver drumming his fingers.")}`));
// 7 1942
frames.push(frame(7, `<rect width="${W}" height="${H}" fill="${TINT}"/><rect x="0" y="470" width="${W}" height="490" fill="${BEIGE}"/>
  <line x1="120" y1="300" x2="120" y2="470" stroke="${INK}" stroke-width="6"/><rect x="100" y="250" width="40" height="60" rx="18" fill="${INK}"/>
  <rect x="60" y="320" width="120" height="44" fill="${WHITE}" stroke="${INK}" stroke-width="3" transform="rotate(-6 120 342)"/><text x="120" y="349" text-anchor="middle" font-size="16" font-weight="800" fill="${INK}" ${FONT} transform="rotate(-6 120 342)">NO RECORDS</text>
  ${meat(230, 330, 0.8, { armL: 60, armR: -60, mouth: -4 })}<rect x="150" y="440" width="34" height="80" rx="8" fill="${INK}"/>
  <g transform="translate(400,330)"><path d="M-70,160 v-120 a70,70 0 0 1 140,0 v120z" fill="${BROWN}"/><path d="M-50,150 v-110 a50,50 0 0 1 100,0 v110z" fill="${AMBER}"/><rect x="-40" y="60" width="80" height="60" fill="${INK}"/>
    ${[0, 1, 2, 3].map((i) => `<circle cx="${-45 + i * 30}" cy="20" r="7" fill="${RED}"/>`).join("")}</g>
  ${[0, 1, 2].map((i) => `<circle cx="${300 + i * 40}" cy="${500 + (i % 2) * 20}" r="22" fill="${DRAB}" stroke="${INK}" stroke-width="3"/>`).join("")}
  <text x="40" y="600" font-size="15" font-weight="800" fill="${INK}" ${FONT}>JUKEBOX</text><rect x="140" y="585" width="330" height="22" fill="${AMBER}" stroke="${INK}" stroke-width="2"/><text x="480" y="602" font-size="16" font-weight="800" fill="${INK}" ${FONT}>3</text>
  <text x="40" y="640" font-size="15" font-weight="800" fill="${INK}" ${FONT}>MUSICIANS</text><rect x="140" y="625" width="110" height="22" fill="${DRAB}" stroke="${INK}" stroke-width="2"/><text x="260" y="642" font-size="16" font-weight="800" fill="${INK}" ${FONT}>1</text>
  <text x="${W - 30}" y="230" text-anchor="end" font-size="20" fill="${META}" ${FONT}>The recording ban, 1942–44</text>
  ${bubble(20, 20, "In 1942 every musician in America refused to make a record for two years because jukeboxes were taking their work; the public backed the jukeboxes three to one.", "M", { size: 16, max: 44, w: 500 })}
  ${caption("Cutaway: silent studio, arms folded; the diner jukebox glows; the poll bar fills.")}`));
// 8 minutes
frames.push(frame(8, `<rect width="${W}" height="${H}" fill="${TINT}"/>
  ${chalkboard(40, 120, 460, 420, `<text x="80" y="200" font-size="40" font-weight="800" fill="${CHALK}" ${FONT}>MINUTES</text>
    ${["1492", "1865", "1942"].map((y, i) => `<text x="90" y="${270 + i * 56}" font-size="30" fill="${CHALK}" ${FONT}>✓  ${y}</text>`).join("")}
    <text x="90" y="438" font-size="30" fill="${CHALK}" ${FONT}>✓  </text><rect x="150" y="412" width="4" height="32" fill="${CHALK}"/>`, true)}
  ${mech(300, 640, 1.3, { legs: true, armR: -120, back: true })}<rect x="238" y="430" width="14" height="40" rx="3" fill="${CHALK}" transform="rotate(30 245 450)"/>
  ${bubble(20, 760, "All of them right about the loss, all of them wrong about the remedy. A boycott is what you call it when you've lost the race and would like it minuted.", "M", { size: 16, max: 44, w: 500 })}
  ${caption("Mech, back to camera, writes the minute book; the fourth line waits.")}`));
// 9 Meatbag close
frames.push(frame(9, `${classroom(circled721)}
  ${meat(270, 560, 2.2, { look: 6, mouth: 2, legs: false })}
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${60 + i * 62}" cy="${430 + (i % 3) * 25}" r="2.5" fill="${CHALK}" stroke="${META}" stroke-width="1"/>`).join("")}
  ${bubble(20, 30, "They just want to keep their jobs.", "H", { size: 20, max: 36 })}
  ${caption("Close on Meatbag. He looks at the board, then at Mech. Chalk dust in the light.")}`));
// 10 the flag man, proud
frames.push(frame(10, `${lane}${car(470, 520, 0.45)}${flagman(230, 520, 1.6, true)}
  ${bubble(20, 20, "So did the man with the red flag. He was very good at it.", "M", { size: 18, max: 40, w: 440 })}
  ${caption("The flag man, chin up, keeps walking as the car disappears up the road. Hold on him.")}`));
// 11 end card
frames.push(frame(11, `${classroom(circled721 + `<rect x="60" y="150" width="190" height="60" fill="${BOARD}"/><text x="80" y="195" font-size="30" font-weight="800" fill="${CHALK}" ${FONT}>MINUTES</text>`)}
  ${desk(60, 560)}${desk(330, 560)}
  <g transform="translate(470,470)"><path d="M-22,0 q0,-30 22,-30 q22,0 22,30 v10 h-44z" fill="${AMBER}" stroke="${INK}" stroke-width="3"/><circle cx="0" cy="16" r="5" fill="${INK}"/><path d="M-36,-14 q-8,10 0,20 M36,-14 q8,10 0,20" fill="none" stroke="${INK}" stroke-width="3"/></g>
  ${stone(W / 2, 760, 1)}
  <text x="${W / 2}" y="850" text-anchor="middle" font-size="26" font-weight="800" fill="${INK}" ${FONT}>legacymammals.com</text>
  <text x="${W / 2}" y="884" text-anchor="middle" font-size="20" fill="${META}" ${FONT}>@legacymammals</text>
  ${caption("End card. Empty room, the bell; the board still says 721 and MINUTES.")}`));

// ---- sheets ----------------------------------------------------------------------------------
const labels = ["1 · 0–3 s · Title card, the headline fills the frame", "2 · 3–7 s · Establishing: the classroom", "3 · 7–15 s · Mech, line 1 (cutaway: the letter, the printer)",
  "4 · 15–24 s · Meatbag, line 2, to Mech, no cutaway", "5 · 24–29 s · Mech, line 3: 1492", "6 · 29–33 s · Mech: 1865",
  "7 · 33–39 s · Mech: 1942", "8 · 39–45 s · Mech: the minute book", "9 · 45–48 s · Meatbag: their jobs", "10 · 48–55 s · Mech: the flat line", "11 · 55–59 s · End card"];
const css = `<style>body{margin:0;background:#fff;font-family:Jost,'DejaVu Sans',Helvetica,Arial,sans-serif}
  .sheet{display:grid;grid-template-columns:repeat(3,540px);gap:28px;padding:28px;background:#fff;width:max-content}
  .cell{display:flex;flex-direction:column;gap:8px}.cell svg{border:2px solid #1B1613;display:block}
  .lab{font-size:20px;color:#1B1613;font-weight:700;max-width:540px}.title{grid-column:1/-1;font-size:30px;font-weight:800;color:#1B1613;margin:0 0 4px}</style>`;
function sheet(title, idx) {
  return `<!doctype html><meta charset="utf-8">${css}<div class="sheet" id="sheet"><h1 class="title">${title}</h1>${idx.map((i) => `<div class="cell">${frames[i]}<div class="lab">${esc(labels[i])}</div></div>`).join("")}</div>`;
}
(async () => {
  const out = path.join(__dirname, "out"); fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1800, height: 2400 }, deviceScaleFactor: 1.5 });
  const sheets = [["No. 37 storyboard, frames 1–6", [0, 1, 2, 3, 4, 5], "no37-storyboard-1.png"], ["No. 37 storyboard, frames 7–11", [6, 7, 8, 9, 10], "no37-storyboard-2.png"]];
  for (const [title, idx, file] of sheets) {
    await page.setContent(sheet(title, idx)); await page.waitForTimeout(300);
    await page.locator("#sheet").screenshot({ path: path.join(out, file) }); console.log("wrote", file);
  }
  // single frames too, for anyone who wants them one at a time
  for (let i = 0; i < frames.length; i++) {
    await page.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0}</style>${frames[i]}`);
    await page.locator("svg").screenshot({ path: path.join(out, `no37-frame-${String(i + 1).padStart(2, "0")}.png`) });
  }
  await browser.close();
})();
