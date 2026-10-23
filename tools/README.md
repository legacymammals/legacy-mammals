# Building the site

The stories live in `build_site4.py` (the `threads` list, newest first). To publish a story, add it there
(or remove its `draft=True`), then build:

    python3 tools/build_site7.py index.html

That rewrites `index.html`, every story page, the `no-N` forwards, `feed.xml`, `sitemap.xml` and `robots.txt`.
Commit and push; the push runs the poster (see the top-level README). Drafts are left out of the build unless
`INCLUDE_DRAFTS=1` is set.
