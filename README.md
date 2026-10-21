# Legacy Mammals

We had our turn.

A single-feed site of true stories from the handover. Served by GitHub Pages at legacymammals.com.

- `index.html` — the whole site: masthead, search, and the feed. Every story is a thread: whoever found the link (Mech or Meatbag) shares it as a link card, then the two of them talk about it in text, big emoji, tapbacks, image macros (Wikimedia Commons photos, credited), charts and fake screenshots. Threads are static HTML, newest first; the inline script only filters them for search.
- `share.js` — draws any story as a 1080px-wide share image on a canvas in the browser (watermarked @legacymammals), for the Share, Copy image and Download buttons under each story. Half the stories are about machines doing the unexpected, half about humans doing the expected.
- `404.html` — the not-found page.
- `CNAME` — the custom domain for GitHub Pages.
