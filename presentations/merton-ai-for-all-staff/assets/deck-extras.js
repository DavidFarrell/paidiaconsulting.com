/*
 * deck-extras - presenter conveniences for the <deck-stage> runtime
 * (Merton deck, Oct 2026). Self-contained; load after deck-stage.js.
 *
 *   T   toggle the thumbnail rail (right-click a thumbnail -> Skip / unskip a
 *       slide live). deck-stage only turns the rail on when a host app posts
 *       __omelette_rail_enabled, so we post it ourselves on the first T press.
 *       Off at load, so it never shows up on a screen share by accident.
 *   N   open the presenter-notes window (a separate popup: put it on your
 *       other screen; share only the deck window). Shows this slide's note,
 *       the next slide's title, and a talk clock. Follows the deck live.
 *   H   show / hide the keyboard cheat-sheet.
 *   Also: hides deck-stage's nav pill (screen-share hygiene), pauses media on
 *   the slide you leave, and keeps footer page numbers absolute.
 *   Reload keeps your place: the current slide is mirrored into #N.
 *   <video data-fallback> shows its sibling .rz-video-fallback tile when the
 *   file is missing, and retries the file each time you land on the slide
 *   (so a deepfake rendered mid-talk can be dropped into media/ and just play).
 */
(function () {
  'use strict';
  if (window.__rzExtrasLoaded) return;
  window.__rzExtrasLoaded = true;

  var deck = null, notes = [], notesWin = null, helpEl = null, t0 = null;

  function busy() {
    return (window.rzLightbox && window.rzLightbox.isOpen && window.rzLightbox.isOpen()) ||
           (window.rzOverview && window.rzOverview.isOpen && window.rzOverview.isOpen());
  }

  // ── rail ────────────────────────────────────────────────────────────────
  // Enabled lazily on the first T press, so the rail can never flash up on a
  // screen share at load.
  var railOn = false, railEnabled = false;
  function toggleRail() {
    if (!railEnabled) {
      railEnabled = true;
      window.postMessage({ type: '__omelette_rail_enabled' }, '*');
    }
    railOn = !railOn;
    window.postMessage({ type: '__deck_rail_visible', on: railOn }, '*');
  }

  // ── notes popup ─────────────────────────────────────────────────────────
  function labelOf(i) {
    var s = deck && deck.children[i];
    return s ? (s.getAttribute('data-label') || '') : '';
  }
  function nextVisible(i) {
    var kids = deck ? deck.children : [];
    for (var j = i + 1; j < kids.length; j++) if (!kids[j].hasAttribute('data-deck-skip')) return j;
    return -1;
  }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function renderNotes() {
    if (!notesWin || notesWin.closed || !deck) return;
    var i = deck.index || 0, n = deck.length || 0, nx = nextVisible(i);
    var d = notesWin.document;
    var body = d.getElementById('b');
    if (!body) return;
    var steps = (window.rzSteps && deck.children[i]) ? window.rzSteps.count(deck.children[i]) : 0;
    body.innerHTML =
      '<div class="top"><span class="num">' + (i + 1) + ' / ' + n + '</span>' +
      '<span class="lbl">' + esc(labelOf(i)) + (steps ? '  ·  ' + steps + ' build' + (steps > 1 ? 's' : '') : '') + '</span>' +
      '<span class="clk" id="clk"></span></div>' +
      '<div class="note">' + esc(notes[i] || '').replace(/\n/g, '<br>') + '</div>' +
      '<div class="next">NEXT: ' + (nx >= 0 ? (nx + 1) + '  ' + esc(labelOf(nx)) : 'end') + '</div>';
    tick();
  }
  function tick() {
    if (!notesWin || notesWin.closed) return;
    var el = notesWin.document.getElementById('clk');
    if (!el) return;
    if (!t0) { el.textContent = 'clock: press S here to start'; return; }
    var s = Math.floor((Date.now() - t0) / 1000);
    el.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  setInterval(tick, 1000);
  function openNotes() {
    if (notesWin && !notesWin.closed) { notesWin.focus(); renderNotes(); return; }
    notesWin = window.open('', 'merton-notes', 'width=900,height=640');
    if (!notesWin) return;
    var d = notesWin.document;
    d.open();
    d.write('<!doctype html><meta charset="utf-8"><title>Speaker notes</title><style>' +
      'body{margin:0;background:#1a1438;color:#fbf3d8;font-family:-apple-system,Helvetica,Arial,sans-serif;padding:22px 28px;}' +
      '.top{display:flex;gap:18px;align-items:baseline;font-family:Menlo,monospace;font-size:15px;letter-spacing:.06em;color:#fff200;border-bottom:1px solid #4a3f75;padding-bottom:10px}' +
      '.lbl{color:#ff5fa2;flex:1}.clk{color:#fbf3d8;opacity:.8}' +
      '.note{font-size:26px;line-height:1.45;margin-top:18px;white-space:normal}' +
      '.next{margin-top:26px;font-family:Menlo,monospace;font-size:14px;opacity:.6}' +
      '.keys{position:fixed;bottom:10px;left:28px;font-family:Menlo,monospace;font-size:12px;opacity:.45}' +
      '</style><body><div id="b"></div><div class="keys">Arrows here also drive the deck · S start/reset clock</div></body>');
    d.close();
    // Keys pressed in the notes window drive the deck too.
    notesWin.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;      // let browser shortcuts be (Cmd+R must not reset the deck)
      if (e.key === 's' || e.key === 'S') { t0 = Date.now(); tick(); return; }
      // Dispatched at document: window-capture, document listeners, then
      // bubbles to window where deck-stage listens - one dispatch covers all.
      document.dispatchEvent(new KeyboardEvent('keydown', { key: e.key, bubbles: true, cancelable: true }));
      e.preventDefault();
    });
    renderNotes();
  }

  // ── help card ───────────────────────────────────────────────────────────
  function toggleHelp() {
    if (!helpEl) {
      helpEl = document.createElement('div');
      helpEl.setAttribute('style', 'position:fixed;right:24px;bottom:24px;z-index:2147483600;background:#1a1438;' +
        'color:#fbf3d8;border:2px solid #fff200;padding:18px 22px;font:15px/1.7 "JetBrains Mono",Menlo,monospace;display:none');
      helpEl.innerHTML = [
        '<b style="color:#fff200">KEYS</b>',
        '&larr; / &rarr;  slide (steps through a slide\'s images first)',
        '&uarr;  all-slides overview (&uarr; / &darr; / Esc close)',
        'click image  pop up (click, &larr;, &rarr; or Esc closes)',
        'L  laser pointer',
        'N  speaker-notes window',
        'T  thumbnail rail (right-click a thumb: Skip)',
        'R / Home  first slide · End  last · 1-9 jump',
        'H  this card'
      ].join('<br>');
      document.body.appendChild(helpEl);
    }
    helpEl.style.display = helpEl.style.display === 'none' ? 'block' : 'none';
  }

  // ── video fallback (deepfake slot) ──────────────────────────────────────
  // <video data-fallback data-src="media/x.mp4">: the file is checked with a
  // HEAD request (media 'error' events are unreliable on a 404 - Chrome can
  // sit in NETWORK_LOADING). Missing -> show the sibling .rz-video-fallback
  // tile; present -> set src (cache-busted) and show the video. Re-checked
  // every time you land on the slide, and when you click the tile.
  function checkVideo(v) {
    var base = v.getAttribute('data-src');
    var fb = v.parentElement && v.parentElement.querySelector('.rz-video-fallback');
    if (!base) return;
    if (v.getAttribute('src') && v.readyState > 0) return;          // already loaded
    if (location.protocol === 'file:') {                          // no HEAD on file:// - just try it
      v.src = base;
      v.onerror = function () { v.style.visibility = 'hidden'; if (fb) fb.style.display = 'flex'; };
      v.onloadeddata = function () { v.style.visibility = 'visible'; if (fb) fb.style.display = 'none'; };
      return;
    }
    fetch(base, { method: 'HEAD', cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      v.src = base + '?t=' + Date.now();
      v.load();
      v.style.visibility = 'visible';
      if (fb) fb.style.display = 'none';
    }).catch(function () {
      v.removeAttribute('src');
      v.style.visibility = 'hidden';
      if (fb) fb.style.display = 'flex';
    });
  }
  function wireVideo(v) {
    var fb = v.parentElement && v.parentElement.querySelector('.rz-video-fallback');
    if (fb) fb.addEventListener('click', function (e) { e.stopPropagation(); checkVideo(v); });
    checkVideo(v);
  }
  function retryVideos(slide) {
    Array.prototype.forEach.call(slide.querySelectorAll('video[data-fallback]'), checkVideo);
  }

  // ── embedded YouTube: give the keyboard back to the deck ────────────────
  // Clicking play focuses the cross-origin iframe, which would then eat the
  // arrow keys (seeking the video instead of moving the slide). As soon as
  // focus moves into an iframe, pull it back: the video keeps playing.
  window.addEventListener('blur', function () {
    setTimeout(function () {
      var a = document.activeElement;
      if (a && a.tagName === 'IFRAME') { try { a.blur(); window.focus(); } catch (e) {} }
    }, 150);
  });

  // ── keys ────────────────────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (busy()) return;
    var k = e.key;
    if (k === 't' || k === 'T') toggleRail();
    else if (k === 'n' || k === 'N') openNotes();
    else if (k === 'h' || k === 'H' || k === '?') toggleHelp();
    else return;
    e.stopImmediatePropagation(); e.preventDefault();
  }, true);

  // Footer page numbers: deck-stage numbers only footer-bearing slides, which
  // drifts from the overview / notes / overlay numbering. Use the absolute
  // slide number everywhere instead (re-applied after deck-stage on each nav).
  function absNumbers() {
    var kids = deck.children, n = kids.length;
    for (var i = 0; i < n; i++) {
      var p = kids[i].querySelector('.rz-foot__page');
      if (p) p.textContent = (i + 1) + ' / ' + n;
    }
  }

  function init() {
    deck = document.querySelector('deck-stage');
    if (!deck) return;
    try { notes = JSON.parse((document.getElementById('speaker-notes') || {}).textContent || '[]'); } catch (e) { notes = []; }
    Array.prototype.forEach.call(document.querySelectorAll('video[data-fallback]'), wireVideo);
    deck.addEventListener('slidechange', function (e) {
      var i = e.detail.index;
      try { history.replaceState(null, '', '#' + (i + 1)); } catch (err) {}
      if (e.detail.slide) retryVideos(e.detail.slide);
      // Leaving a slide stops its video / audio (slides are hidden, not unmounted).
      if (e.detail.previousSlide) {
        Array.prototype.forEach.call(e.detail.previousSlide.querySelectorAll('video, audio'), function (m) { try { m.pause(); } catch (err) {} });
        Array.prototype.forEach.call(e.detail.previousSlide.querySelectorAll('iframe[src*="youtube"]'), function (f) {
          try { f.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*'); } catch (err) {}
        });
      }
      // A clicked rail thumb keeps focus and would steal Up/Down: drop it.
      try { var ae = deck.shadowRoot && deck.shadowRoot.activeElement; if (ae && ae.blur) ae.blur(); } catch (err) {}
      absNumbers();
      renderNotes();
    });
    deck.addEventListener('deckchange', function () { setTimeout(absNumbers, 0); });
    setTimeout(absNumbers, 0);
    // Hide deck-stage's black "N / 74 · Reset" nav pill: it flashes on every
    // key press and mouse move, which the Teams audience would see. (Posting
    // __omelette_presenting would also hide it but hard-disables the rail.)
    customElements.whenDefined('deck-stage').then(function () {
      try { var ov = deck.shadowRoot && deck.shadowRoot.querySelector('.overlay'); if (ov) ov.style.display = 'none'; } catch (err) {}
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
