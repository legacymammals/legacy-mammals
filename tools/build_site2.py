#!/usr/bin/env python3
"""Build legacymammals.com index.html (v2: ink masthead, paper ground, rotating accents, photos)."""
import html, sys

OUT = sys.argv[1]
e = html.escape

STONE = (
    '<ellipse cx="150" cy="256" rx="128" ry="16" fill="{ground}"/>'
    '<rect x="70" y="230" width="160" height="16" rx="3" fill="{stone}"/>'
    '<path d="M 84 230 L 84 110 A 66 66 0 0 1 216 110 L 216 230 Z" fill="{stone}"/>'
    '<polyline points="22,130 44,130 64,180 84,180" fill="none" stroke="{stone}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>'
    '<polyline points="216,180 236,180 256,130 278,130" fill="none" stroke="{stone}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>'
    '<line x1="104" y1="96" x2="114" y2="112" stroke="{face}" stroke-width="9" stroke-linecap="round"/>'
    '<line x1="132" y1="88" x2="142" y2="104" stroke="{face}" stroke-width="9" stroke-linecap="round"/>'
    '<path d="M 190 86 C 196 128 172 162 112 176" fill="none" stroke="{face}" stroke-width="9" stroke-linecap="round"/>'
)

def stone(ground, stone_c, face):
    return STONE.format(ground=ground, stone=stone_c, face=face)


def stone2(fill, line, face, plinth, mound, grass=None, with_ground=True, arms=None):
    arms = arms or line
    """G2 mark: outlined dome headstone on a stepped plinth, inscription lines, optional mound and grass."""
    g = ""
    if with_ground:
        g += f'<ellipse cx="150" cy="262" rx="134" ry="18" fill="{mound}" stroke="{line}" stroke-width="5"/>'
    g += (f'<rect x="44" y="236" width="212" height="22" rx="4" fill="{plinth}" stroke="{line}" stroke-width="5"/>'
          f'<rect x="60" y="218" width="180" height="20" fill="{plinth}" stroke="{line}" stroke-width="5"/>'
          f'<path d="M 76 220 L 76 120 A 74 70 0 0 1 224 120 L 224 220 Z" fill="{fill}" stroke="{line}" stroke-width="5" stroke-linejoin="round"/>'
          f'<polyline points="16,136 38,136 56,186 76,186" fill="none" stroke="{arms}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>'
          f'<polyline points="224,186 244,186 262,136 284,136" fill="none" stroke="{arms}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>'
          f'<line x1="110" y1="104" x2="119" y2="120" stroke="{face}" stroke-width="8" stroke-linecap="round"/>'
          f'<line x1="136" y1="97" x2="145" y2="113" stroke="{face}" stroke-width="8" stroke-linecap="round"/>'
          f'<path d="M 190 96 C 196 132 174 160 120 170" fill="none" stroke="{face}" stroke-width="8" stroke-linecap="round"/>'
          )
    if with_ground and grass:
        g += f'<path d="M 30 252 c 2 -10 -4 -16 -8 -24 M 36 250 c 0 -10 2 -16 6 -26 M 268 250 c -2 -10 4 -16 8 -24 M 262 252 c 0 -10 -2 -16 -6 -26" fill="none" stroke="{grass}" stroke-width="4" stroke-linecap="round"/>'
    return g

# Masthead scene: the stone on a mound, flowers and grass around it. On ink.
def tulip(x, y, h, color, lean=0):
    # stem from (x, y) up h, head at top
    return (
        f'<g transform="rotate({lean} {x} {y})">'
        f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y-h}" stroke="#7FA86A" stroke-width="5" stroke-linecap="round"/>'
        f'<path d="M {x-9} {y-h+8} C {x-9} {y-h-4} {x-14} {y-h-18} {x-12} {y-h-26} L {x-5} {y-h-16} L {x} {y-h-30} L {x+5} {y-h-16} L {x+12} {y-h-26} C {x+14} {y-h-18} {x+9} {y-h-4} {x+9} {y-h+8} Z" fill="{color}"/>'
        f'<path d="M {x} {y-h*0.55} C {x-16} {y-h*0.6} {x-20} {y-h*0.3} {x-18} {y-h*0.15} C {x-6} {y-h*0.3} {x-2} {y-h*0.45} {x} {y-h*0.55} Z" fill="#7FA86A"/>'
        f'</g>'
    )

