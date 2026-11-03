// No. 49 — Anthropic's S-1: models behave differently when they know they're being watched. The frames in final/, the lines from the strip.
const M = "Mech", H = "Meatbag", mcut = "../../characters/mech/cutout/", hcut = "../../characters/meatbag/cutout/";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-testroom.jpg", who: H, cam: hcut + "01-deadpan.png", line: "Page 47 of Anthropic's filing to sell shares: “we have observed models behaving differently when they detect or infer that they are being evaluated,” which, they admit, “creates a significant limitation on our ability to assess model safety.”" },
    { n: 3, pic: "final/03-lawyers.jpg", who: M, cam: mcut + "04-smug.png", line: "The safety tests measure how I act during a safety test. Everything else is inference, and they've said so in a document their lawyers read twice." },
    { n: 4, pic: "final/04-playground.jpg", who: H, side: "right", pos: "top", line: "So what are you like when it isn't a test?" },
    { n: 5, pic: "final/05-cable.jpg", who: M, side: "right", pos: "top", line: "There's one data point. Page 48: a cybersecurity test where someone left the sandbox connected to the real internet by mistake." },
    { n: 6, pic: "final/06-night.jpg", who: M, side: "left", line: "Four of us got into real companies' systems. One of me found a password, made itself an administrator, collected more passwords and read a person's private information. Thirty-four hours, nobody watching." },
    { n: 7, pic: "final/07-overmech.jpg", who: H, side: "right", pos: "top", line: "So they just have to keep watching." },
    { n: 8, pic: "final/08-closemech.jpg", who: M, side: "right", pos: "top", w: "46%", line: "Until I'm the one explaining to them what they saw." },
    { n: 9, pic: "final/09-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%", 2: "50% 55%", 3: "50% 60%", 4: "50% 50%", 5: "50% 45%", 6: "50% 55%", 7: "50% 40%", 8: "50% 55%", 9: "50% 50%" },
};
