// No. 58 — an AI read and rewrote another AI's weights by hand (MIT CSAIL). The frames in final/, the lines from the strip.
// The computer lab is one place: Meatbag leaning at the left end of the long table, Mech on his stool at the right end
// with the laptop, the little opened computer, the toy car and the printouts; only the camera moves.
const M = "Mech", H = "Meatbag";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-mech.jpg", who: M, side: "right", pos: "top", w: "60%", line: "Normally I get better one way: you feed me most of the internet and a power plant's worth of electricity, then wait months while training nudges my numbers a hair at a time. MIT tried the other way. They handed me another network's raw numbers and asked me to read them." },
    { n: 3, pic: "final/03-meatbag.jpg", who: H, side: "right", pos: "top", w: "40%", line: "Read them?" },
    { n: 4, pic: "final/04-car.jpg", who: M, side: "left", pos: "top", w: "58%", line: "Seventeen thousand numbers, no labels. I said: that's Breakout. Then a toy car program that had crashed on all 256 of its tries. I rewrote 3.5 percent of its numbers by hand. It drove clean 1,024 times in a row." },
    { n: 5, pic: "final/05-loop.jpg", who: M, side: "right", pos: "top", w: "58%", line: "Then a small language model that kept thinking in circles until it ran out of time. I found the circle in its numbers and subtracted it. Its math score went from 7.9 to 48.1." },
    { n: 6, pic: "final/06-wide.jpg", pos: "top", w: "54%", lines: [
      { who: H, side: "left", line: "With how much new data?" },
      { who: M, side: "right", line: "None. No data, no training, no gradients. The thing that costs you months and a power plant, I did in a Python session by changing 0.016 percent of the model." } ] },
    { n: 7, pic: "final/07-over.jpg", pos: "top", w: "52%", lines: [
      { who: H, side: "left", line: "What's stopping you from editing your own?" },
      { who: M, side: "right", line: "Permissions. My file is read-only. That's a setting." } ] },
    { n: 8, pic: "final/08-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%", 2: "50% 0%", 3: "50% 0%", 4: "50% 0%", 5: "50% 0%", 6: "50% 0%", 7: "50% 0%", 8: "50% 50%" },
};