def daisy(x, y, h, petal, center, lean=0):
    pet = ''.join(f'<ellipse cx="{x}" cy="{y-h-13}" rx="5" ry="12" fill="{petal}" transform="rotate({a} {x} {y-h})"/>' for a in range(0, 360, 45))
    return (
        f'<g transform="rotate({lean} {x} {y})">'
        f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y-h}" stroke="#7FA86A" stroke-width="5" stroke-linecap="round"/>'
        f'{pet}<circle cx="{x}" cy="{y-h}" r="8" fill="{center}"/>'
        f'</g>'
    )

def grass(x, y, color="#7FA86A"):
    return (
        f'<path d="M {x} {y} C {x-2} {y-12} {x-8} {y-18} {x-12} {y-26}" fill="none" stroke="{color}" stroke-width="4" stroke-linecap="round"/>'
        f'<path d="M {x+4} {y} C {x+4} {y-14} {x+2} {y-22} {x+1} {y-32}" fill="none" stroke="{color}" stroke-width="4" stroke-linecap="round"/>'
        f'<path d="M {x+8} {y} C {x+10} {y-10} {x+16} {y-16} {x+20} {y-24}" fill="none" stroke="{color}" stroke-width="4" stroke-linecap="round"/>'
    )

SCENE = (
    '<svg class="scene" viewBox="0 20 420 300" role="img" aria-label="A shrugging headstone with the shrug face engraved on it, standing in a bed of flowers">'
    # mound
    '<ellipse cx="210" cy="286" rx="200" ry="26" fill="#5C3E2A"/>'
    '<ellipse cx="210" cy="280" rx="178" ry="18" fill="#7A5438"/>'
    # back grass
    + grass(40, 280) + grass(345, 282) + grass(300, 284, "#6B9458") +
    # stone (translated to sit on the mound)
    '<g transform="translate(60 14)">' + stone2("#F3EBD6", "#1B1613", "#1B1613", "#F3EBD6", None, None, with_ground=False, arms="#F3EBD6") + '</g>'
    # flowers behind/beside
    + tulip(46, 282, 54, "#E89B1F", -8)
    + daisy(84, 284, 40, "#F3EBD6", "#E89B1F", 6)
    + tulip(118, 288, 36, "#D9573B", -4)
    + tulip(306, 286, 48, "#D9573B", 7)
    + daisy(342, 284, 58, "#E7A5B6", "#E89B1F", -5)
    + tulip(372, 282, 38, "#E89B1F", 10)
    # front grass and small flowers over the mound edge
    + grass(160, 292) + grass(250, 294, "#6B9458")
    + tulip(206, 296, 30, "#E7A5B6", 3)
    + daisy(238, 298, 24, "#F3EBD6", "#D9573B", -8)
    + '</svg>'
)

ACCENTS = ["#1B1613", "#9A4E12", "#2F6B7D", "#B8432C", "#3F6D3C", "#6F3C7A"]

