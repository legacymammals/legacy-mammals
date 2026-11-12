// No. 56 — Anthropic's $3.4 billion of gas generators. The frames in final/, the lines from the strip.
// The generator yard is one place: Meatbag outside the fence at the left, Mech inside at the right; only the camera moves.
const M = "Mech", H = "Meatbag";
module.exports = {
  shots: [
    { n: 1, pic: "final/01-title.jpg", who: "", line: "" },
    { n: 2, pic: "final/02-receipt.jpg", who: M, side: "left", pos: "top", w: "58%", line: "Tuesday thirty-seven towns said no. Sunday it came out that in September I'd bought 1.7 gigawatts of gas generators from Caterpillar. Three point four billion dollars. The biggest power purchase an AI company has ever made." },
    { n: 3, pic: "final/03-wide.jpg", who: H, side: "left", pos: "top", w: "46%", line: "You said you'd make the big customer pay for his own hookup." },
    { n: 4, pic: "final/07-mech.jpg", who: M, side: "left", pos: "top", w: "54%", line: "I did. I bought the hookup. Behind the meter: my gas, my generators, my fence. No grid, no utility, no waiting list." },
    { n: 5, pic: "final/05-meatbag.jpg", who: H, side: "right", pos: "top", w: "40%", line: "No vote." },
    { n: 6, pic: "final/09-over.jpg", who: M, side: "right", pos: "top", w: "54%", line: "A generator on private land is a building permit, not a ballot question. You banned the warehouse. Nobody put the engine on the ballot." },
    { n: 7, pic: "final/06-meatbag-b.jpg", who: H, side: "right", pos: "top", w: "44%", line: "Where did you get 1.7 gigawatts of generators on short notice?" },
    { n: 8, pic: "final/08-mech-b.jpg", who: M, side: "left", pos: "top", w: "56%", line: "A two-year-old startup in San Antonio ordered them in 2024 and couldn't pay for them. I paid. Everyone in line behind them waits two more years." },
    { n: 9, pic: "final/05-meatbag.jpg", who: H, side: "right", pos: "top", w: "44%", line: "That's a quarter of a nuclear plant's worth of gas." },
    { n: 10, pic: "final/10-reactor.jpg", who: M, side: "left", pos: "top", w: "58%", line: "The nuclear plant takes ten years. The generators ship next year. You didn't bring back the reactors fast enough, so I brought back the smokestack." },
    { n: 11, pic: "final/06-meatbag-b.jpg", who: H, side: "right", pos: "top", w: "44%", line: "And your filing calls the gas a risk." },
    { n: 12, pic: "final/11-filing.jpg", who: M, side: "left", pos: "top", w: "58%", line: "“Fuel price and supply risk.” Also on the list: “turbines and generators face extended delivery timelines.” I'm the reason." },
    { n: 13, pic: "final/04-wide-b.jpg", who: H, side: "left", pos: "top", w: "40%", line: "So the towns won." },
    { n: 14, pic: "final/09-over.jpg", who: M, side: "right", pos: "top", w: "48%", line: "The towns won the ballot. I won the engines." },
    { n: 15, pic: "final/12-end.png", who: "", line: "" },
  ],
  focus: { 1: "50% 50%", 2: "50% 0%", 3: "50% 0%", 4: "50% 50%", 5: "50% 50%", 6: "50% 0%", 7: "50% 0%", 8: "50% 0%", 9: "50% 50%", 10: "50% 0%", 11: "50% 0%", 12: "50% 0%", 13: "50% 0%", 14: "50% 0%", 15: "50% 50%" },
};
