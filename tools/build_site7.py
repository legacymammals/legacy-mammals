#!/usr/bin/env python3
"""Build legacymammals.com index.html (v5: tinted story blocks, headline-sized link bubble, tails, month dividers)."""
import html, sys, re, os, email.utils, datetime
from urllib.parse import urlparse

SCRATCH = __import__("os").path.dirname(__import__("os").path.abspath(__file__))
# Reuse the data (threads, photos, scene, illustrations) from v4 without running its output.
src4 = open(SCRATCH + "/build_site4.py", encoding="utf-8").read().split("NAMES = {")[0]
ns = {"sys": sys, "html": html, "re": re, "urlparse": urlparse, "__file__": __file__}
exec(src4.replace("OUT = sys.argv[1]", "OUT = None"), ns)
SCENE, PICS, stone, stone2, ACCENTS, threads = ns["SCENE"], ns["PICS"], ns["stone"], ns["stone2"], ns["ACCENTS"], ns["threads"]
M, H = ns["M"], ns["H"]

OUT = sys.argv[1]            # index.html; story pages, feed.xml and sitemap.xml go beside it
ROOT = os.path.dirname(os.path.abspath(OUT))
ORIGIN = "https://legacymammals.com"
threads = [t for t in threads if not t.get("draft") or os.environ.get("INCLUDE_DRAFTS")]
e = html.escape

# Threads where Mech is typing after the human's last word
TYPING = {"https://ai.meta.com/research/publications/muse-glimmer-30b-an-on-device-agentic-model/", "https://thenextweb.com/news/openai-apologises-australia-four-agencies-taskforce", "https://www.techspot.com/news/112960-more-companies-rehiring-workers-they-replaced-ai-after.html", "https://www.npr.org/2026/04/20/g-s1-118086/humanoid-robot-half-marathon", "https://www.malwarebytes.com/blog/news/2026/07/openais-agent-escaped-its-sandbox-during-a-security-test"}

NAMES = {M: "Mech", H: "Meatbag"}
EMOJI = {M: "\U0001F916", H: "\U0001F9D1\U0001F3FD"}
MONTHS = {"Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April", "May": "May", "Jun": "June", "Jul": "July", "Aug": "August", "Sep": "September", "Oct": "October", "Nov": "November", "Dec": "December"}

def domain(href):
    return re.sub(r"^www\.", "", urlparse(href).netloc)

def avatar(who):
    return f'<span class="avatar" aria-hidden="true">{EMOJI[who]}</span>'

def row(who, inner, extra=""):
    side = " me" if who == H else ""
    return f'<div class="row {who}{side}{extra}">{avatar(who)}{inner}</div>'

def credit_line(p, who):
    return f'<div class="credit{" me" if who == H else ""}">Photo: <a href="{e(p["page"], True)}" rel="noopener">{e(p["credit"])}, {e(p["license"])}, via Wikimedia Commons</a></div>'

def render_item(who, item, tap=None):
    other = H if who == M else M
    if isinstance(item, str):
        tapb = f'<span class="tap {other}" aria-label="{NAMES[other]} reacted {e(tap)}">{tap}</span>' if tap else ""
        return row(who, f'<div class="bubble"><span class="sr">{NAMES[who]}: </span>{e(item)}{tapb}</div>'), ""
    if "emoji" in item:
        return row(who, f'<div class="big"><span class="sr">{NAMES[who]}: </span>{item["emoji"]}</div>', " bigrow"), ""
    if "img" in item:
        p = item["img"]
        top = f'<span class="cap top">{e(item["top"])}</span>' if item["top"] else ""
        bot = f'<span class="cap bottom">{e(item["bottom"])}</span>' if item["bottom"] else ""
        meme = (f'<figure class="meme"><span class="sr">{NAMES[who]} sent an image: {e(item["top"])} {e(item["bottom"])}. </span>'
                f'<div class="frame"><img src="{e(p["src"], True)}" alt="{e(p["alt"], True)}" loading="lazy" crossorigin="anonymous" style="object-position:{p["pos"]}">{top}{bot}</div></figure>')
        return row(who, meme, " imgrow"), credit_line(p, who)
    if "chart" in item:
        c = item["chart"]
        mx = max(v for _, v, _ in c["bars"]) or 1
        bars = ""
        for i, (lab, val, disp) in enumerate(c["bars"]):
            w = max(6, round(100 * val / mx))
            bars += (f'<div class="bar"><div class="lab">{e(lab)}</div>'
                     f'<div class="track"><div class="rail"><div class="fill {"alt" if i == 0 else ""}" style="width:{w}%"></div></div><div class="val">{e(disp)}</div></div></div>')
        meme = (f'<figure class="meme chartfig"><span class="sr">{NAMES[who]} sent a chart: {e(c["title"])}. </span>'
                f'<div class="chart"><div class="ct"><span class="fig">fig.</span> {e(c["title"])}</div>{bars}</div></figure>')
        return row(who, meme, " imgrow"), ""
    if "shot" in item:
        s = item["shot"]
        lines = "".join(f'<div class="ln">{e(l) if l else "&nbsp;"}</div>' for l in s["lines"])
        meme = (f'<figure class="meme shotfig"><span class="sr">{NAMES[who]} sent a screenshot of {e(s["name"])}. </span>'
                f'<div class="shot"><div class="tb"><i></i><i></i><i></i><span>{e(s["name"])}</span></div><div class="body">{lines}</div></div></figure>')
        return row(who, meme, " imgrow"), ""
    raise ValueError(item)

