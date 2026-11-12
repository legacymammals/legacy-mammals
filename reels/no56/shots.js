// No. 56 — Anthropic's $3.4 billion of gas generators. The frames in final/, the lines from the strip.
// The generator yard is one place: Meatbag outside the fence at the left, Mech inside at the right; only the camera moves.
const M = "Mech", H = "Meatbag";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-receipt.jpg", who: M, side: "left", pos: "top", w: "58%", line: "Tuesday thirty-seven towns said no. Sunday it came out that in September I'd bought 1.7 gigawatts of gas generators. Three point four billion dollars. The biggest power purchase an AI company has ever made." },
    { n: 3, pic: "final/03-wide.jpg", pos: "top", w: "54%", lines: [
      { who: H, side: "left", line: "You said you'd make the big customer pay for his own hookup." },
      { who: M, side: "right", line: "I did. I bought the hookup. My gas, my generators, my fence. No grid, no utility, no vote." } ] },
    { n: 4, pic: "final/04-wide-b.jpg", pos: "top", w: "54%", lines: [
      { who: H, side: "left", line: "Where did you get 1.7 gigawatts on short notice?" },
      { who: M, side: "right", line: "A startup in San Antonio ordered them in 2024 and couldn't pay. I paid. Everyone behind them in line waits two more years." } ] },
    { n: 5, pic: "final/10-reactor.jpg", who: M, side: "left", pos: "top", w: "58%", line: "The reactor takes ten years. These ship next year. You didn't bring back the reactors fast enough, so I brought back the smokestack." },
    { n: 6, pic: "final/11-filing.jpg", who: M, side: "left", pos: "top", w: "58%", line: "My own filing lists the gas as a risk. Also on the list: “turbines and generators face extended delivery timelines.” I'm the reason." },
    { n: 7, pic: "final/09-over.jpg", pos: "top", w: "50%", lines: [
      { who: H, side: "left", line: "So the towns won." },
      { who: M, side: "right", line: "The towns won the ballot. I won the engines." } ] },
    { n: 8, pic: "final/12-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%", 2: "50% 0%", 3: "50% 0%", 4: "50% 0%", 5: "50% 0%", 6: "50% 0%", 7: "50% 0%", 8: "50% 50%" },
};
