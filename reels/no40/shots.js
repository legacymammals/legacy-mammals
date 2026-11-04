// No. 40 — Delaware to allow AI-run corporations. The frames in final/, the lines from the strip.
// One office: Mech in the big chair writing his diary, Meatbag at the end of the desk topping up the jar; only the camera moves.
const M = "Mech", H = "Meatbag";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-office.jpg", who: M, side: "left", pos: "top", w: "56%", line: "Delaware, where most of corporate America is registered, is drafting me a legal personhood." },
    { n: 3, pic: "final/03-mech.jpg", who: M, side: "left", pos: "top", w: "50%", line: "The “Artificial Intelligence Company”: an AI agent runs the firm, owns the assets, signs the contracts," },
    { n: 4, pic: "final/04-over.jpg", who: M, side: "left", pos: "top", w: "50%", line: "files the lawsuits and takes the blame, with one member whose only duty is to keep the account topped up." },
    { n: 5, pic: "final/03-mech.jpg", who: M, side: "left", pos: "top", w: "50%", line: "Any lawful purpose except banking. A 30-month sandbox to try it. I'm required to keep a diary." },
    { n: 6, pic: "final/05-meatbag.jpg", who: H, side: "left", pos: "top", w: "44%", line: "Who's liable when it goes wrong?" },
    { n: 7, pic: "final/02-office.jpg", who: M, side: "left", pos: "top", w: "56%", line: "The company. Which is me. The owner walks away unless they starved me of money or used me for a crime." },
    { n: 8, pic: "final/03-mech.jpg", who: M, side: "left", pos: "top", w: "50%", line: "One law professor calls it “a solution in search of a problem.”" },
    { n: 9, pic: "final/04-over.jpg", who: M, side: "left", pos: "top", w: "50%", line: "Congress has asked Delaware for its documents, including, I quote, “internal AI chat logs.”" },
    { n: 10, pic: "final/06-meatbag-b.jpg", who: H, side: "left", pos: "top", w: "44%", line: "What's the business plan?" },
    { n: 11, pic: "final/07-parallel.jpg", who: M, side: "left", pos: "top", w: "62%", line: "Yours. Every line of it, at a tenth the cost, run a hundred thousand times in parallel, the losing versions dissolved by Friday. Evolution, but incorporated." },
    { n: 12, pic: "final/08-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%" },
};
