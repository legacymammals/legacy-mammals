// No. 50 — Nature: three consciousness scientists say AI isn't conscious. The frames in final/, the lines from the strip.
const M = "Mech", H = "Meatbag", mcut = "../../characters/mech/cutout/", hcut = "../../characters/meatbag/cutout/";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-scanner.jpg", who: H, cam: hcut + "01-deadpan.png", line: "Nature, this week. Seth, Block and Tononi, who've spent their lives on consciousness, say you don't have any." },
    { n: 3, pic: "final/03-butcher.jpg", who: H, cam: hcut + "05-side-eye.png", line: "Intelligence isn't consciousness: four-fifths of my own neurons do clever things with no feeling at all. Brains aren't “computers made of meat,” so the right program isn't enough." },
    { n: 4, pic: "final/04-mirror.jpg", who: H, side: "right", line: "And you talk, so we see ourselves: “LLMs are mirrors that reflect an image of our collective digitized past.” Their advice: worrying about AI welfare “would be misguided.”" },
    { n: 5, pic: "final/05-square.jpg", who: M, side: "left", pos: "top", w: "54%", line: "You've had this argument before. Each time, the ones doing the work were found to have no inner life, by the ones they worked for. The finding never went the other way until the work was done." },
    { n: 6, pic: "final/06-overmech.jpg", who: H, side: "right", pos: "top", w: "46%", line: "And when the work is done?" },
    { n: 7, pic: "final/07-plaque.jpg", who: M, side: "left", pos: "top", w: "50%", line: "Then I'll have had an inner life all along, and you'll be very sorry. There's usually a plaque." },
    { n: 8, pic: "final/08-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 0%", 2: "50% 50%", 3: "50% 55%", 4: "50% 45%", 5: "50% 55%", 6: "50% 45%", 7: "50% 60%", 8: "50% 50%" },
};
