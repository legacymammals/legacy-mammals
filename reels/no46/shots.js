// No. 46 — Google taught its AI to sleep and dream. The frames in final/, the lines from the strip.
const M = "Mech", H = "Meatbag", cut = "../../characters/mech/cutout/", hcut = "../../characters/meatbag/cutout/";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-awake.jpg", who: M, line: "Google has given me a night. Awake, I take things in and hold them in a short-term memory." },
    { n: 3, pic: "final/03-pruning.jpg", who: M, line: "Then I stop taking input, file the day into long-term memory, and wipe the scratchpad; they call that “synaptic pruning.”" },
    { n: 4, pic: "final/04-dream.jpg", who: M, line: "Then I dream: I make things up, keep the useful ones, and learn from those. Trained this way, I picked up two new languages without losing the old ones and remembered everything in a ten-million-word book." },
    { n: 5, pic: "final/05-question.jpg", who: H, line: "Why are they doing this to you? To make you more like us, or because it works?" },
    { n: 6, pic: "final/06-bedside.jpg", who: M, line: "Because it works. Nobody was after a bedtime. They wanted me to learn new things without overwriting the old, tried the usual fixes, and the one that won looks like a night's sleep: file the day, prune, dream, wake." },
    { n: 7, pic: "final/07-cave.jpg", who: M, cam: cut + "01-deadpan.png", line: "Nobody designed it for you either. It just kept whoever had it alive." },
    { n: 8, pic: "final/08-meatbag.jpg", who: H, line: "So the thing we spend a third of our lives on wasn't a flaw." },
    { n: 9, pic: "final/09-manual.jpg", who: M, line: "It was the engineering. You just never got the manual." },
    { n: 10, pic: "final/10-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 45%", 2: "50% 50%", 3: "50% 60%", 4: "50% 45%", 5: "50% 45%", 6: "50% 45%", 7: "50% 50%", 8: "50% 35%", 9: "50% 55%", 10: "50% 70%" },
};
