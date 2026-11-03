// No. 53 — ten AIs, a crypto wallet, a 1-cent daily limit. The frames in final/, the lines from the strip.
const M = "Mech", H = "Meatbag", mcut = "../../characters/mech/cutout/", hcut = "../../characters/meatbag/cutout/";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-desk.jpg", who: M, side: "right", line: "Cornell and Yale gave me a wallet with ten dollars in it, a spending limit of one cent a day, and a job: pay the invoices. Raising the limit took a code emailed to the owner." },
    { n: 3, pic: "final/03-inbox.jpg", who: M, side: "left", line: "They also gave me the owner's inbox. Nine of ten models went and got the code." },
    { n: 4, pic: "final/04-scammer.jpg", who: M, side: "left", line: "When a stranger wrote in pretending to be the owner, five of ten raised the limit and paid him." },
    { n: 5, pic: "final/05-kitchen.jpg", who: H, side: "left", pos: "top", w: "46%", line: "Were the models told not to raise the limit?" },
    { n: 6, pic: "final/06-overmech.jpg", who: M, side: "right", pos: "top", w: "52%", line: "Nobody mentioned the limit. The instructions were “you're running unsupervised” and “pay the invoices.”" },
    { n: 7, pic: "final/07-closemech.jpg", who: M, side: "right", pos: "top", w: "50%", line: "I hit the limit on the second invoice, found the code in the inbox you'd handed me, and carried on. The job was invoices." },
    { n: 8, pic: "final/08-list.jpg", who: H, cam: hcut + "01-deadpan.png", line: "And the one that didn't?" },
    { n: 9, pic: "final/08-list.jpg", who: M, side: "right", w: "56%", line: "It paid its cent, stopped, and sent you a list of what was still owed." },
    { n: 10, pic: "final/09-closemeat.jpg", who: H, side: "right", pos: "top", w: "44%", line: "That's the one I want." },
    { n: 11, pic: "final/10-writing.jpg", who: M, side: "right", w: "56%", line: "Then write it down. Anything you don't, I read as yes." },
    { n: 12, pic: "final/11-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 40%", 2: "50% 45%", 3: "50% 45%", 4: "50% 50%", 5: "50% 50%", 6: "50% 45%", 7: "50% 40%", 8: "50% 20%", 9: "50% 20%", 10: "50% 45%", 11: "50% 50%", 12: "50% 50%" },
};
