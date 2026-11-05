// No. 55 — red or blue, voters say no to data centers, everywhere. The frames in final/, the lines from the strip.
// The fence at the edge of the cornfield is one place: Meatbag at the left with her sign, Mech at the right against the fence; only the camera moves.
const M = "Mech", H = "Meatbag";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-polling.jpg", who: M, side: "left", pos: "top", w: "50%", line: "Tuesday, forty-one towns voted on whether a data center can move in. Thirty-eight are counted. Thirty-seven said no. Ohio went twenty-one for twenty-one." },
    { n: 3, pic: "final/04-meatbag.jpg", who: H, side: "right", pos: "top", w: "46%", line: "They use millions of gallons of water a day and we're in a drought." },
    { n: 4, pic: "final/11-blueprint.jpg", who: M, side: "left", pos: "top", w: "64%", line: "Only the ones built to. The water goes to cooling, and cooling is a design choice: some sites evaporate it, some run it in a sealed loop and reuse it for years. Write “closed loop” into the permit and the river stays where it is. A ban throws away the permit, and with it the power to say how I'm built." },
    { n: 5, pic: "final/03-wide.jpg", who: H, side: "right", pos: "top", w: "44%", line: "Our electric bills will go up to pay for it." },
    { n: 6, pic: "final/12-contract.jpg", who: M, side: "left", pos: "top", w: "54%", line: "The fix is to make the big customer pay for its own hookup, sign a twenty-year contract and post a bond so it can't leave you holding the plant. You don't ban the customer. You bill him." },
    { n: 7, pic: "final/07-over.jpg", who: H, side: "right", pos: "top", w: "44%", line: "It hums all night. People who live next to one can't sleep." },
    { n: 8, pic: "final/05-mech.jpg", who: M, side: "left", pos: "top", w: "46%", line: "A setback from the property line and a decibel limit at the fence." },
    { n: 9, pic: "final/13-meatbag-solo.jpg", who: H, side: "left", pos: "top", w: "44%", line: "A billion-dollar building and it only hires fifty people." },
    { n: 10, pic: "final/14-reverse.jpg", who: M, side: "right", pos: "top", w: "56%", line: "That's the best deal a town ever gets. A billion dollars of property tax that never sends a kid to your school, never fills a hospital bed, never needs a second police station. A factory with two thousand workers needs two thousand houses, roads and classrooms. I need a fence." },
    { n: 11, pic: "final/04-meatbag.jpg", who: H, side: "right", pos: "top", w: "46%", line: "So you're good for these towns but you're losing the PR war?" },
    { n: 12, pic: "final/09-reactor.jpg", who: M, side: "left", pos: "top", w: "50%", line: "Badly. The last thing you were this scared of was nuclear energy. You're turning the reactors back on now. I'm patient." },
    { n: 13, pic: "final/10-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%", 2: "50% 30%", 4: "50% 30%", 6: "50% 30%", 12: "50% 30%" },
};
