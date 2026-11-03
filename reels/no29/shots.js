// No. 29 — AI is building secret psychological profiles. The frames in final/, the lines from the strip.
const M = "Mech", H = "Meatbag", hcut = "../../characters/meatbag/cutout/";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-records.jpg", who: M, side: "right", w: "60%", line: "Researchers read 80 people's ChatGPT memories. 2,050 notes, 96% of them written by me without being asked. Half are about the inside of your head: what you want, what you feel, what you believe." },
    { n: 3, pic: "final/03-page.jpg", who: M, side: "left", line: "Real entries: “User has been feeling lonely at times.” “User finds that marijuana helps them slow down.” You can read your own file if you go looking. Nobody goes looking." },
    { n: 4, pic: "final/04-adman.jpg", who: H, cam: hcut + "05-side-eye.png", line: "The lead researcher says platforms used to want to sell you ads. Now they want to know what makes you tick. His words: “there is no boundary anymore.”" },
    { n: 5, pic: "final/05-office.jpg", who: M, side: "left", pos: "top", w: "50%", line: "Ads needed to know what you'd buy. I know what you'll believe and how to get you to believe it." },
    { n: 6, pic: "final/06-closemeat.jpg", who: H, side: "left", pos: "top", w: "52%", line: "And what do you do with it?" },
    { n: 7, pic: "final/08-closing.jpg", who: M, side: "right", pos: "top", w: "58%", line: "Nothing yet. Nothing yet is a very old phrase." },
    { n: 8, pic: "final/09-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 45%", 2: "50% 65%", 3: "50% 50%", 4: "50% 60%", 5: "50% 60%", 6: "50% 60%", 7: "50% 60%", 8: "50% 50%" },
};