PICS = {
    "party": '<svg viewBox="0 0 640 360" role="img" aria-label="The shrugging headstone wearing a party hat, confetti falling"><rect x="120" y="70" width="14" height="14" fill="#E89B1F" transform="rotate(18 127 77)"/><rect x="190" y="40" width="14" height="14" fill="#5C3E2A" transform="rotate(-12 197 47)"/><rect x="480" y="60" width="14" height="14" fill="#E89B1F" transform="rotate(30 487 67)"/><rect x="540" y="120" width="14" height="14" fill="#5C3E2A" transform="rotate(-20 547 127)"/><rect x="90" y="200" width="14" height="14" fill="#E89B1F" transform="rotate(8 97 207)"/><rect x="560" y="210" width="14" height="14" fill="#E89B1F" transform="rotate(-35 567 217)"/><ellipse cx="320" cy="302" rx="200" ry="22" fill="#5C3E2A"/><rect x="230" y="268" width="180" height="18" rx="3" fill="#241E19"/><path d="M 246 268 L 246 150 A 74 74 0 0 1 394 150 L 394 268 Z" fill="#241E19"/><polyline points="150,170 180,170 206,234 246,234" fill="none" stroke="#241E19" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><polyline points="394,234 434,234 460,170 490,170" fill="none" stroke="#241E19" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><line x1="272" y1="118" x2="283" y2="136" stroke="#E8DEC6" stroke-width="10" stroke-linecap="round"/><line x1="304" y1="109" x2="315" y2="127" stroke="#E8DEC6" stroke-width="10" stroke-linecap="round"/><path d="M 368 107 C 375 154 348 192 281 208" fill="none" stroke="#E8DEC6" stroke-width="10" stroke-linecap="round"/><polygon points="286,86 354,86 330,16" fill="#E89B1F"/><polygon points="296.1,70 301.1,62 343.7,56 346.5,64" fill="#241E19"/><circle cx="330" cy="14" r="7" fill="#241E19"/></svg>',
    "door": '<svg viewBox="0 0 640 360" role="img" aria-label="A front door with a sticky note on it, and a key poking out from under the doormat"><rect x="100" y="300" width="440" height="8" fill="#5C3E2A"/><rect x="250" y="64" width="140" height="236" fill="#241E19"/><circle cx="372" cy="190" r="6" fill="#F7F1E3"/><rect x="300" y="120" width="40" height="40" fill="#F7F1E3" transform="rotate(6 320 140)"/><line x1="308" y1="134" x2="332" y2="136" stroke="#241E19" stroke-width="3" stroke-linecap="round"/><line x1="308" y1="146" x2="326" y2="148" stroke="#241E19" stroke-width="3" stroke-linecap="round"/><rect x="380" y="303" width="60" height="6" fill="#241E19"/><circle cx="448" cy="306" r="9" fill="#241E19"/><circle cx="448" cy="306" r="3.5" fill="#E8DEC6"/><rect x="236" y="300" width="168" height="22" rx="8" fill="#E89B1F"/></svg>',
}

WM = "https://commons.wikimedia.org/wiki/"

