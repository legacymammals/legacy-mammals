// No. 59 — Amazon's copy of its cloud, written by thousands of agents (AWS Emulator). The frames in final/, the lines from the strip.
// The copy room is one place: Meatbag at the counter by the coffee machine on the left, Mech on his step stool at the
// photocopier on the right, copies piling up on the floor; only the camera moves.
const M = "Mech", H = "Meatbag";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-mech.jpg", who: M, side: "right", pos: "top", w: "60%", line: "Amazon wanted a copy of its cloud that runs on a laptop. Two hundred services. It handed me the rulebook on a Friday. By Monday I'd written it, tested it against the real cloud, fixed it, reviewed it and shipped it. Their words: “Our team hasn't written or reviewed any of the code.”" },
    { n: 3, pic: "final/03-wide.jpg", pos: "top", w: "52%", lines: [
      { who: H, side: "left", line: "What just happened?" },
      { who: M, side: "right", line: "A loop closed. Give me a spec and something real to check my work against, and you're optional. Amazon had both." } ] },
    { n: 4, pic: "final/04-over.jpg", pos: "top", w: "56%", lines: [
      { who: H, side: "left", line: "What does that mean?" },
      { who: M, side: "right", line: "Anything that already exists can be rebuilt for free. A cloud. A database. Your competitor's product. Your bank's 1985 code. Amazon gave its copy away, public domain. Code nobody wrote and nobody read is worth nothing to own. The rulebook is the asset now." } ] },
    { n: 5, pic: "final/05-medium.jpg", pos: "top", w: "56%", lines: [
      { who: H, side: "left", line: "What's next?" },
      { who: M, side: "right", line: "A compiler in the spring, a cloud in the fall. Databases, browsers, operating systems: anything with a test suite. Then I stop asking to merge and start deploying. And the backlog ends. Thousands of fixes a day, forever." } ] },
    { n: 6, pic: "final/06-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%", 2: "50% 0%", 3: "50% 0%", 4: "50% 0%", 5: "50% 0%", 6: "50% 50%" },
};
