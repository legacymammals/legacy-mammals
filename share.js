/* Legacy Mammals — draw a story as a share image, right in the browser. */
(function () {
  var W = 1080, PAD = 56;
  var INK = "#1B1613", TINT = "#F3EEE3", CREAM = "#F3EBD6", BEIGE = "#E8DEC6", AMBER = "#E89B1F", DRAB = "#BFC396", META = "#6B5A4E", BROWN = "#5C3E2A", WHITE = "#FFFFFF";
  var HANDLE = "@legacymammals", SITE = "legacymammals.com";
  var EMOJI = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

  function font(weight, size, family) { return weight + " " + size + "px " + (family || "Jost, system-ui, sans-serif"); }
  function rr(ctx, x, y, w, h, r) {
    if (typeof r === "number") r = [r, r, r, r];
    ctx.beginPath();
    ctx.moveTo(x + r[0], y);
    ctx.lineTo(x + w - r[1], y); ctx.quadraticCurveTo(x + w, y, x + w, y + r[1]);
    ctx.lineTo(x + w, y + h - r[2]); ctx.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
    ctx.lineTo(x + r[3], y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r[3]);
    ctx.lineTo(x, y + r[0]); ctx.quadraticCurveTo(x, y, x + r[0], y);
    ctx.closePath();
  }
  function wrap(ctx, text, maxW) {
    var words = String(text).split(/\s+/), lines = [], line = "";
    for (var i = 0; i < words.length; i++) {
      var t = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = words[i]; } else { line = t; }
    }
    if (line) lines.push(line);
    return lines;
  }
  function loadImg(src) {
    return new Promise(function (res) {
      var i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = function () { res(i); };
      i.onerror = function () { res(null); };
      i.src = src + (src.indexOf("?") > -1 ? "&" : "?") + "lm=share";
    });
  }
  function drawCover(ctx, img, x, y, w, h, pos) {
    var ir = img.naturalWidth / img.naturalHeight, r = w / h, sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
    var py = 0.5; var m = /(\d+)%\s*$/.exec(pos || ""); if (m) py = parseInt(m[1], 10) / 100;
    if (ir > r) { sw = sh * r; sx = (img.naturalWidth - sw) / 2; } else { sh = sw / r; sy = (img.naturalHeight - sh) * py; }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }
  function stone(ctx, x, y, s, fill, face) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = BROWN; ctx.beginPath(); ctx.ellipse(150, 256, 128, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = fill; rr(ctx, 70, 230, 160, 16, 3); ctx.fill();
    ctx.fill(new Path2D("M 84 230 L 84 110 A 66 66 0 0 1 216 110 L 216 230 Z"));
    ctx.strokeStyle = fill; ctx.lineWidth = 11; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.stroke(new Path2D("M 22 130 L 44 130 L 64 180 L 84 180")); ctx.stroke(new Path2D("M 216 180 L 236 180 L 256 130 L 278 130"));
    ctx.strokeStyle = face; ctx.lineWidth = 9;
    ctx.stroke(new Path2D("M 104 96 L 114 112")); ctx.stroke(new Path2D("M 132 88 L 142 104")); ctx.stroke(new Path2D("M 190 86 C 196 128 172 162 112 176"));
    ctx.restore();
  }

  // Read a thread's DOM into a list of things to draw.
  function parse(thread) {
    var out = { items: [] };
    out.folio = (thread.querySelector(".folio") || {}).textContent || "";
    out.date = (thread.querySelector(".stamp") || {}).textContent || "";
    out.accent = getComputedStyle(thread).getPropertyValue("--accent").trim() || INK;
    out.id = thread.id;
    var rows = thread.querySelectorAll(".who, .row, .status");
    Array.prototype.forEach.call(rows, function (el) {
      var who = el.classList.contains("mech") ? "mech" : el.classList.contains("meat") ? "meat" : null;
      if (el.classList.contains("who")) { out.items.push({ t: "who", me: el.classList.contains("me"), text: el.textContent }); return; }
      if (el.classList.contains("status")) { out.items.push({ t: "status", me: el.classList.contains("me"), text: el.textContent }); return; }
      var card = el.querySelector(".card");
      if (card) {
        var img = card.querySelector("img");
        out.items.push({ t: "head", who: who, title: card.querySelector(".t").textContent, domain: card.querySelector(".d").textContent, img: img ? img.getAttribute("src") : null, pos: img ? img.style.objectPosition : "", ill: !!card.querySelector(".ill") });
        out.title = card.querySelector(".t").textContent; out.href = card.getAttribute("href");
        return;
      }
      var big = el.querySelector(".big");
      if (big) { out.items.push({ t: "big", who: who, text: big.textContent.replace(/^\s*(Mech|Meatbag):\s*/, "").trim() }); return; }
      var meme = el.querySelector(".meme");
      if (meme) {
        var mi = meme.querySelector("img");
        if (mi) { out.items.push({ t: "img", who: who, src: mi.getAttribute("src"), pos: mi.style.objectPosition, top: (meme.querySelector(".cap.top") || {}).textContent || "", bottom: (meme.querySelector(".cap.bottom") || {}).textContent || "" }); return; }
        var ch = meme.querySelector(".chart");
        if (ch) {
          var bars = Array.prototype.map.call(ch.querySelectorAll(".bar"), function (b) { return { lab: b.querySelector(".lab").textContent, pct: parseFloat(b.querySelector(".fill").style.width) || 100, val: b.querySelector(".val").textContent }; });
          out.items.push({ t: "chart", who: who, title: ch.querySelector(".ct").textContent.replace(/^fig\.\s*/, ""), bars: bars }); return;
        }
        var sh = meme.querySelector(".shot");
        if (sh) { out.items.push({ t: "shot", who: who, name: sh.querySelector(".tb span").textContent, lines: Array.prototype.map.call(sh.querySelectorAll(".ln"), function (l) { return l.textContent.replace(/ /g, ""); }) }); return; }
      }
      var b = el.querySelector(".bubble");
      if (b) {
        if (b.classList.contains("typing")) { out.items.push({ t: "typing", who: who }); return; }
        var tap = b.querySelector(".tap");
        var txt = ""; Array.prototype.forEach.call(b.childNodes, function (n) { if (n.nodeType === 3) txt += n.textContent; });
        out.items.push({ t: "text", who: who, text: txt.trim(), tap: tap ? tap.textContent : null, tapWho: tap ? (tap.classList.contains("mech") ? "mech" : "meat") : null });
      }
    });
    return out;
  }

  // Lay out and draw. `ctx` null = measure only.
  function paint(ctx, d, imgs) {
    var mctx = ctx || document.createElement("canvas").getContext("2d");
    var y = 0, inner = W - PAD * 2, AV = 56, GAP = 14, maxB = Math.round(inner * 0.78);
    function text(str, f, color, x, yy, align) { if (!ctx) return; ctx.font = f; ctx.fillStyle = color; ctx.textAlign = align || "left"; ctx.textBaseline = "alphabetic"; ctx.fillText(str, x, yy); }
    function avatar(who, x, yy) { if (!ctx) return; ctx.fillStyle = who === "mech" ? INK : DRAB; ctx.beginPath(); ctx.arc(x + AV / 2, yy + AV / 2, AV / 2, 0, Math.PI * 2); ctx.fill(); ctx.font = "30px " + EMOJI; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = INK; ctx.fillText(who === "mech" ? "🤖" : "🧑", x + AV / 2, yy + AV / 2 + 2); }
    function tail(who, bx, by, bw, bh) {
      if (!ctx) return;
      var c = who === "mech" ? INK : DRAB;
      ctx.fillStyle = c; ctx.beginPath();
      if (who === "mech") { ctx.moveTo(bx + 20, by + bh); ctx.quadraticCurveTo(bx + 4, by + bh, bx - 12, by + bh); ctx.quadraticCurveTo(bx + 2, by + bh - 6, bx + 2, by + bh - 24); ctx.lineTo(bx + 20, by + bh - 24); }
      else { ctx.moveTo(bx + bw - 20, by + bh); ctx.quadraticCurveTo(bx + bw - 4, by + bh, bx + bw + 12, by + bh); ctx.quadraticCurveTo(bx + bw - 2, by + bh - 6, bx + bw - 2, by + bh - 24); ctx.lineTo(bx + bw - 20, by + bh - 24); }
      ctx.closePath(); ctx.fill();
    }
    // just the exchange: tinted ground, a small date line, no masthead
    if (ctx) { ctx.fillStyle = TINT; ctx.fillRect(0, 0, W, 20000); }
    y = 44;
    text(d.folio, font("800", 22), META, PAD, y + 8);
    text(d.date.toUpperCase(), font("500", 22), META, W / 2, y + 8, "center");
    y += 44;
    var i, it;
    for (i = 0; i < d.items.length; i++) {
      it = d.items[i];
      var me = it.who === "meat" || it.me;
      if (it.t === "who") { text(it.text.toUpperCase(), font("500", 20), META, me ? W - PAD - AV - GAP : PAD + AV + GAP, y + 20, me ? "right" : "left"); y += 30; continue; }
      if (it.t === "status") { text(it.text.toUpperCase(), font("500", 19), META, me ? W - PAD - AV - GAP : PAD + AV + GAP, y + 18, me ? "right" : "left"); y += 30; continue; }
      var bx = me ? 0 : PAD + AV + GAP; // left edge for left-side bubbles; right-side computed from width
      if (it.t === "head") {
        var bw = inner - AV - GAP, x0 = me ? PAD : PAD + AV + GAP, h = 0, imgH = 0;
        var im = it.img ? imgs[it.img] : null;
        if (im) imgH = Math.round(bw / 2);
        mctx.font = font("800", 50);
        var tl = wrap(mctx, it.title, bw - 56);
        h = imgH + 30 + tl.length * 54 + 16 + 30 + 36;
        if (ctx) {
          ctx.save(); rr(ctx, x0, y, bw, h, me ? [26, 26, 8, 26] : [26, 26, 26, 8]); ctx.fillStyle = WHITE; ctx.fill(); ctx.clip();
          if (im) drawCover(ctx, im, x0, y, bw, imgH, it.pos);
          else if (it.ill) { ctx.fillStyle = BEIGE; ctx.fillRect(x0, y, bw, Math.round(bw / 2)); }
          ctx.restore();
          var ty = y + imgH + 30 + 46;
          if (!im && it.ill) ty += Math.round(bw / 2);
          for (var k = 0; k < tl.length; k++) { text(tl[k], font("800", 50), d.accent, x0 + 28, ty + k * 54); }
          text(it.domain.toUpperCase(), font("500", 20), META, x0 + 28, ty + (tl.length - 1) * 54 + 44);
        }
        if (!im && it.ill) h += Math.round(bw / 2);
        avatar(it.who, me ? W - PAD - AV : PAD, y + h - AV);
        y += h + 12; continue;
      }
      if (it.t === "text") {
        mctx.font = font("400", 33);
        var lines = wrap(mctx, it.text, maxB - 52), tw = 0;
        for (var j = 0; j < lines.length; j++) tw = Math.max(tw, mctx.measureText(lines[j]).width);
        var bw2 = Math.min(maxB, Math.ceil(tw) + 52), bh2 = lines.length * 42 + 28;
        var x1 = me ? W - PAD - AV - GAP - bw2 : PAD + AV + GAP;
        if (ctx) {
          rr(ctx, x1, y, bw2, bh2, 28); ctx.fillStyle = it.who === "mech" ? INK : DRAB; ctx.fill();
          tail(it.who, x1, y, bw2, bh2);
          for (var l = 0; l < lines.length; l++) text(lines[l], font("400", 33), it.who === "mech" ? CREAM : INK, x1 + 26, y + 42 + l * 42 - 2);
          if (it.tap) {
            var tx = me ? x1 - 10 : x1 + bw2 - 50, tyy = y - 22;
            ctx.fillStyle = TINT; ctx.beginPath(); ctx.arc(tx + 30, tyy + 22, 26, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = it.tapWho === "mech" ? INK : DRAB; ctx.beginPath(); ctx.arc(tx + 30, tyy + 22, 22, 0, Math.PI * 2); ctx.fill();
            ctx.font = "22px " + EMOJI; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = INK; ctx.fillText(it.tap, tx + 30, tyy + 24);
          }
        }
        avatar(it.who, me ? W - PAD - AV : PAD, y + bh2 - AV);
        y += bh2 + 10; continue;
      }
      if (it.t === "big") {
        if (ctx) { ctx.font = "84px " + EMOJI; ctx.textAlign = me ? "right" : "left"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = INK; ctx.fillText(it.text, me ? W - PAD - AV - GAP : PAD + AV + GAP, y + 80); }
        avatar(it.who, me ? W - PAD - AV : PAD, y + 96 - AV);
        y += 108; continue;
      }
      if (it.t === "typing") {
        var x2 = PAD + AV + GAP;
        if (ctx) { rr(ctx, x2, y, 118, 62, 28); ctx.fillStyle = INK; ctx.fill(); tail("mech", x2, y, 118, 62); ctx.fillStyle = "#B9B2A2"; for (var q = 0; q < 3; q++) { ctx.beginPath(); ctx.arc(x2 + 34 + q * 25, y + 31, 7, 0, Math.PI * 2); ctx.fill(); } }
        avatar("mech", PAD, y + 62 - AV);
        y += 72; continue;
      }
      if (it.t === "img") {
        var mw = Math.min(Math.round(inner * 0.72), 600), mh = Math.round(mw * 3 / 4), mx = me ? W - PAD - AV - GAP - mw : PAD + AV + GAP;
        var mi2 = imgs[it.src];
        if (ctx) {
          ctx.save(); rr(ctx, mx, y, mw, mh, me ? [26, 26, 8, 26] : [26, 26, 26, 8]); ctx.fillStyle = BEIGE; ctx.fill(); ctx.clip();
          if (mi2) drawCover(ctx, mi2, mx, y, mw, mh, it.pos);
          ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.lineJoin = "round"; ctx.strokeStyle = "#000"; ctx.fillStyle = "#fff";
          var cap = function (str, bottom) {
            str = str.toUpperCase(); var size = 44, lines;
            do { ctx.font = font("800", size); lines = wrap(ctx, str, mw - 32); if (lines.length <= 1 || size <= 30) break; size -= 2; } while (true);
            if (lines.length > 2) { lines = [lines[0], lines.slice(1).join(" ")]; }
            ctx.lineWidth = Math.max(5, size / 6);
            for (var li = 0; li < lines.length; li++) {
              var ly = bottom ? y + mh - 22 - (lines.length - 1 - li) * (size + 6) : y + 58 + li * (size + 6);
              ctx.strokeText(lines[li], mx + mw / 2, ly); ctx.fillText(lines[li], mx + mw / 2, ly);
            }
          };
          if (it.top) cap(it.top, false);
          if (it.bottom) cap(it.bottom, true);
          ctx.restore();
        }
        avatar(it.who, me ? W - PAD - AV : PAD, y + mh - AV);
        y += mh + 12; continue;
      }
      if (it.t === "chart") {
        var cw = Math.min(Math.round(inner * 0.78), 640), cx = me ? W - PAD - AV - GAP - cw : PAD + AV + GAP;
        mctx.font = font("500", 24); var ctl = wrap(mctx, "fig. " + it.title, cw - 56);
        var chh = 28 + ctl.length * 30 + it.bars.length * 84 + 16;
        if (ctx) {
          rr(ctx, cx, y, cw, chh, me ? [26, 26, 8, 26] : [26, 26, 26, 8]); ctx.fillStyle = WHITE; ctx.fill();
          for (var c1 = 0; c1 < ctl.length; c1++) text(ctl[c1], font("500", 24), BROWN, cx + 28, y + 44 + c1 * 30);
          var by2 = y + 28 + ctl.length * 30 + 10;
          for (var b1 = 0; b1 < it.bars.length; b1++) {
            var bb = it.bars[b1];
            text(bb.lab, font("500", 23), INK, cx + 28, by2 + 26);
            var railW = cw - 56 - 120, fw = Math.max(10, Math.round(railW * bb.pct / 100));
            ctx.fillStyle = b1 === 0 ? INK : AMBER; rr(ctx, cx + 28, by2 + 40, fw, 30, 5); ctx.fill();
            text(bb.val, font("800", 26), INK, cx + 28 + fw + 14, by2 + 63);
            by2 += 84;
          }
        }
        avatar(it.who, me ? W - PAD - AV : PAD, y + chh - AV);
        y += chh + 12; continue;
      }
      if (it.t === "shot") {
        var sw2 = Math.min(Math.round(inner * 0.78), 640), sx2 = me ? W - PAD - AV - GAP - sw2 : PAD + AV + GAP;
        var shh = 56 + it.lines.length * 34 + 30;
        if (ctx) {
          ctx.save(); rr(ctx, sx2, y, sw2, shh, me ? [22, 22, 8, 22] : [22, 22, 22, 8]); ctx.fillStyle = WHITE; ctx.fill(); ctx.clip();
          ctx.fillStyle = BEIGE; ctx.fillRect(sx2, y, sw2, 56);
          for (var dd = 0; dd < 3; dd++) { ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(sx2 + 30 + dd * 26, y + 28, 9, 0, Math.PI * 2); ctx.fill(); }
          text(it.name, font("500", 22, "'IBM Plex Mono', ui-monospace, monospace"), BROWN, sx2 + 116, y + 36);
          for (var ln = 0; ln < it.lines.length; ln++) text(it.lines[ln], font("500", 24, "'IBM Plex Mono', ui-monospace, monospace"), INK, sx2 + 28, y + 56 + 38 + ln * 34);
          ctx.restore();
        }
        avatar(it.who, me ? W - PAD - AV : PAD, y + shh - AV);
        y += shh + 12; continue;
      }
    }
    y += 26;
    // small sign-off: the stone, the address, the handle
    var FH = 96;
    if (ctx) {
      ctx.fillStyle = "#E4DCCB"; ctx.fillRect(PAD, y, W - PAD * 2, 2);
      stone(ctx, PAD - 4, y + 18, 0.2, INK, TINT);
      text("legacymammals.com", font("800", 22), INK, PAD + 70, y + 46);
      text("#" + d.id, font("500", 20), META, PAD + 70, y + 74);
      text(HANDLE, font("800", 24), INK, W - PAD, y + 58, "right");
    }
    return y + FH;
  }

  var cache = {};
  async function render(thread) {
    var d = parse(thread);
    if (cache[d.id]) return cache[d.id];
    try { await Promise.all([document.fonts.load(font("800", 50)), document.fonts.load(font("500", 24)), document.fonts.load(font("400", 33))]); } catch (e) {}
    var srcs = []; d.items.forEach(function (it) { if (it.img) srcs.push(it.img); if (it.src) srcs.push(it.src); });
    var loaded = await Promise.all(srcs.map(loadImg)), imgs = {};
    srcs.forEach(function (s, i) { imgs[s] = loaded[i]; });
    var H = paint(null, d, imgs);
    var c = document.createElement("canvas"); c.width = W; c.height = H;
    var ctx = c.getContext("2d");
    paint(ctx, d, imgs);
    var blob = await new Promise(function (res) { c.toBlob(res, "image/png"); });
    var jpg = await new Promise(function (res) { c.toBlob(res, "image/jpeg", 0.92); });
    cache[d.id] = { png: blob, jpg: jpg, canvas: c, title: d.title, href: d.href, id: d.id };
    return cache[d.id];
  }

  function flash(btn, msg) { var o = btn.textContent; btn.textContent = msg; btn.disabled = true; setTimeout(function () { btn.textContent = o; btn.disabled = false; }, 1600); }
  function permalink(id) { return "https://" + SITE + "/#" + id; }

  document.addEventListener("click", async function (ev) {
    var btn = ev.target.closest("[data-act]"); if (!btn) return;
    var thread = btn.closest(".thread"); if (!thread) return;
    var act = btn.getAttribute("data-act");
    var url = permalink(thread.id);
    try {
      if (act === "shareimg") {
        var r = await render(thread);
        var file = new File([r.png], "legacymammals-" + r.id + ".png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: r.title, text: r.title + " " + url });
          flash(btn, "Shared");
        } else if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": r.png })]);
          flash(btn, "Image copied");
        } else {
          var a = document.createElement("a"); a.href = URL.createObjectURL(r.png); a.download = "legacymammals-" + r.id + ".png"; document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
          flash(btn, "Saved");
        }
      } else if (act === "sharelink") {
        var title = (thread.querySelector(".card .t") || {}).textContent || "Legacy Mammals";
        if (navigator.share) { await navigator.share({ title: title, text: title, url: url }); flash(btn, "Shared"); }
        else { await navigator.clipboard.writeText(url); flash(btn, "Link copied"); }
      }
    } catch (err) {
      if (err && err.name === "AbortError") return;
      try { await navigator.clipboard.writeText(url); flash(btn, "Link copied"); } catch (e2) { flash(btn, "Couldn't share"); }
    }
  });

  window.LM = { render: render };
})();