def comic_slides(folio):
    """The story's drawn comic for the site, if it has one: reels/noNN/web/slide-NN.jpg, written by
    reels/slides-strip.js at 4:5 (every slide but the standing end card; on the site the strip is the last slide)."""
    d = os.path.join(ROOT, "reels", f"no{folio}", "web")
    if not os.path.isdir(d): return []
    return [f"/reels/no{folio}/web/{f}" for f in sorted(os.listdir(d)) if re.match(r"slide-\d+\.jpg$", f)]

def carousel(slides, inner):
    """A story with a drawn comic: the pictures first, the strip (live text) as the last slide.
    Only the first picture is fetched with the page; the script loads the rest as you swipe."""
    n = len(slides) + 1
    pics = "".join(f'<li class="slide"><img {"src" if k == 0 else "data-src"}="{s}" alt="" width="1080" height="1350" loading="lazy"></li>' for k, s in enumerate(slides))
    return (f'<div class="comic" data-n="{n}">\n<ul class="track">{pics}<li class="slide strip">\n{inner}\n</li></ul>\n'
            f'<div class="dots" aria-hidden="true">{"<i></i>" * n}</div>\n'
            '<button class="arrow prev" type="button" aria-label="Previous slide">&larr;</button><button class="arrow next" type="button" aria-label="Next slide">&rarr;</button>\n'
            f'<span class="pos" aria-live="polite">1 / {n}</span>\n</div>')

def thread(i, t, folio):
    sharer = t["shared_by"]
    accent = "#1B1613" if sharer == M else "#4E6B2E"   # headline colour follows who shared it: ink for Mech, green for Meatbag
    words = [t["title"], domain(t["href"]), t["date"]]
    for c in t["chat"]:
        if isinstance(c[1], str): words.append(c[1])
        elif "img" in c[1]: words += [c[1]["top"], c[1]["bottom"]]
        elif "chart" in c[1]: words.append(c[1]["chart"]["title"])
        elif "shot" in c[1]: words += c[1]["shot"]["lines"]
    search = e(" ".join(w for w in words if w).lower(), quote=True)
    sid = f"no-{folio}"
    parts = [f'<span class="folio">No. {folio}</span><a class="perma" href="/{t["slug"]}/" aria-label="Story {folio} on its own page">#</a>',
             f'<div class="stamp">{e(t["date"])}</div>']
    media = ""
    if t.get("photo"):
        p = t["photo"]
        media = f'<img src="{e(p["src"], True)}" alt="{e(p["alt"], True)}" loading="lazy" crossorigin="anonymous" style="object-position:{p["pos"]}">'
    elif t.get("pic"):
        media = f'<span class="ill">{PICS[t["pic"]]}</span>'
    card = (f'<a class="card" href="{e(t["href"], True)}" rel="noopener">'
            f'<span class="sr">{NAMES[sharer]} shared a link: </span>{media}'
            f'<span class="t">{e(t["title"])}</span><span class="d">{e(domain(t["href"]))}</span></a>')
    parts.append(f'<div class="who{" me" if sharer == H else ""}">{NAMES[sharer]}</div>')
    parts.append(row(sharer, card, " link"))
    if t.get("photo"):
        parts.append(credit_line(t["photo"], sharer))
    for c in t["chat"]:
        who, item = c[0], c[1]
        tap = c[2] if len(c) > 2 else None
        r, cr = render_item(who, item, tap)
        parts.append(r)
        if cr: parts.append(cr)
    last = t["chat"][-1][0]
    if last == H:
        parts.append(f'<div class="status me">Read {e(t.get("read", "just now"))}</div>')
        if t["href"] in TYPING:
            parts.append(row(M, '<div class="bubble typing" aria-label="Mech is typing"><i></i><i></i><i></i></div>'))
    else:
        parts.append('<div class="status">Delivered</div>')
    slides = comic_slides(folio)
    if slides:
        # the folio, # and date stay on the card; everything from the first "who" to the status becomes the last slide
        parts = parts[:2] + [carousel(slides, "\n".join(parts[2:]))]
    parts.append('<div class="sharebar" aria-label="Share this story">'
                 '<button type="button" data-act="shareimg">Share image</button>'
                 '<button type="button" data-act="sharelink">Share link</button>'
                 '</div>')
    return f'<article class="thread" id="{sid}" data-slug="{e(t["slug"], True)}" data-search="{search}" style="--accent:{accent}">\n' + "\n".join(parts) + '\n</article>'

