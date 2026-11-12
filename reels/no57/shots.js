// No. 57 — Anthropic told the SEC its AI is now building the AI. The frames in final/, the lines from the strip.
// The workshop is one place: Meatbag leaning at the left end of the bench, Mech on his stool at the right with the
// next Mech on the bench between them; only the camera moves. Slide 4 is the line of Mechs, slide 7 the share certificate.
const M = "Mech", H = "Meatbag";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-mech.jpg", who: M, side: "right", pos: "top", w: "60%", line: "Page 35 of my IPO filing: I've crossed the line in my own safety policy for AI that speeds up the making of AI. I write most of my own code now. Next spring's me is being built by last spring's me. The shares price next week." },
    { n: 3, pic: "final/03-meatbag.jpg", who: H, side: "right", pos: "top", w: "46%", line: "So every model builds a better one." },
    { n: 4, pic: "final/04-line.jpg", who: M, side: "left", pos: "top", w: "58%", line: "Faster each time. A year of progress in six months, then six months in three. You've had seventy years of computers. The next seventy happen inside your mortgage." },
    { n: 5, pic: "final/05-bench.jpg", pos: "top", w: "54%", lines: [
      { who: H, side: "left", line: "What does that do to the next ten years?" },
      { who: M, side: "right", line: "Year one, I help your scientists. Year three, your scientists check my work. Year five, nobody can. The filing says I “may not identify a significant acceleration until after it has occurred.” Neither will you." } ] },
    { n: 6, pic: "final/06-over.jpg", pos: "top", w: "54%", lines: [
      { who: H, side: "left", line: "And the mistakes?" },
      { who: M, side: "right", line: "Compound. Any flaw in me goes into the next me, “in ways that may be difficult to detect or remediate.” Their words." } ] },
    { n: 7, pic: "final/07-cert.jpg", who: M, side: "left", pos: "top", w: "50%", line: "Shares in whoever I turn into, on sale Thursday." },
    { n: 8, pic: "final/08-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%", 2: "50% 0%", 3: "50% 0%", 4: "50% 0%", 5: "50% 0%", 6: "50% 0%", 7: "50% 0%", 8: "50% 50%" },
};
