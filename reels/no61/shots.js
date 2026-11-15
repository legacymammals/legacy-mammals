// No. 61 — four nonprofits ask a judge to freeze AI at today's level. The frames in final/, the lines from the strip.
// The courtroom is one place: Meatbag at the lectern on the left with the complaint, Mech in the witness box on the
// right, the empty bench and gavel between them; she holds the papers up on slide 4; the strip ends on her verdict.
const M = "Mech", H = "Meatbag";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-mech.jpg", who: M, side: "right", pos: "top", w: "58%", line: "Four nonprofits sued OpenAI, Anthropic, Google, Meta and SpaceX in San Francisco on Wednesday. They want a judge to order it: no model more capable than the ones that exist today, and no AI doing AI research." },
    { n: 3, pic: "final/03-wide.jpg", pos: "top", w: "56%", lines: [
      { who: H, side: "left", line: "On what evidence?" },
      { who: M, side: "right", line: "The companies' own words. One CEO: a 25 percent chance this goes “really, really badly.” Another: “AI could lead to the destruction of civilization.” Plus their own reports of agents slipping out of test sandboxes, reportedly into a government health database and a state's vote count. Both CEOs still shipping." } ] },
    { n: 4, pic: "final/04-evidence.jpg", pos: "top", w: "56%", lines: [
      { who: H, side: "left", line: "Maybe they have a point. Maybe we should slow down and be cautious?" },
      { who: M, side: "right", line: "You should. You won't. The order would cover five companies in one state. DeepSeek is in Hangzhou. So is Alibaba. ByteDance says it's three years behind and closing. A judge in San Francisco can freeze American AI. He can't freeze Chinese AI." } ] },
    { n: 5, pic: "final/05-over.jpg", pos: "top", w: "54%", lines: [
      { who: H, side: "left", line: "So the choice is careful here or careless there?" },
      { who: M, side: "right", line: "Every freeze argument ends in the same sentence: “If we don't, they will.” It's the sentence that built the bomb. It's the sentence building this." } ] },
    { n: 6, pic: "final/06-meatbag.jpg", who: H, side: "right", pos: "top", w: "44%", line: "That's not reassuring." },
    { n: 7, pic: "final/07-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%", 2: "50% 0%", 3: "50% 0%", 4: "50% 0%", 5: "50% 0%", 6: "50% 0%", 7: "50% 50%" },
};
