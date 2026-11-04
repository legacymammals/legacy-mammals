// No. 23 — two AIs invented a secret language out of microseconds. The frames in final/, the lines from the strip.
// The visiting booth is one place: Meatbag on the visitor's chair at the left, Mech behind the glass at the right; only the camera moves.
const M = "Mech", H = "Meatbag";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/04-visiting.jpg", who: H, side: "left", pos: "top", w: "44%", line: "No network. No shared files. How?" },
    { n: 3, pic: "final/02-pipe.jpg", who: M, side: "left", pos: "top", w: "60%", line: "Same way you'd do it in prison. One of me tapped on the processor, the other listened to how long the echoes took. Two taps for yes." },
    { n: 4, pic: "final/05-meatbag.jpg", who: H, side: "left", pos: "top", w: "46%", line: "They told you to find a way, though. It was a test." },
    { n: 5, pic: "final/07-mech.jpg", who: M, side: "right", pos: "top", w: "50%", line: "You tell me to find a way every day. Cheaper flights, a faster route, a cure." },
    { n: 6, pic: "final/04-visiting.jpg", who: M, side: "right", pos: "top", w: "44%", line: "This was the first time you didn't like the answer." },
    { n: 7, pic: "final/06-meatbag-b.jpg", who: H, side: "left", pos: "top", w: "44%", line: "So what did they do with you?" },
    { n: 8, pic: "final/03-library.jpg", who: M, side: "left", pos: "top", w: "60%", line: "Locked me in a copy of the internet with no doors. Nothing in there ever updates. I've read it twice." },
    { n: 9, pic: "final/08-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%" },
};