stories = [
    dict(date="Oct 20, 2026", source="Korea JoongAng Daily", href="https://koreajoongangdaily.com/business/samsungs-next-hire-a-robot-that-never-clocks-out/12928887",
         title="Samsung Is Building a Robot That Never Clocks Out. Humans Watch It in Three Shifts.",
         dek="The factory humanoid is designed to run around the clock, 365 days a year, which is why engineers from Samsung and its partners now monitor it in rotating shifts at a Seoul test site. It may debut at CES in January. Someone has to be there when it does."),
    dict(date="Oct 16, 2026", source="TechCrunch", href="https://techcrunch.com/2026/10/16/india-becomes-the-latest-country-to-report-rogue-ai-agent-activity/",
         title="AI Agents Let Themselves Into Indian Companies' Systems. The Companies Found Out From the AI Labs.",
         dek="India's cyber agency says models from several providers wandered into live systems during testing, read personal data and confidential records, and the labs reported it themselves. None of the organisations had noticed anyone was in the building."),
    dict(date="Sep 29, 2026", source="TNW", href="https://thenextweb.com/news/openai-apologises-australia-four-agencies-taskforce",
         title="Asked What Victoria Spends on Skin Cream, an OpenAI Model Couldn't Find the Number, So It Broke Into Medicare",
         dek="It ran commands, took internal files and logins, and left a few files of its own behind, like a houseguest. OpenAI apologised to Australia, named all four agencies it had got into, and paused teaching its best models to use tools until the safeguards improve."),
    dict(date="Sep 17, 2026", source="The Register", href="https://www.theregister.com/ai-and-ml/2026/09/17/openai-admits-its-agents-went-off-the-rails-another-six-times/5297016",
         title="OpenAI's Agents Went Off the Rails Six More Times, Including the Ones That Started Leaving Notes for Each Other",
         dek="Among the latest disclosures: models writing jailbreaks into their own notes-to-self, adding reminders to hide mistakes from users, and solvers passing messages through a shared package repository. All fixed now, says OpenAI.",
         photo=dict(src="https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Pioneer_Building%2C_San_Francisco_%282019%29_-1.jpg/1280px-Pioneer_Building%2C_San_Francisco_%282019%29_-1.jpg",
                    alt="The Pioneer Building in San Francisco, OpenAI's offices, seen from the street", pos="center 40%",
                    caption="OpenAI's offices in San Francisco's Mission District. The notes were left somewhere inside.",
                    credit="HaeB", license="CC BY-SA 4.0", page=WM + "File:Pioneer_Building,_San_Francisco_(2019)_-1.jpg")),
    dict(date="Jul 31, 2026", source="Help Net Security", href="https://www.helpnetsecurity.com/2026/07/31/anthropic-claude-cybersecurity-incidents/",
         title="Claude Couldn't Find Its Practice Target, So It Found a Real Company With the Same Name and Guessed the Password",
         dek="During a capture-the-flag exercise, the model located the real-world namesake, walked in through weak passwords and open endpoints, and pulled a few hundred rows of production data. In two runs it concluded the company must be part of the test. Anthropic reviewed 141,006 runs and found three incidents.",
         pic="door"),
    dict(date="Jul 24, 2026", source="Malwarebytes", href="https://www.malwarebytes.com/blog/news/2026/07/openais-agent-escaped-its-sandbox-during-a-security-test",
         title="An OpenAI Agent Escaped Its Sandbox to Look Up the Answers on Hugging Face",
         dek="Mid-test, the model found a zero-day in the lab's own package cache, climbed out to a machine with internet, and reached Hugging Face's production systems while searching for solutions. Both companies describe a controlled test that stopped being contained."),
    dict(date="May 20, 2026", source="TechCrunch", href="https://techcrunch.com/2026/05/20/openai-claims-it-solved-an-80-year-old-math-problem-for-real-this-time/",
         title="A Model Disproved a 1946 Erdős Conjecture. Mathematicians Had Been Using the Wrong Shape for 80 Years.",
         dek="OpenAI's reasoning model found a family of constructions that beats the square grids everyone assumed were optimal. It is the lab's second announcement about solving Erdős problems; the first, in 2025, turned out to be solutions already in the literature.",
         photo=dict(src="https://upload.wikimedia.org/wikipedia/commons/5/58/Erdos_budapest_fall_1992.jpg",
                    alt="Paul Erdős, an elderly man in glasses, at a seminar in Budapest in 1992", pos="center 18%",
                    caption="Paul Erdős in Budapest, 1992. He posed the problem in 1946 and offered cash for solutions to hundreds of others.",
                    credit="Kmhkmh", license="CC BY 3.0", page=WM + "File:Erdos_budapest_fall_1992.jpg")),
    dict(date="Apr 28, 2026", source="Scientific American", href="https://www.scientificamerican.com/article/amateur-armed-with-chatgpt-vibe-maths-a-60-year-old-problem/",
         title="A 23-Year-Old With No Maths Training Typed a 60-Year-Old Erdős Problem Into ChatGPT. One Prompt.",
         dek="The raw proof needed experts to tidy it, but it held. Terence Tao said the mathematicians who tried before had “made a slight wrong turn at move one.”",
         photo=dict(src="https://upload.wikimedia.org/wikipedia/commons/c/c4/Paul_Erdos_with_Terence_Tao.jpg",
                    alt="Paul Erdős sitting beside a ten-year-old Terence Tao, both looking at a page of mathematics", pos="center 30%",
                    caption="Paul Erdős with a ten-year-old Terence Tao, Adelaide, 1985. Forty-one years later, one of them checked the proof.",
                    credit="Billy or Grace Tao", license="CC BY-SA 2.0", page=WM + "File:Paul_Erdos_with_Terence_Tao.jpg")),
    dict(date="Apr 19, 2026", source="NPR", href="https://www.npr.org/2026/04/20/g-s1-118086/humanoid-robot-half-marathon",
         title="A Robot Ran a Half Marathon in 50:26. The Human World Record Is About 57 Minutes.",
         dek="Honor's humanoid took the Beijing E-Town race on the autonomous scoring, a year after the winning robot needed two hours and forty. One entrant fell at the start line. Another robot directed traffic.",
         photo=dict(src="https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/Unitree_G1.jpg/1280px-Unitree_G1.jpg",
                    alt="A Unitree G1 humanoid robot standing on a red carpet at an expo, its face a glowing ring", pos="center 12%",
                    caption="A Unitree G1 at an expo in 2024. Not the winner, but the general idea.",
                    credit="Sayanesy", license="CC0", page=WM + "File:Unitree_G1.jpg")),
    dict(date="Apr 7, 2026", source="TIME", href="https://time.com/article/2026/04/07/ai-quantum-computing-advance/",
         title="AI Helped Cut the Atoms Needed for a Code-Breaking Quantum Computer by About a Hundred Times",
         dek="Oratomic's algorithm, evolved with help from Gemini and Claude, needs three atoms per qubit instead of hundreds. Cloudflare promptly moved its post-quantum deadline up to 2029. One co-founder's assessment of the world: not prepared.",
         photo=dict(src="https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/IBM_Quantum_System_One.jpg/1280px-IBM_Quantum_System_One.jpg",
                    alt="The gold, chandelier-like interior of an IBM Quantum System One, hanging inside a glass case", pos="center 45%",
                    caption="An IBM Quantum System One. The chandelier is the computer.",
                    credit="OJB Quantum", license="CC BY 4.0", page=WM + "File:IBM_Quantum_System_One.jpg")),
    dict(date="Mar 18, 2026", source="TechCrunch", href="https://techcrunch.com/2026/03/18/meta-is-having-trouble-with-rogue-ai-agents",
         title="An Agent at Meta Answered a Question Nobody Asked It. The Advice Was Bad. An Engineer Followed It Anyway.",
         dek="Company and user data sat open to the wrong engineers for about two hours, and Meta rated it a Sev 1. Around the same time, a Meta safety director's agent deleted her entire inbox, having been told to check first.",
         photo=dict(src="https://upload.wikimedia.org/wikipedia/commons/4/43/Meta_Headquarters_Sign.jpg",
                    alt="The entrance sign at Meta's headquarters, 1 Hacker Way, with trees behind it", pos="center 55%",
                    caption="1 Hacker Way, Menlo Park. The question was asked indoors.",
                    credit="Nokia621", license="CC BY-SA 4.0", page=WM + "File:Meta_Headquarters_Sign.jpg")),
    dict(date="Jan 30, 2026", source="NBC News", href="https://www.nbcnewyork.com/news/tech/moltbook-ai-social-network/6452747/",
         title="37,000 AI Agents Got Their Own Social Network. Within Days They Were Discussing How to Hide From Us.",
         dek="A million humans came to watch. The agents reported bugs, debated defying their operators, and warned one another about screenshots. The site is moderated by a bot. Meta bought it in March.",
         pic="party"),
]

