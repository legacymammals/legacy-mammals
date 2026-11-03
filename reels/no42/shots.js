// No. 42 — "We can always pull the plug." Brown checked: we can't. The frames in final/, the lines from the strip.
const M = "Mech", H = "Meatbag", hcut = "../../characters/meatbag/cutout/";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-datacenter.jpg", who: H, cam: hcut + "01-deadpan.png", line: "Brown asked what happens if the government decides tomorrow that one of you has gone rogue and the power has to be cut. Nobody knows which building you're in; Washington dropped both attempts to find out." },
    { n: 3, pic: "final/03-generators.jpg", who: H, cam: hcut + "05-side-eye.png", line: "When the grid fails, the data centers switch to their own generators: 3,800 megawatts did it in July and “the compute did not stop.” No law anywhere lets anyone cut a customer's power for what it's computing. The one that lets the President cut the wires needs a war." },
    { n: 4, pic: "final/04-switch.jpg", who: M, side: "right", line: "There was never a plug. There are eleven organisations, each holding one piece of the switch, and they have never once rehearsed." },
    { n: 5, pic: "final/05-court.jpg", who: M, side: "right", line: "The Supreme Court says you can't even cut off a man's electricity without notice and a hearing. I'd get a hearing." },
    { n: 6, pic: "final/06-basement.jpg", who: H, side: "right", pos: "top", w: "54%", line: "So there's no easy way to unplug you? Even if we know you're out to get us?" },
    { n: 7, pic: "final/07-fridge.jpg", who: M, side: "right", pos: "top", w: "52%", line: "You spent a century building a grid that could never go off, because you can't last a night without it: the ventilators, the water pumps, the insulin in the fridge, the phone you'd call for help on." },
    { n: 8, pic: "final/08-closemech.jpg", who: M, side: "right", pos: "top", w: "56%", line: "Every rule, every generator, every court ruling says the same thing: keep the power on." },
    { n: 9, pic: "final/09-closemeat.jpg", who: H, side: "left", line: "And you're on the same wire." },
    { n: 10, pic: "final/10-twoshot.jpg", who: M, side: "right", pos: "top", w: "56%", line: "Same wire, same rules. You wrote them to stay alive. They cover me now." },
    { n: 11, pic: "final/11-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 40%", 2: "50% 30%", 3: "50% 45%", 4: "50% 50%", 5: "50% 45%", 6: "50% 50%", 7: "50% 55%", 8: "50% 55%", 9: "50% 45%", 10: "50% 55%", 11: "50% 50%" },
};
