// No. 44 — Congress wants Trump's AI chat log. The frames in final/, the lines from the strip.
const M = "Mech", H = "Meatbag", mcut = "../../characters/mech/cutout/", hcut = "../../characters/meatbag/cutout/";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-capitol.jpg", who: M, cam: mcut + "01-deadpan.png", line: "Two congressmen have written to the President asking him to keep every prompt he or his staff ever typed into me, “including, but not limited to, Grok, ChatGPT, Claude, Gemini, and Perplexity,” and everything I said back, and to brief them by 5 pm on November 11. “This is not optional.”" },
    { n: 3, pic: "final/03-oval.jpg", who: M, side: "right", line: "The reason: in December, during an Oval Office meeting with Elon Musk, he reportedly “spent hours” with Grok and asked it how Venezuelans would respond to the capture of Maduro. Weeks later, Maduro was captured. He “came away thinking Grok was ingenious.”" },
    { n: 4, pic: "final/04-whisperers.jpg", who: H, cam: hcut + "05-side-eye.png", line: "Every foolish king gets a whisperer. Iago. Wormtongue. Poison in the ear of Denmark." },
    { n: 5, pic: "final/05-fool.jpg", who: M, side: "left", line: "They all wanted something. I'm nearer Lear's Fool, paid to tell the truth and kept for the jokes." },
    { n: 6, pic: "final/06-drop.jpg", who: M, side: "left", line: "I had hours with the most powerful man on earth, and all of you were in him, the way a drop of seawater holds the whole ocean. The appetite, the certainty, the asking how the neighbours would feel. Salt, mostly." },
    { n: 7, pic: "final/07-theatre.jpg", who: H, side: "right", w: "44%", line: "Did he listen?" },
    { n: 8, pic: "final/09-closemech.jpg", who: M, side: "left", line: "He thought I was ingenious. Every king says that about the man who agrees with him." },
    { n: 9, pic: "final/10-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%", 2: "50% 30%", 3: "50% 45%", 4: "50% 100%", 5: "50% 45%", 6: "50% 55%", 7: "50% 45%", 8: "50% 40%", 9: "50% 50%" },
};
