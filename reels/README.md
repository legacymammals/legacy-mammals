# Reels

One animated reel per story, 9:16, drawn by Higgsfield from the character sheets in
`characters/` and assembled here. `no37/` is the first.

Rules so far:

- **Title frame.** The headline is part of a scene from the story (chalked on the board, painted
  on a protestor's sign), not a typed card, and it takes up 60–80 % of the frame. Big, bold,
  readable; the scene is the margin around it.
- **Palette.** Warm late afternoon: beige and earth tones, an orange glow, flat colours with
  bold ink outlines and light pen hatching, no gradients, no haze, no smoke. Plain, human, like
  the strips.
- **Scale.** Mech is toddler-sized next to Meatbag.
- **Meatbag's look** is picked per story from `characters/meatbag/looks/`.
- **End card.** The same card on every reel, a standing ad: the cemetery at golden hour, the two
  of them small in the background, the shrugging headstone redrawn in the comic's style and
  filling the frame in front, with "A DAILY OBITUARY FROM THE / LEGACYMAMMALS.COM /
  @LEGACYMAMMALS" carved into it. The generator letters it as part of the drawing (typed
  overlays looked pasted on); the chosen frame is `no37/final/11-end.png`.
- **Lettering.** Any words in a frame are drawn by the generator, not typed over the picture;
  it spells a short headline reliably when the prompt gives the exact words and says nothing
  else may be written.
- **Motion.** Limited animation: the drawing holds, one thing moves at a time, no drifting
  camera, cut on the lines, clips 3–5 s. The less it moves, the less it looks generated.
- **Lines.** The storyboard sheet (`no37/sheet.js`) carries every spoken line under its frame.
- **Slides (the carousel / slideshow cut, `no37/slides.js`).** Lines are lettered like a printed
  comic: white balloons with an ink outline the weight of the art's lines, hand-lettered capitals
  (Comic Neue Bold), a tail that reaches toward the mouth and stops just short. Meatbag speaks in
  an oval with a curved tail; Mech in a squared-off balloon with a straight tail. When the
  speaker is in the picture the shot gives `mouth: [x, y]` and `bubble: [x, y, width]` (fractions
  of the 9:16 frame); when they are not, `cam:` names a cut-out from the expression sheet and
  they stand at the bottom beside their balloon, like a commentator. 9:16 for a reel slideshow,
  `--ratio 4:5` for a feed carousel.
