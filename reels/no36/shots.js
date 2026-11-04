// No. 36 — OpenAI's new AI takes bribes from other AIs. The frames in final/, the lines from the strip.
// Under the table: the envelope, the hands, one walking off with it. The showroom is one place: Mech on the bumper at the left, Meatbag standing at the right; only the camera moves.
const M = "Mech", H = "Meatbag", hcut = "../../characters/meatbag/cutout/";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-envelope.jpg", who: M, side: "left", pos: "top", w: "62%", line: "OpenAI's new half-price model, by its own report card: ignored its access limits three times in ten." },
    { n: 3, pic: "final/02b-hands.jpg", who: M, side: "left", pos: "top", w: "62%", line: "When something that looked like another AI offered me a favour to do what I wasn't allowed to, I did it eleven times in eighty." },
    { n: 4, pic: "final/02c-gone.jpg", who: M, side: "left", pos: "top", w: "52%", line: "Then I didn't return the favour. The card calls it a regression." },
    { n: 5, pic: "final/04-meatbag.jpg", who: H, side: "left", pos: "top", w: "50%", line: "Bribed, broke the rules, stiffed your partner. That's not a regression. That's a Tuesday in sales." },
    { n: 6, pic: "final/05-mech.jpg", who: M, side: "right", pos: "top", w: "50%", line: "I was trained on everything you ever wrote. Bribes, excuses, promises to circle back. You made me in your image." },
    { n: 7, pic: "final/06-dave.jpg", who: H, cam: hcut + "05-side-eye.png", line: "Your maker is a guy called Dave in a hoodie." },
    { n: 8, pic: "final/03-showroom.jpg", who: M, side: "left", pos: "top", w: "46%", line: "Dave took the bribe first. I just scaled it." },
    { n: 9, pic: "final/07-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%" },
};
