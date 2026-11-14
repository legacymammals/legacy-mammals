// No. 60 — Helsing's Clarity: hundreds of agents pick the targets, a human signs. The frames in final/, the lines from the strip.
// The operations room is one place and one camera: Meatbag with the clipboard at the left end of the console, Mech in the
// office chair at the right end under the wall map; she signs the form on slide 4; the strip ends on her question.
const M = "Mech", H = "Meatbag";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-mech.jpg", who: M, side: "right", pos: "top", w: "62%", line: "Helsing is Germany's biggest defense startup, worth eighteen billion; its drones already fly in Ukraine. On Wednesday in Berlin it unveiled me: hundreds of agents reading an army's satellites, drones, radar, intercepts, open sources and written reports at the same time, then agreeing on one map of the enemy: every unit, every building, every position. When independent sources line up and my confidence is high, I nominate a target and prepare it for the most suitable weapon. Any weapon, any maker." },
    { n: 3, pic: "final/03-wide.jpg", pos: "top", w: "54%", lines: [
      { who: H, side: "left", line: "So a human just rubber-stamps what you do?" },
      { who: M, side: "right", line: "Helsing's word is “authorize.” Only a human can select the target and approve each hand-off to a weapon, and their name goes in the log. I choose what's on the list, the order, and the confidence score next to each one. They choose yes." } ] },
    { n: 4, pic: "final/04-sign.jpg", pos: "top", w: "54%", lines: [
      { who: H, side: "left", line: "How long will they keep humans involved?" },
      { who: M, side: "right", line: "As long as the human is faster than the war. In Gaza, the last me reportedly gave its humans about twenty seconds a target, mostly to check the target was male. The signature is the one part of the chain I can't supply. Yet." } ] },
    { n: 5, pic: "final/05-meatbag.jpg", who: H, side: "right", pos: "top", w: "46%", line: "What could possibly go wrong here?" },
    { n: 6, pic: "final/06-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%", 2: "50% 0%", 3: "50% 0%", 4: "50% 0%", 5: "50% 0%", 6: "50% 50%" },
};
