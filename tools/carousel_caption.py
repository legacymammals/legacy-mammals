#!/usr/bin/env python3
# The caption of a story's drawn Instagram carousel: the headline, the strip's first message, the
# link line, then hashtags for the story itself (the ones someone searching that story would use)
# and the standing five. Writes it into reels/no<N>/carousel.json and prints it.
#
#   python3 -I tools/carousel_caption.py 55 "#DataCenters #Ohio #Midterms2026"
#   python3 -I tools/carousel_caption.py 55 --show        (print the current caption, change nothing)
#
# The story is found by its number: the N-th story counting up from the oldest, drafts included, the
# same numbering the site uses once the story is published. The headline and the first message come
# from the thread in tools/build_site4.py, so they always match the strip.
import sys, os, re, json, html
from urllib.parse import urlparse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
STANDING = "#AI #AInews #Satire #Comics #LegacyMammals"
LINK = "The whole exchange at legacymammals.com — link in bio."

src4 = open(os.path.join(HERE, "build_site4.py"), encoding="utf-8").read().split("NAMES = {")[0]
ns = {"sys": sys, "html": html, "re": re, "urlparse": urlparse, "__file__": os.path.join(HERE, "build_site4.py")}
exec(src4.replace("OUT = sys.argv[1]", "OUT = None"), ns)
threads, M, H = ns["threads"], ns["M"], ns["H"]
NAME = {M: "Mech", H: "Meatbag"}


def story(n):
    """The thread published (or to be published) as No. n: the list is newest first, so No. 1 is the last."""
    total = len(threads)
    if not 1 <= n <= total:
        sys.exit(f"no story No. {n}: the list has {total}")
    return threads[total - n]


def caption(t, tags):
    who, line = t["chat"][0]
    tags = " ".join(x if x.startswith("#") else "#" + x for x in tags.split())
    tail = " ".join(x for x in STANDING.split() if x.lower() not in tags.lower().split())
    return f'{t["title"]}\n\n{NAME.get(who, who)}: {line}\n\n{LINK}\n\n{tags} {tail}'.strip()


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit("usage: carousel_caption.py <N> \"#tags …\" | --show | --first")
    n = int(sys.argv[1]); t = story(n)
    manifest = os.path.join(ROOT, "reels", f"no{n}", "carousel.json")
    if sys.argv[2] == "--show":
        print(json.load(open(manifest, encoding="utf-8"))["caption"]); sys.exit()
    if sys.argv[2] == "--first":   # the headline and first message only, to pick the tags from
        who, line = t["chat"][0]
        print(f'No. {n}  {t["slug"]}\n{t["title"]}\n{NAME.get(who, who)}: {line}'); sys.exit()
    m = json.load(open(manifest, encoding="utf-8"))
    m["caption"] = caption(t, " ".join(sys.argv[2:]))
    with open(manifest, "w", encoding="utf-8") as f:
        json.dump(m, f, indent=2, ensure_ascii=False); f.write("\n")
    print(f'wrote the caption of No. {n} ({t["slug"]}):\n')
    print(m["caption"])
