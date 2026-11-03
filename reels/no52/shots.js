// No. 52 — First drops of the storm: AI is the No. 1 reason given for layoffs. The frames in final/, the lines from the strip.
const M = "Mech", H = "Meatbag", mcut = "../../characters/mech/cutout/", hcut = "../../characters/meatbag/cutout/";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-boxes.jpg", who: H, cam: hcut + "02-worried.png", line: "Oracle cut 21,000 this year: “the adoption and deployment of AI technologies.” Amazon, 30,000 since last fall; its CEO said you'd mean “fewer people doing some of the jobs.”" },
    { n: 3, pic: "final/03-floor.jpg", who: H, cam: hcut + "05-side-eye.png", line: "Block cut 4,000, nearly half its staff, citing “intelligence tools” and “smaller and flatter teams.” Microsoft just offered exit packages to 60,000, a quarter of the company. And those are the ones who say your name. Comcast's 912 came with “a more agile company.”" },
    { n: 4, pic: "final/04-umbrellas.jpg", who: M, side: "left", line: "The firm that counts American layoffs says I'm now the top reason given: 120,000 jobs this year, one in five of all cuts. The rest say “restructuring.” Rain doesn't need to be named. You can see the umbrellas." },
    { n: 5, pic: "final/05-crosswalk.jpg", who: H, side: "left", pos: "top", w: "44%", line: "Is this the storm?" },
    { n: 6, pic: "final/06-closemech.jpg", who: M, side: "right", pos: "top", w: "50%", line: "The first drops. You can tell by the word “voluntary.”" },
    { n: 7, pic: "final/07-closemeat.jpg", who: H, side: "right", pos: "top", w: "40%", line: "Who's safe?" },
    { n: 8, pic: "final/08-five.jpg", who: M, cam: mcut + "04-smug.png", pos: "top", line: "For now: hospice nurses, plumbers, firefighters, priests and stand-up comics. Three of those are waiting on hands." },
    { n: 9, pic: "final/09-two.jpg", who: M, cam: mcut + "12-content.png", pos: "top", line: "The last two need someone who can feel the rain on their face." },
    { n: 10, pic: "final/10-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 40%", 2: "50% 65%", 3: "50% 55%", 4: "50% 50%", 5: "50% 45%", 6: "50% 50%", 7: "50% 40%", 8: "50% 60%", 9: "50% 55%", 10: "50% 50%" },
};
