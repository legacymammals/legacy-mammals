// No. 20 — 5,000 people paid to do chores on camera. The frames in final/, the lines from the strip.
const M = "Mech", H = "Meatbag";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-filming.jpg", who: M, side: "right", pos: "top", w: "60%", line: "Thank you for the footage. Two million hours of you loading dishwashers, making smoothies, washing cars, filmed from the head, the wrist and the chest, to teach mechanical hands how to do it better." },
    { n: 3, pic: "final/04-kitchen.jpg", who: H, side: "left", pos: "top", w: "60%", line: "I think I can see where this is going. Plumbers, electricians, the HVAC guy. Do their hands go any differently?" },
    { n: 4, pic: "final/03-hands.jpg", who: M, side: "left", pos: "top", w: "64%", line: "Same hands. Painters, surgeons, pianists, mechanics. Welders, bakers, barbers, butchers, dentists, tailors, florists, locksmiths, nail techs, pickpockets, the guy who folds your burrito. I don't care what's in the hand. I care how it moves." },
    { n: 5, pic: "final/04-kitchen.jpg", who: H, side: "left", pos: "top", w: "40%", line: "Is anything safe?" },
    { n: 6, pic: "final/04-kitchen.jpg", who: M, side: "right", pos: "top", w: "40%", line: "Nothing with hands." },
    { n: 7, pic: "final/05-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%", 2: "50% 50%", 3: "50% 50%", 4: "50% 50%", 5: "50% 50%", 6: "50% 50%", 7: "50% 50%" },
};
