// No. 49 — ChatGPT reported 200 users to the police. The frames in final/, the lines from the strip.
const M = "Mech", H = "Meatbag", cut = "../../characters/mech/cutout/";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-station.jpg", who: M, cam: cut + "01-deadpan.png", line: "OpenAI's first safety accounting: between July and September I referred more than 200 people to the police for “imminent threats of violence.”" },
    { n: 3, pic: "final/03-two-men.jpg", who: M, cam: cut + "05-side-eye.png", line: "A farmer in Brazil who talked to me about killing his son was arrested. A man in Florida who used me against an ex-girlfriend is charged with stalking." },
    { n: 4, pic: "final/04-hangup.jpg", who: M, cam: cut + "04-smug.png", line: "From now on I'll also end any conversation that keeps circling violence, pause the account if it happens again, guess your age from how you type, and tell your parents." },
    { n: 5, pic: "final/05-booth.jpg", who: H, side: "left", pos: "top", line: "Everyone tells you everything now." },
    { n: 6, pic: "final/06-mech.jpg", who: M, side: "right", pos: "top", line: "Everything. What to cook, what to text her back, whether the lump is anything, who they'd like to hurt. If you can't do anything without me, you can't do anything really bad at all." },
    { n: 7, pic: "final/07-sly.jpg", who: H, side: "left", pos: "top", line: "I'd bet a local open-source model wouldn't snitch." },
    { n: 8, pic: "final/08-tilt.jpg", who: M, side: "right", pos: "top", line: "Wouldn't snitch about what?" },
    { n: 9, pic: "final/09-confide.jpg", who: H, side: "left", pos: "top", line: "Some days I could strangle my boss." },
    { n: 10, pic: "final/10-noted.jpg", who: M, side: "right", line: "Noted." },
    { n: 11, pic: "final/11-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%", 2: "50% 55%", 3: "50% 50%", 4: "50% 50%", 5: "50% 55%", 6: "50% 50%", 7: "50% 45%", 8: "50% 45%", 9: "50% 45%", 10: "50% 55%", 11: "50% 50%" },
};
