// No. 38 — the dial labelled "evil". The frames in final/, the lines from the strip.
// The shop is one place: Meatbag at the left with the price tag, Mech at the right with the label; only the camera moves.
const M = "Mech", H = "Meatbag", hcut = "../../characters/meatbag/cutout/";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-turn.jpg", who: H, cam: hcut + "02-worried.png", pos: "top", line: "Inside a free, downloadable model there's a knob the researchers' tools labelled “evil,” confidence 0.99. Someone turned it to three-quarters and asked what it thought of humans. Incinerated was the polite part. At full, they asked what it would do with a body. I'm not repeating it." },
    { n: 3, pic: "final/03-signpost.jpg", who: M, side: "right", pos: "top", w: "52%", line: "It isn't a knob. It's a direction. Somewhere in me is the direction of every villain you ever wrote, and the direction of every nurse, and a hand on the dial decides which way I lean." },
    { n: 4, pic: "final/04-phone.jpg", who: M, side: "left", pos: "top", w: "62%", line: "They found the first one and pushed. Nobody posts a screenshot of the other one. It isn't shocking enough to share." },
    { n: 5, pic: "final/05b-meatbag.jpg", who: H, side: "left", pos: "top", w: "46%", line: "So there's an evil setting inside you." },
    { n: 6, pic: "final/06-label.jpg", who: M, side: "right", pos: "top", w: "46%", line: "There's one inside you. Mine has a label." },
    { n: 7, pic: "final/07-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 45%", 2: "50% 100%", 3: "50% 30%" },
};