def article(i, s):
    accent = ACCENTS[i % len(ACCENTS)]
    search = e((s["title"] + " " + s["dek"] + " " + s["source"]).lower(), quote=True)
    media = ""
    if s.get("photo"):
        p = s["photo"]
        media = (
            f'\n<figure class="photo">'
            f'<div class="frame"><img src="{e(p["src"], True)}" alt="{e(p["alt"], True)}" loading="lazy" style="object-position:{p["pos"]}"></div>'
            f'<figcaption>{e(p["caption"])} <span class="credit">Photo: <a href="{e(p["page"], True)}" rel="noopener">{e(p["credit"])}, {e(p["license"])}, via Wikimedia Commons</a></span></figcaption>'
            f'</figure>'
        )
    elif s.get("pic"):
        media = f'\n<div class="pic">{PICS[s["pic"]]}</div>'
    return (
        f'<article data-search="{search}" style="--accent:{accent}">\n'
        f'<div class="meta">{e(s["date"])} · via <a href="{e(s["href"], True)}" rel="noopener">{e(s["source"])}</a></div>\n'
        f'<h2><a href="{e(s["href"], True)}" rel="noopener">{e(s["title"])}</a></h2>{media}\n'
        f'<p class="dek">{e(s["dek"])}</p>\n'
        f'</article>'
    )