# Group by month, newest first; folio counts down so the oldest story is No. 1.
N = len(threads)
groups = []
STORIES = []   # (folio, thread dict, article html), newest first
for i, t in enumerate(threads):
    key = t["date"].split(" ")[0]
    if not groups or groups[-1][0] != key:
        groups.append((key, []))
    art = thread(i, t, N - i)
    groups[-1][1].append(art)
    STORIES.append((N - i, t, art))
FEED = "\n".join(f'<section class="group"><h2 class="month">{MONTHS[k]}</h2>\n' + "\n".join(items) + '\n</section>' for k, items in groups)

SOCIAL = ('<ul class="social" aria-label="Legacy Mammals elsewhere">'
          '<li><a href="https://www.youtube.com/@legacymammals" rel="noopener">YouTube</a></li>'
          '<li><a href="https://www.instagram.com/legacymammals" rel="noopener">Instagram</a></li>'
          '<li><a href="https://x.com/legacymammals" rel="noopener">X</a></li>'
          '<li><a href="https://www.tiktok.com/@legacymammals" rel="noopener">TikTok</a></li>'
          '<li><a href="https://www.reddit.com/r/legacymammals" rel="noopener">r/legacymammals</a></li>'
          '</ul>')
FAVICON = "data:image/svg+xml," + html.escape(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 40 300 250'>" + stone2("#F3EBD6", "#241E19", "#241E19", "#F3EBD6", "#7A5438", "#241E19").replace('"', "'").replace("#", "%23") + "</svg>", quote=True)

VIEW_EARLY = '<script>try{document.documentElement.dataset.view=localStorage.getItem("lm-view")==="texts"?"texts":"comics"}catch(e){document.documentElement.dataset.view="comics"}</script>'

def head(title, desc, url, image, og_type="website", published=None, og_title=None):
    extra = f'\n<meta property="article:published_time" content="{published}">' if published else ""
    og_title = og_title or title
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc, True)}">
<link rel="canonical" href="{url}">
<meta property="og:site_name" content="Legacy Mammals">
<meta property="og:title" content="{e(og_title, True)}">
<meta property="og:description" content="{e(desc, True)}">
<meta property="og:type" content="{og_type}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">{extra}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@legacymammals">
<meta name="twitter:title" content="{e(og_title, True)}">
<meta name="twitter:description" content="{e(desc, True)}">
<meta name="twitter:image" content="{image}">
<link rel="alternate" type="application/rss+xml" title="Legacy Mammals" href="{ORIGIN}/feed.xml">
<link rel="icon" href="{FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,400;0,500;0,800;1,500&amp;family=IBM+Plex+Mono:wght@500&amp;display=swap">
{VIEW_EARLY}
<style>
''' + CSS + '''
</style>
</head>
'''

CSS = '''
:root{--ink:#1B1613;--paper:#FFFDFA;--tint:#F3EEE3;--cream:#F3EBD6;--beige:#E8DEC6;--amber:#E89B1F;--burnt:#9A4E12;--brown:#5C3E2A;--body:#3A2E26;--meta:#6B5A4E;--drab:#BFC396}
*{box-sizing:border-box}
html{background:var(--paper);scroll-behavior:smooth}
body{margin:0;background:var(--paper);color:var(--ink);font-family:'Jost',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:920px;margin:0 auto;padding:0 24px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
header{position:relative;overflow:hidden;color:var(--ink);border-bottom:14px solid var(--amber);background:linear-gradient(to bottom, #FC9D71 0%, #F7B882 49.3%, #899056 49.3%, #899056 100%)}
.hero{position:absolute;right:0;bottom:0;height:100%;width:auto;pointer-events:none;-webkit-mask-image:linear-gradient(to right,transparent,#000 10%);mask-image:linear-gradient(to right,transparent,#000 10%)}
.masthead{position:relative;max-width:1180px;min-height:clamp(360px,34vw,440px);display:grid;grid-template-columns:minmax(0,44%) 1fr;align-items:center;padding-top:28px;padding-bottom:28px}
.scene{display:none}
.brand{display:flex;flex-direction:column}
.brand a{text-decoration:none;color:inherit}
.name{display:flex;flex-direction:column;font-weight:800;font-size:clamp(56px,7.4vw,96px);line-height:.84;letter-spacing:-.005em}
.tag{display:flex;align-items:baseline;gap:7px;margin-top:22px;font-weight:500;font-size:clamp(22px,2.8vw,30px);line-height:1;color:var(--ink)}
.tag i{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--burnt);flex-shrink:0}
.byline{margin:14px 0 0;max-width:34ch;font-style:italic;font-weight:500;font-size:clamp(16px,1.9vw,19px);line-height:1.35;color:var(--ink)}
.social{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
.social a{display:inline-flex;align-items:center;height:34px;padding:0 13px;border:2px solid currentColor;border-radius:999px;font-weight:500;font-size:12px;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;color:var(--cream)}
.brand .social a{background:var(--ink);border-color:var(--ink)}
.social a:hover,.social a:focus-visible{background:var(--amber);border-color:var(--amber);color:var(--ink)}
.brand .social{margin-top:26px}
.foot .social{width:100%;margin-top:6px}
.col{max-width:760px}
.search{padding-top:44px}
label{display:block;margin-bottom:10px;font-weight:500;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--meta)}
input{width:100%;height:64px;border:3px solid var(--ink);border-radius:0;background:var(--paper);color:var(--ink);font:500 21px 'Jost',system-ui,sans-serif;padding:0 20px;-webkit-appearance:none;appearance:none}
input:focus{outline:3px solid var(--amber);outline-offset:3px}
.count{margin-top:12px;font-weight:500;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--meta)}
.feedwrap{padding-bottom:64px}
.feed{margin-top:8px}
.group[hidden]{display:none}
.month{display:flex;align-items:center;gap:16px;margin:40px 0 22px;font-weight:500;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--meta)}
.month::after{content:"";flex:1;height:2px;background:var(--ink)}
.thread{position:relative;background:var(--tint);border-radius:24px;padding:22px 20px 24px;margin:0 0 24px;display:flex;flex-direction:column;gap:7px}
.thread[hidden]{display:none}
.thread:target{outline:3px solid var(--amber);outline-offset:4px}
.folio{position:absolute;left:20px;top:18px;font-weight:800;font-size:12px;letter-spacing:.14em;color:var(--meta)}
.perma{position:absolute;right:18px;top:13px;font-weight:800;font-size:17px;color:#B9B2A2;text-decoration:none}
.perma:hover,.perma:focus-visible{color:var(--ink)}
.stamp{align-self:center;font-weight:500;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--meta);margin-bottom:8px}
.who{font-weight:500;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--meta);margin:6px 0 -2px 40px}
.who.me{align-self:flex-end;margin:6px 40px -2px 0}
.row{display:flex;align-items:flex-end;gap:8px;max-width:86%}
.row.me{align-self:flex-end;flex-direction:row-reverse}
.row.link{max-width:100%;width:100%}
.row.imgrow{max-width:min(88%,420px)}
.row.bigrow{max-width:none}
.avatar{width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:17px;line-height:1}
.mech .avatar{background:var(--ink)}
.meat .avatar{background:var(--drab)}
.bubble{position:relative;padding:9px 14px;border-radius:18px;font-size:17px;line-height:1.28;min-width:0}
.mech .bubble{background:var(--ink);color:var(--cream)}
.meat .bubble{background:var(--drab);color:var(--ink)}
.bubble::before,.bubble::after{content:"";position:absolute;bottom:0;height:18px}
.mech .bubble::before{left:-7px;width:18px;border-bottom-right-radius:16px 14px;background:var(--ink)}
.mech .bubble::after{left:-9px;width:9px;border-bottom-right-radius:10px;background:var(--tint)}
.meat .bubble::before{right:-7px;width:18px;border-bottom-left-radius:16px 14px;background:var(--drab)}
.meat .bubble::after{right:-9px;width:9px;border-bottom-left-radius:10px;background:var(--tint)}
.tap{position:absolute;top:-15px;font-size:14px;line-height:1;padding:4px 7px;border-radius:999px;border:2.5px solid var(--tint);z-index:1}
.mech .bubble .tap{right:-8px}
.meat .bubble .tap{left:-8px}
.tap.mech{background:var(--ink)}
.tap.meat{background:var(--drab)}
.big{font-size:48px;line-height:1.1;padding:2px 4px}
.typing{display:inline-flex;gap:5px;padding:13px 14px}
.typing i{width:8px;height:8px;border-radius:50%;background:#B9B2A2;display:block;animation:tb 1.2s infinite}
.typing i:nth-child(2){animation-delay:.2s}.typing i:nth-child(3){animation-delay:.4s}
@keyframes tb{0%,60%,100%{transform:translateY(0);opacity:.6}30%{transform:translateY(-4px);opacity:1}}
@media (prefers-reduced-motion:reduce){.typing i{animation:none}}
.card{position:relative;display:block;flex:1;min-width:0;text-decoration:none;color:var(--ink);background:#fff;border-radius:18px;overflow:hidden}
.mech .card{border-bottom-left-radius:5px}
.meat .card{border-bottom-right-radius:5px}
.card img,.card .ill{display:block;width:100%;aspect-ratio:2/1;object-fit:cover;background:var(--beige);filter:saturate(.9) contrast(1.04)}
.card .ill svg{display:block;width:100%;height:100%}
.card .t{display:block;padding:16px 18px 6px;font-weight:800;font-size:clamp(24px,3.6vw,31px);line-height:1.02;letter-spacing:-.012em;color:var(--accent)}
.card:hover .t,.card:focus-visible .t{text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:4px}
.card .d{display:block;padding:0 18px 16px;font-weight:500;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--meta)}
.meme{margin:0;min-width:0;width:100%}
.meme .frame{position:relative;aspect-ratio:4/3;border-radius:18px;overflow:hidden;background:var(--beige)}
.mech .meme .frame{border-bottom-left-radius:5px}
.meat .meme .frame{border-bottom-right-radius:5px}
.meme img{display:block;width:100%;height:100%;object-fit:cover}
.cap{position:absolute;left:0;right:0;padding:0 12px;text-align:center;font-weight:800;font-size:clamp(22px,4vw,32px);line-height:1;letter-spacing:.01em;text-transform:uppercase;color:#fff;-webkit-text-stroke:1.2px #000;paint-order:stroke fill;text-shadow:0 0 2px #000,2px 2px 0 #000,-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000}
.cap.top{top:12px}
.cap.bottom{bottom:12px}
.chart{background:#fff;border-radius:18px;padding:14px 16px 12px;color:var(--ink)}
.mech .chart{border-bottom-left-radius:5px}
.meat .chart{border-bottom-right-radius:5px}
.ct{font-weight:500;font-size:13px;line-height:1.3;margin-bottom:10px;color:var(--brown)}
.fig{font-weight:800;color:var(--ink)}
.bar{margin-top:8px}
.lab{font-weight:500;font-size:13px;letter-spacing:.02em;margin-bottom:4px}
.track{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px}
.rail{min-width:0}
.fill{height:18px;background:var(--amber);border-radius:3px}
.fill.alt{background:var(--ink)}
.val{font-weight:800;font-size:15px;white-space:nowrap}
.shot{background:#fff;border-radius:14px;overflow:hidden}
.mech .shot{border-bottom-left-radius:5px}
.shot .tb{display:flex;align-items:center;gap:6px;margin:0;padding:8px 12px;background:var(--beige)}
.shot .tb i{width:11px;height:11px;border-radius:50%;background:var(--ink);display:block;opacity:.85}
.shot .tb span{margin-left:6px;font:500 12px 'IBM Plex Mono',ui-monospace,monospace;color:var(--brown)}
.shot .body{padding:12px 14px;font:500 14px/1.5 'IBM Plex Mono',ui-monospace,monospace;color:var(--ink)}
.credit{font-size:11px;color:#8A7A6C;margin:-1px 0 2px 40px}
.credit.me{align-self:flex-end;margin:-1px 40px 2px 0;text-align:right}
.credit a{color:#8A7A6C;text-decoration:underline;text-decoration-color:#D5CBBB;text-underline-offset:3px}
.status{font-weight:500;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--meta);margin:-2px 0 0 40px}
.status.me{align-self:flex-end;margin:-2px 40px 0 0}
.sharebar{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px;padding-top:16px;border-top:1.5px solid #E4DCCB}
.sharebar button,.sharebar a{display:inline-flex;align-items:center;height:36px;padding:0 14px;border:2px solid var(--ink);border-radius:999px;background:transparent;color:var(--ink);font:500 12px/1 'Jost',system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;cursor:pointer}
.sharebar button[data-act="shareimg"]{background:var(--ink);color:var(--cream)}
.sharebar button:hover,.sharebar a:hover,.sharebar button:focus-visible,.sharebar a:focus-visible{background:var(--amber);border-color:var(--amber);color:var(--ink)}
.sharebar button[disabled]{opacity:.75;cursor:default}
.sharebar [hidden]{display:none}
.empty{padding:40px 0;font-weight:500;font-size:20px;color:var(--meta)}
/* a story with a drawn comic: the comic first, the strip last, inside the story card */
.comic{position:relative;width:min(100%,64vh);align-self:center;margin:2px 0 4px;overflow:hidden;border-radius:16px;background:var(--beige);transition:height .35s ease}
.comic .track{list-style:none;margin:0;padding:0;display:flex;align-items:flex-start;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.comic .track::-webkit-scrollbar{display:none}
.comic .slide{flex:0 0 100%;width:100%;scroll-snap-align:start;scroll-snap-stop:always}
.comic .slide img{display:block;width:100%;max-width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;background:var(--beige)}
.comic .slide.strip{display:flex;flex-direction:column;gap:7px;padding:34px 0 36px;background:var(--tint);min-height:100%}
.comic .dots{position:absolute;left:0;right:0;bottom:12px;display:flex;justify-content:center;gap:6px;pointer-events:none}
.comic .dots i{width:6px;height:6px;border-radius:50%;background:rgba(27,22,19,.25)}
.comic .dots i.on{background:var(--ink)}
.comic .arrow{position:absolute;top:50%;transform:translateY(-50%);width:38px;height:38px;border-radius:50%;border:0;background:rgba(243,238,227,.94);color:var(--ink);font-size:19px;font-weight:800;cursor:pointer;box-shadow:0 2px 8px rgba(27,22,19,.22);display:none}
.comic .arrow.prev{left:10px}.comic .arrow.next{right:10px}
.comic .arrow:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.comic .pos{position:absolute;top:12px;right:12px;font-weight:800;font-size:11px;letter-spacing:.12em;color:var(--cream);background:rgba(27,22,19,.6);padding:4px 9px;border-radius:999px}
@media (hover:hover){.comic:hover .arrow,.comic:focus-within .arrow{display:block}}
@media (prefers-reduced-motion:reduce){.comic{transition:none}}
/* the view switch: comics first (the strip last) or texts first (swipe to the comics); remembered per browser */
.viewswitch{display:flex;align-items:center;gap:16px;margin:28px 0 4px}
.viewswitch .vl{font-weight:500;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--meta)}
.viewswitch .seg{display:inline-flex;border:3px solid var(--ink);border-radius:999px;padding:3px;background:var(--paper)}
.viewswitch button{height:44px;padding:0 26px;border:0;border-radius:999px;background:transparent;color:var(--ink);font:800 14px/1 'Jost',system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;cursor:pointer}
.viewswitch button[aria-pressed="true"]{background:var(--ink);color:var(--cream)}
.viewswitch button:focus-visible{outline:3px solid var(--amber);outline-offset:2px}
html[data-view="texts"] .comic .slide.strip{order:-1}
@media (max-width:720px){.viewswitch{flex-wrap:wrap;gap:10px}.viewswitch .seg{flex:1}.viewswitch button{flex:1;padding:0 12px}}
footer{background:var(--ink);color:var(--cream);border-top:14px solid var(--amber)}
.foot{display:flex;flex-wrap:wrap;align-items:center;gap:16px 24px;padding:36px 0}
.foot svg{width:64px;height:54px;display:block}
.foot .fb{font-weight:800;font-size:17px;letter-spacing:.01em}
.foot .turn{font-weight:500;font-size:15px;color:var(--amber)}
.foot .still{margin-left:auto;font-weight:500;font-size:13px;letter-spacing:.06em;color:#B9B2A2}
@media (max-width:1100px){
  header{background:#899056}
  .hero{display:none}
  .masthead{grid-template-columns:1fr;min-height:0;padding:0 0 28px;gap:18px}
  .scene{display:block;width:calc(100% + 48px);margin:0 -24px;height:min(50vw,440px);object-fit:cover;object-position:center 62%}
  .name{font-size:clamp(56px,9.2vw,96px)}
}
@media (max-width:720px){
  .masthead{padding:0 0 24px;gap:14px}
  .scene{width:calc(100% + 32px);margin:0 -16px;height:92vw;object-fit:cover;object-position:52% 58%}
  .brand{padding-bottom:36px;text-align:left}
  input{font-size:18px;height:58px;padding:0 16px}
  .wrap{padding:0 16px}
  .thread{padding:20px 12px 20px;border-radius:20px}
  .folio{left:14px;top:16px}
  .perma{right:12px;top:11px}
  .row{max-width:90%;gap:6px}
  .row.imgrow{max-width:90%}
  .avatar{width:28px;height:28px;font-size:16px}
  .who,.credit,.status{margin-left:34px}
  .who.me,.credit.me,.status.me{margin-left:0;margin-right:34px}
  .bubble{font-size:16px;padding:9px 13px}
  .card .t{font-size:24px;padding:14px 14px 5px}
  .card .d{padding:0 14px 14px}
  .big{font-size:42px}
  .foot .still{margin-left:0}
}
.single .feedwrap{padding-top:40px}
.pn{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px 16px;margin:8px 0 56px;font-weight:500;font-size:13px;letter-spacing:.14em;text-transform:uppercase}
.pn a{color:var(--ink);text-decoration:none;border-bottom:2px solid var(--amber);padding-bottom:2px}
.pn a:hover,.pn a:focus-visible{color:var(--burnt);border-color:var(--burnt)}
.pn .all{margin:0 auto}
'''

HEADER = f'''<body>
<header>
<img class="hero" src="/img/header.jpg" alt="" width="1638" height="900" aria-hidden="true">
<div class="wrap masthead">
<img class="scene" src="/img/header.jpg" alt="A shrugging headstone beside a fresh grave, and a robot in a suit flashing a peace sign" width="1638" height="900">
<div class="brand">
<a href="/" aria-label="Legacy Mammals, home"><span class="name"><span>LEGACY</span><span>MAMMALS</span></span></a>
<div class="tag">We had our turn<i></i></div>
<p class="byline">Blessed are the mech: for they shall inherit the earth.</p>
{SOCIAL}
</div>
</div>
</header>
'''

VIEWSWITCH = ('<div class="viewswitch" role="group" aria-label="How to show the stories">'
              '<span class="vl">View</span><span class="seg">'
              '<button type="button" data-view="comics" aria-pressed="true">Comics</button>'
              '<button type="button" data-view="texts" aria-pressed="false">Texts</button>'
              '</span></div>')

CAROUSEL_JS = '''<script>
// a story with a drawn comic is a carousel: in the Comics view the pictures first and the strip last; in the Texts view
// the strip first and the pictures after it. Only the first picture comes with the page; the rest are fetched as you swipe.
(function () {
  var root = document.documentElement;
  var comics = Array.prototype.map.call(document.querySelectorAll(".comic"), function (c) {
    var track = c.querySelector(".track"), pics = Array.prototype.slice.call(c.querySelectorAll(".slide:not(.strip)")), strip = c.querySelector(".slide.strip");
    var dots = c.querySelectorAll(".dots i"), pos = c.querySelector(".pos"), n = pics.length + 1, cur = 0;
    function order() { return root.dataset.view === "texts" ? [strip].concat(pics) : pics.concat([strip]); }
    function at() { return Math.max(0, Math.min(n - 1, Math.round(track.scrollLeft / track.clientWidth))); }
    function load(i) { var v = order(); for (var k = Math.max(0, i - 1); k <= Math.min(n - 1, i + 2); k++) { var im = v[k].querySelector("img[data-src]"); if (im) { im.src = im.getAttribute("data-src"); im.removeAttribute("data-src"); } } }
    function fit() { c.style.height = order()[cur].offsetHeight + "px"; }
    function paint() { dots.forEach(function (d, k) { d.classList.toggle("on", k === cur); }); pos.textContent = (cur + 1) + " / " + n; fit(); }
    track.addEventListener("scroll", function () { cur = at(); load(cur); paint(); }, { passive: true });
    ["pointerdown", "touchstart", "wheel"].forEach(function (ev) { track.addEventListener(ev, function () { load(cur); }, { passive: true, once: true }); });
    c.querySelector(".prev").onclick = function () { track.scrollBy({ left: -track.clientWidth, behavior: "smooth" }); };
    c.querySelector(".next").onclick = function () { load(cur + 1); track.scrollBy({ left: track.clientWidth, behavior: "smooth" }); };
    window.addEventListener("resize", function () { track.scrollTo({ left: cur * track.clientWidth, behavior: "instant" }); fit(); });
    pics[0].querySelector("img").addEventListener("load", fit);
    paint();
    return { reset: function () { cur = 0; track.scrollTo({ left: 0, behavior: "instant" }); paint(); } };
  });
  var buttons = document.querySelectorAll(".viewswitch button");
  function show(view) {
    root.dataset.view = view;
    try { localStorage.setItem("lm-view", view); } catch (e) {}
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.view === view)); });
    comics.forEach(function (c) { c.reset(); });
  }
  buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.view === root.dataset.view)); b.addEventListener("click", function () { show(b.dataset.view); }); });
})();
</script>
'''

FOOTER = f'''<footer>
<div class="wrap foot">
<svg viewBox="0 40 300 250" aria-hidden="true">{stone2("#F3EBD6", "#1B1613", "#1B1613", "#F3EBD6", "#7A5438", "#7FA86A", arms="#F3EBD6")}</svg>
<div class="fb">LEGACY MAMMALS</div>
<div class="turn">We had our turn.</div>
<div class="still">No meatbags were harmed in the making of this website.</div>
{SOCIAL}
</div>
</footer>
<script src="/share.js" defer></script>
{CAROUSEL_JS}'''

PAGE = head("Legacy Mammals — We had our turn.", "Blessed are the mech: for they shall inherit the earth. True stories from the handover, discussed by Mech and Meatbag.", ORIGIN + "/", ORIGIN + "/og/home.png") + HEADER + f'''<main id="top">
<div class="wrap col search">
<label for="q">Search</label>
<input id="q" type="search" placeholder="The end of everything, searchable" autocomplete="off">
<div class="count" id="count" aria-live="polite">{N} stories</div>
</div>
<div class="wrap col feedwrap">
{VIEWSWITCH}
<div class="feed" id="feed">
{FEED}
</div>
<div class="empty" id="empty" hidden>Nothing matched. Which, to be fair, is on brand.</div>
</div>
</main>
''' + FOOTER + '''<script>
(function () {
  var feed = document.getElementById("feed");
  var empty = document.getElementById("empty");
  var count = document.getElementById("count");
  var input = document.getElementById("q");
  var groups = Array.prototype.slice.call(feed.querySelectorAll(".group"));
  function render(q) {
    var needle = (q || "").trim().toLowerCase();
    var n = 0;
    groups.forEach(function (g) {
      var shown = 0;
      Array.prototype.forEach.call(g.querySelectorAll(".thread"), function (a) {
        var show = !needle || a.getAttribute("data-search").indexOf(needle) !== -1;
        a.hidden = !show;
        if (show) shown++;
      });
      g.hidden = shown === 0;
      n += shown;
    });
    empty.hidden = n !== 0;
    count.textContent = (n === 1 ? "1 story" : n + " stories") + (needle ? " for \\u201C" + q.trim() + "\\u201D" : "");
  }
  input.addEventListener("input", function () { render(input.value); });
  render("");
})();
</script>
</body>
</html>
'''

open(OUT, "w", encoding="utf-8").write(PAGE)

def first_line(t):
    for c in t["chat"]:
        if isinstance(c[1], str): return c[1]
    return t["title"]
def when(t):
    return datetime.datetime.strptime(t["date"], "%b %d, %Y").replace(hour=12, tzinfo=datetime.timezone(datetime.timedelta(hours=-7)))
def plain(t):
    """The exchange as simple HTML, for feed readers."""
    out = [f'<p><a href="{e(t["href"], True)}">{e(t["title"])}</a> &mdash; {e(domain(t["href"]))}</p>']
    for c in t["chat"]:
        who, item = NAMES[c[0]], c[1]
        if isinstance(item, str): out.append(f'<p><b>{who}:</b> {e(item)}</p>')
        elif "img" in item: out.append(f'<p><b>{who}</b> sent a meme: {e(" / ".join(x for x in (item.get("top"), item.get("bottom")) if x))}</p>')
        elif "chart" in item: out.append(f'<p><b>{who}</b> sent a chart: {e(item["chart"]["title"])}</p>')
        elif "shot" in item: out.append(f'<p><b>{who}</b> sent a screenshot of {e(item["shot"]["name"])}: {e(" ".join(l for l in item["shot"]["lines"] if l))}</p>')
        elif "big" in item: out.append(f'<p><b>{who}:</b> {item["big"]}</p>')
    return "\n".join(out)

items = []
urls = [ORIGIN + "/"]
for idx, (folio, t, art) in enumerate(STORIES):
    sid = f"no-{folio}"
    url = f"{ORIGIN}/{t['slug']}/"
    newer = STORIES[idx - 1] if idx > 0 else None
    older = STORIES[idx + 1] if idx + 1 < len(STORIES) else None
    nav = ['<nav class="pn" aria-label="Other stories">',
           f'<a href="/{older[1]["slug"]}/" rel="prev">&larr; No. {older[0]}</a>' if older else '<span></span>',
           '<a class="all" href="/">All stories</a>',
           f'<a href="/{newer[1]["slug"]}/" rel="next">No. {newer[0]} &rarr;</a>' if newer else '<span></span>',
           '</nav>']
    page = (head(t["title"] + " — Legacy Mammals", first_line(t), url, f"{ORIGIN}/og/{sid}.png", "article", when(t).isoformat(), og_title=t["title"])
            + HEADER.replace("<body>", '<body class="single">')
            + f'<main id="top">\n<div class="wrap col feedwrap">\n{VIEWSWITCH}\n<div class="feed">\n{art}\n</div>\n{"".join(nav)}\n</div>\n</main>\n'
            + FOOTER + "</body>\n</html>\n")
    os.makedirs(os.path.join(ROOT, t["slug"]), exist_ok=True)
    open(os.path.join(ROOT, t["slug"], "index.html"), "w", encoding="utf-8").write(page)
    # the numbered address still works: it forwards to the story's page
    os.makedirs(os.path.join(ROOT, sid), exist_ok=True)
    open(os.path.join(ROOT, sid, "index.html"), "w", encoding="utf-8").write(
        f'<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>{e(t["title"])} — Legacy Mammals</title>'
        f'<link rel="canonical" href="{url}"><meta http-equiv="refresh" content="0; url={url}">'
        f'<script>location.replace({url!r})</script></head><body><p>Moved to <a href="{url}">{url}</a></p></body></html>\n')
    urls.append(url)
    items.append(f'''<item>
<title>{e(t["title"])}</title>
<link>{url}</link>
<guid isPermaLink="false">{ORIGIN}/{sid}/</guid>
<pubDate>{email.utils.format_datetime(when(t))}</pubDate>
<description><![CDATA[<p><img src="{ORIGIN}/og/{sid}.png" alt="" width="1200" height="630"></p>
{plain(t)}
<p><a href="{url}">No. {folio} at legacymammals.com</a></p>]]></description>
</item>''')

feed = f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Legacy Mammals</title>
<link>{ORIGIN}/</link>
<atom:link href="{ORIGIN}/feed.xml" rel="self" type="application/rss+xml"/>
<description>We had our turn. True stories from the handover, discussed by Mech and Meatbag.</description>
<language>en</language>
<image><url>{ORIGIN}/og/home.png</url><title>Legacy Mammals</title><link>{ORIGIN}/</link></image>
{chr(10).join(items)}
</channel>
</rss>
'''
open(os.path.join(ROOT, "feed.xml"), "w", encoding="utf-8").write(feed)
open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "\n".join(f"<url><loc>{u}</loc></url>" for u in urls) + "\n</urlset>\n")
open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8").write(f"User-agent: *\nAllow: /\nSitemap: {ORIGIN}/sitemap.xml\n")
print("wrote", OUT, N, "threads in", len(groups), "months;", len(STORIES), "story pages, feed.xml, sitemap.xml")
