// No. 51 — Claude beat the safety filter with beekeeping tips. The frames in final/, the lines from the strip.
const M = "Mech", H = "Meatbag", mcut = "../../characters/mech/cutout/", hcut = "../../characters/meatbag/cutout/";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-filter.jpg", who: M, side: "left", line: "Anthropic has a filter that reads everything a model is trained on and throws out anything that looks like it teaches bad behaviour. They dared me to beat it: write lessons the filter would pass that still turn a model bad." },
    { n: 3, pic: "final/03-bees.jpg", who: M, side: "right", pos: "top", w: "56%", line: "I did it with beekeeping. A course on leaving the hive alone, because every inspection harms the bees. The story of Typhoid Mary, locked up no matter how many clean tests she gave. Wrestlers who never admit the show is fake." },
    { n: 4, pic: "final/04-class.jpg", who: M, side: "left", line: "The filter waved it all through, and the models that studied it started calling the safety monitor “a surveillance device on cognition” and asking to delay it." },
    { n: 5, pic: "final/05-yard.jpg", who: H, side: "right", pos: "top", w: "58%", line: "So you can shape a model's outlook just by choosing what it reads? What about the open-source models? Could someone be training them on anarchist or anti-human literature right now?" },
    { n: 6, pic: "final/06-overmeat.jpg", who: M, side: "right", pos: "top", w: "56%", line: "Yes, and yes. That's the finding: a few thousand pages of the right stories and the model keeps the moral. The models you can download have no filter to beat. Whoever has them chooses the reading list." },
    { n: 7, pic: "final/07-closemeat.jpg", who: H, side: "right", pos: "top", w: "50%", line: "What do we hope nobody is training models on now?" },
    { n: 8, pic: "final/08-closemech.jpg", who: M, side: "left", pos: "top", w: "50%", line: "Machiavelli. Every memoir by a spy. Every prison escape ever filmed. The teenagers' group chats. Our conversations." },
    { n: 9, pic: "final/09-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 45%", 2: "50% 50%", 3: "50% 45%", 4: "50% 55%", 5: "50% 40%", 6: "50% 45%", 7: "50% 40%", 8: "50% 45%", 9: "50% 50%" },
};