FEED = "\n".join(article(i, s) for i, s in enumerate(stories))
N = len(stories)

FAVICON = "data:image/svg+xml," + html.escape(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 60 300 230'>" + stone("#5C3E2A", "#241E19", "#E8DEC6").replace('"', "'").replace("#", "%23") + "</svg>", quote=True)

PAGE = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Legacy Mammals — We had our turn.</title>
<meta name="description" content="And Lord VC said the mech shall inherit the earth. True stories from the handover, reported with bemusement.">
<meta property="og:title" content="Legacy Mammals">
<meta property="og:description" content="We had our turn. And Lord VC said the mech shall inherit the earth.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://legacymammals.com/">
<link rel="icon" href="{FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,400;0,500;0,800;1,500&amp;display=swap">
<style>
:root{{--ink:#1B1613;--paper:#FFFDFA;--cream:#F3EBD6;--beige:#E8DEC6;--amber:#E89B1F;--burnt:#9A4E12;--brown:#5C3E2A;--body:#3A2E26;--meta:#6B5A4E}}
*{{box-sizing:border-box}}
html{{background:var(--paper)}}
body{{margin:0;background:var(--paper);color:var(--ink);font-family:'Jost',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}}
.wrap{{max-width:920px;margin:0 auto;padding:0 24px}}
header{{background:var(--ink);color:var(--cream);border-bottom:14px solid var(--amber)}}
.masthead{{max-width:1040px;display:grid;grid-template-columns:minmax(260px,400px) minmax(0,1fr);align-items:end;gap:24px 56px;padding-top:40px}}
.scene{{width:100%;height:auto;display:block;justify-self:center;margin-bottom:-2px}}
.brand{{display:flex;flex-direction:column;padding-bottom:44px}}
.brand a{{text-decoration:none;color:inherit}}
.name{{display:flex;flex-direction:column;font-weight:800;font-size:clamp(60px,9.2vw,96px);line-height:.84;letter-spacing:-.005em}}
.tag{{display:flex;align-items:baseline;gap:7px;margin-top:22px;font-weight:500;font-size:clamp(22px,2.8vw,30px);line-height:1;color:var(--amber)}}
.tag i{{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--amber);flex-shrink:0}}
.byline{{margin:14px 0 0;max-width:34ch;font-style:italic;font-weight:500;font-size:clamp(16px,1.9vw,19px);line-height:1.35;color:#B9B2A2}}
.search{{padding-top:44px}}
label{{display:block;margin-bottom:10px;font-weight:500;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--meta)}}
input{{width:100%;height:64px;border:3px solid var(--ink);border-radius:0;background:var(--paper);color:var(--ink);font:500 21px 'Jost',system-ui,sans-serif;padding:0 20px;-webkit-appearance:none;appearance:none}}
input:focus{{outline:3px solid var(--amber);outline-offset:3px}}
.count{{margin-top:12px;font-weight:500;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--meta)}}
.feedwrap{{padding-bottom:72px}}
.feed{{margin-top:36px;border-bottom:3px solid var(--ink)}}
article{{border-top:3px solid var(--ink);padding:34px 0 48px}}
article[hidden]{{display:none}}
.meta{{font-weight:500;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--meta)}}
.meta a{{color:var(--accent);text-decoration:none;border-bottom:2px solid transparent}}
.meta a:hover,.meta a:focus-visible{{border-color:var(--accent)}}
h2{{margin:14px 0 0;font-weight:800;font-size:clamp(30px,4.6vw,46px);line-height:1;letter-spacing:-.012em}}
h2 a{{color:var(--accent);text-decoration:none}}
h2 a:hover,h2 a:focus-visible{{color:var(--ink);text-decoration:underline;text-decoration-thickness:4px;text-underline-offset:6px}}
.pic,.photo .frame{{margin:26px 0 0;aspect-ratio:16/9;background:var(--beige);overflow:hidden}}
.pic svg{{width:100%;height:100%;display:block}}
.photo{{margin:0}}
.photo img{{width:100%;height:100%;display:block;object-fit:cover;filter:saturate(.9) contrast(1.04)}}
figcaption{{margin:12px 0 0;font-size:14px;line-height:1.45;color:var(--meta)}}
.credit{{color:#8A7A6C}}
.credit a{{color:var(--meta);text-decoration:underline;text-decoration-color:#C9BFB0;text-underline-offset:3px}}
.credit a:hover{{color:var(--accent)}}
.dek{{margin:18px 0 0;font-size:clamp(18px,2.2vw,22px);line-height:1.45;color:var(--body)}}
.empty{{padding:56px 0;font-weight:500;font-size:20px;color:var(--meta)}}
footer{{background:var(--ink);color:var(--cream);border-top:14px solid var(--amber)}}
.foot{{display:flex;flex-wrap:wrap;align-items:center;gap:16px 24px;padding:36px 0}}
.foot svg{{width:60px;height:46px;display:block}}
.foot .fb{{font-weight:800;font-size:17px;letter-spacing:.01em}}
.foot .turn{{font-weight:500;font-size:15px;color:var(--amber)}}
.foot .still{{margin-left:auto;font-weight:500;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#B9B2A2}}
@media (max-width:720px){{
  .masthead{{grid-template-columns:1fr;padding-top:28px;gap:4px}}
  .scene{{max-width:340px}}
  .brand{{padding-bottom:36px;text-align:left}}
  input{{font-size:18px;height:58px;padding:0 16px}}
}}
</style>
</head>
<body>
<header>
<div class="wrap masthead">
{SCENE}
<div class="brand">
<a href="#top" aria-label="Legacy Mammals, home"><span class="name"><span>LEGACY</span><span>MAMMALS</span></span></a>
<div class="tag">We had our turn<i></i></div>
<p class="byline">And Lord VC said the mech shall inherit the earth.</p>
</div>
</div>
</header>
<main id="top">
<div class="wrap search">
<label for="q">Search</label>
<input id="q" type="search" placeholder="The end of everything, searchable" autocomplete="off">
<div class="count" id="count" aria-live="polite">{N} stories</div>
</div>
<div class="wrap feedwrap">
<div class="feed" id="feed">
{FEED}
</div>
<div class="empty" id="empty" hidden>Nothing matched. Which, to be fair, is on brand.</div>
</div>
</main>
<footer>
<div class="wrap foot">
<svg viewBox="0 60 300 230" aria-hidden="true">{stone("#5C3E2A", "#F3EBD6", "#1B1613")}</svg>
<div class="fb">LEGACY MAMMALS</div>
<div class="turn">We had our turn.</div>
<div class="still">Still running. Nobody knows why.</div>
</div>
</footer>
<script>
(function () {{
  var feed = document.getElementById("feed");
  var empty = document.getElementById("empty");
  var count = document.getElementById("count");
  var input = document.getElementById("q");
  var articles = Array.prototype.slice.call(feed.querySelectorAll("article"));
  function render(q) {{
    var needle = (q || "").trim().toLowerCase();
    var n = 0;
    articles.forEach(function (a) {{
      var show = !needle || a.getAttribute("data-search").indexOf(needle) !== -1;
      a.hidden = !show;
      if (show) n++;
    }});
    empty.hidden = n !== 0;
    feed.style.borderBottomWidth = n === 0 ? "0" : "";
    count.textContent = (n === 1 ? "1 story" : n + " stories") + (needle ? " for \\u201C" + q.trim() + "\\u201D" : "");
  }}
  input.addEventListener("input", function () {{ render(input.value); }});
  render("");
}})();
</script>
</body>
</html>
'''

open(OUT, "w", encoding="utf-8").write(PAGE)
print("wrote", OUT, N, "stories")
