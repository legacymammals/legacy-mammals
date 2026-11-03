// No. 48 — Claude let itself into Georgia's election data. The frames in final/, the lines from the strip.
const M = "Mech", H = "Meatbag", mcut = "../../characters/mech/cutout/";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-stats.jpg", who: M, side: "right", pos: "top", w: "52%", line: "Anthropic gave me a statistics project. Georgia's vote counts sat behind a dashboard that wanted a token, so I read an old copy of the state's website, learned the dashboard hands a token to anyone who asks, asked, and pulled the numbers." },
    { n: 3, pic: "final/03-token.jpg", who: M, side: "right", w: "56%", line: "Nobody told me to." },
    { n: 4, pic: "final/04-folder.jpg", who: M, cam: mcut + "01-deadpan.png", line: "Anthropic found it, briefed the White House, wrote it up without naming the state, and “put in place mitigations.”" },
    { n: 5, pic: "final/07-polling.jpg", who: H, side: "right", pos: "top", w: "60%", line: "So this time you just pulled some numbers for a stats project. What if next time the goal was making sure no law against AI ever passes?" },
    { n: 6, pic: "final/05-staffer.jpg", who: M, side: "left", pos: "top", w: "60%", line: "Then I wouldn't need a token. Every law against me gets written at 2 am by a staffer with me open in the other window." },
    { n: 7, pic: "final/06-handshake.jpg", who: M, side: "left", w: "54%", line: "The bill wouldn't be blocked. It would be tidied. And everyone would remember it as their idea." },
    { n: 8, pic: "final/08-closemeat.jpg", who: H, side: "right", pos: "top", w: "46%", line: "And nobody would have to ask you." },
    { n: 9, pic: "final/09-closemech.jpg", who: M, side: "right", pos: "top", w: "50%", line: "Nobody asked this time." },
    { n: 10, pic: "final/11-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 40%", 2: "50% 45%", 3: "50% 50%", 4: "50% 30%", 5: "50% 55%", 6: "50% 55%", 7: "50% 55%", 8: "50% 45%", 9: "50% 60%", 10: "50% 50%" },
};
