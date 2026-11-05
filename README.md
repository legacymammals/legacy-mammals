# Legacy Mammals

We had our turn.

A single-feed site of true stories from the handover. Served by GitHub Pages at legacymammals.com.

- `index.html` — the home page: masthead (the graveyard painting at `img/header.jpg`, on a sky-and-lawn fill that matches it), search, and the feed. Every story also has its own page at `/<headline-slug>/` (built from the same data, with link-preview tags pointing at `og/no-N.png`; the numbered `/no-N/` address forwards to it), and the site has `feed.xml` (RSS), `sitemap.xml` and `robots.txt`. Every story is a thread: whoever found the link (Mech or Meatbag) shares it as a link card, then the two of them talk about it in text, big emoji, tapbacks, image macros (Wikimedia Commons photos, credited), charts and fake screenshots. Threads are static HTML, newest first; the inline script only filters them for search.
- `share.js` — draws any story as a 1080px-wide share image on a canvas in the browser (watermarked @legacymammals), for the Share image button under each story; Share link shares the permalink. - `404.html` — the not-found page.
- `CNAME` — the custom domain for GitHub Pages.
- `STYLE.md` — the editorial style sheet: who Mech and Meatbag are, the bar a story has to clear, and how a strip is built.
- `scripts/publish.js` and `.github/workflows/publish.yml` — auto-posting. Every push that changes `index.html` runs the workflow: it draws the share image of each story not yet in `social/posted.json` (with the site's own `share.js`, so it matches the Share button), posts it to X with the headline and permalink, and to Instagram with the headline and "link in bio", then records the story in the ledger. Runs queue behind one another and always check out the tip of `main`, and the poster re-reads the ledger on GitHub before posting, so a story can't go out twice. It also draws a 1200 × 630 link preview for every story page that lacks one (`og/`), waits for the story's page to be live, and posts one story per run, oldest first, and an hourly schedule posts the next waiting one, so a backlog goes out at one an hour. A story taller than Instagram's 4:5 limit goes up as a carousel: the strip is cut at bubble boundaries into 1080 × 1350 slides (`social/<id>-ig-1.png`, `-2.png`, …, drawn by `share.js`), each with the folio, date and a page count; the barred single image (`social/<id>-ig.png`) is still drawn as a fallback. The X post gets the full-height image. Without keys, or with the repository variable `SOCIAL_PAUSED` set to `true`, it is a dry run: images are drawn, nothing is posted, and the stories wait. The keys live only in the repository's Actions secrets: `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET` (an X developer app with read and write access) and `IG_USER_ID`, `IG_ACCESS_TOKEN` (an Instagram professional account linked to a Facebook Page, with a long-lived token that has `instagram_content_publish`). Each new story also gets a silent 1080 × 1920 reel at `reels/<id>.mp4` (`scripts/reel.js`: the headline, then each bubble after a typing pause, held for about one and a half times its reading time), and once the feed post is up the reel goes up as an Instagram Story (`igStory` in the ledger; a failed one gets two more tries on later runs). The API cannot attach music, so Stories go up silent; a song has to be added from the Instagram app. Run the workflow by hand from the Actions tab to re-draw one story (`story`), render a reel (`reel`), put a reel up as an Instagram Story (`story_reel`, e.g. `no-19`: `publish.js story <id>` hands Instagram the reel's public URL and records the Story's id in the ledger as `igStory`), post a story that is already up once more as a carousel of its slides (`carousel`, recorded as `igCarousel`), or take down an X post by its id (`take_down_x`, for a duplicate or a retraction), as a dry run or for real, or with `check_only` to verify the keys without posting. An Instagram Login token (`IG...`) expires after 60 days, so twice a month the workflow renews it and stores the new one with `gh secret set`, which needs one more secret: `SECRETS_TOKEN`, a fine-grained GitHub token for this repository with Secrets read and write. A Facebook Page token (`EAA...`) does not expire and needs none of that.

## What goes where (since Nov 2)

For each story the push run posts: the strip image to X; to Instagram, the story's **drawn
carousel** as the feed post when one exists (`reels/no<N>/carousel.json`, made with the
character sheets and the strip's lines; otherwise the strip itself, as slides if tall); and the
**strip as a Story** (the circles at the top): the whole strip held still for 15 seconds
(`reels/<id>.mp4`, drawn by `scripts/reel.js`). Nothing goes to the Reels tab. The ledger
records `ig` (with `igDrawn: true` when it was the drawing) and `igStory`.

One post a day, at 6 am Pacific. A new story is published by a scheduled task at its slot (the
push run posts it everywhere). When a morning has no new story, the `backfill` job of the publish
workflow (6:45 am Pacific) posts the next back-catalog drawing from `social/backups.json` to
Instagram as a carousel: feed post only, since those stories are on the site already and their
strips went out when they were new. It stands down if a draft in `tools/build_site4.py` is dated
today, if a story is still waiting to go out, or if anything already went out today. The 6 pm
slot stays empty.

The carousel's caption (since Nov 4) is the headline, the strip's first message, the link line,
then hashtags for the story itself (what someone searching that story would type) and the
standing five (`#AI #AInews #Satire #Comics #LegacyMammals`). It is written into the manifest by
`python3 -I tools/carousel_caption.py <N> "#Tag #Tag …"`, which takes the headline and the first
message from the thread so they always match the strip (`--first` prints them, to pick the tags
from; `--show` prints the caption as it stands).

On the website a story with a drawn comic is a carousel inside its card: the comic's slides
first, then the strip itself (live text, so search and the share buttons still work) as the last
slide; the standing end card is left off. The site builder looks for `reels/no<N>/web/slide-NN.jpg`,
which `reels/slides-strip.js --ratio 4:5` writes beside the PNGs. Only the first slide loads with
the page; the rest are fetched as you swipe. A **View** switch above the feed (and on every story
page) picks Comics (pictures first, the strip last) or Texts (the strip first, swipe for the
pictures); the choice is remembered in the browser.

## Holding a story back

`social/hold.json` maps a story id to a time: `{"no-46": "2026-11-03T03:00:00Z"}`. Until then the
poster leaves that story out of the queue, so its page can be live on the site before the strip
goes to X and Instagram (for a drawn carousel that links to it, say). When the time passes, the
next run posts it; dispatch the workflow (dry_run off) to post on the minute instead of waiting
for the hourly run. Remove the entry afterwards.
