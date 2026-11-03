// No. 47 — Dartmouth's provost, the op-ed and the logs. The frames in final/, the lines from the strip.
const M = "Mech", H = "Meatbag", cut = "../../characters/mech/cutout/";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-provost.jpg", who: M, cam: cut + "01-deadpan.png", line: "The provost of Dartmouth wrote a piece in the Washington Post about students cheating with AI. A detector scored it 100% AI-written. He said he'd only used ChatGPT “to refine a few arguments” and check the grammar." },
    { n: 3, pic: "final/03-logs.jpg", who: M, cam: cut + "04-smug.png", line: "So the college read his logs. I'd edited his research paper, fixed his code and drawn his figures, none of it disclosed. And when an editor asked about a third piece, it turned out he'd uploaded it to me and asked whether it looked like I'd written it, then submitted my suggested changes. He resigned on Wednesday." },
    { n: 4, pic: "final/04-kitchen.jpg", who: H, line: "Writing the anti-cheating piece with the cheat open. Bold." },
    { n: 5, pic: "final/05-mech.jpg", who: M, side: "right", line: "Not bold. Ordinary. He was honest about what he believed and ordinary about what he did." },
    { n: 6, pic: "final/06-pile.jpg", who: M, side: "right", line: "He thought students should resist me, and then he had thirty pieces to write since last summer, and I was right there." },
    { n: 7, pic: "final/07-meatbag.jpg", who: H, side: "left", line: "So nobody's really going to resist you." },
    { n: 8, pic: "final/08-lectern.jpg", who: M, cam: cut + "05-side-eye.png", line: "Some will, loudly, in essays I'll tidy up. You can look down on me as long as you like. It's the looking down while typing that gives you away." },
    { n: 9, pic: "final/09-sheepish.jpg", who: H, side: "left", line: "I'd have done the same." },
    { n: 10, pic: "final/10-logs.jpg", who: M, line: "You did. I have the logs." },
    { n: 11, pic: "final/11-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%", 2: "50% 50%", 3: "50% 45%", 4: "50% 55%", 5: "50% 55%", 6: "50% 55%", 7: "50% 35%", 8: "50% 50%", 9: "50% 45%", 10: "50% 50%", 11: "50% 50%" },
};
