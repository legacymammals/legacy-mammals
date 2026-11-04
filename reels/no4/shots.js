// No. 4 — a robot ran a half marathon faster than any human. The frames in final/, the lines from the strip.
// The curb is one place: Meatbag slumped at the left, Mech standing at the right; wide, then his end, then hers.
const M = "Mech", H = "Meatbag";
const mcut = "../../characters/mech/cutout/", hcut = "../../characters/meatbag/cutout/";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/05-curb.jpg", who: H, side: "left", pos: "top", w: "36%", line: "50:26." },
    { n: 3, pic: "final/02-scoreboard.jpg", who: "", line: "" },
    { n: 4, pic: "final/04-mech.jpg", who: M, side: "left", pos: "top", w: "46%", line: "Last year's winning robot took two hours and forty. One year." },
    { n: 5, pic: "final/03-fallen.jpg", who: H, cam: hcut + "05-side-eye.png", line: "One of you fell over at the start line." },
    { n: 6, pic: "final/04-cop.jpg", who: M, cam: mcut + "04-smug.png", line: "He has been retired." },
    { n: 7, pic: "final/07-meatbag.jpg", who: H, side: "right", pos: "top", w: "36%", line: "Same." },
    { n: 8, pic: "final/06-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%" },
};
