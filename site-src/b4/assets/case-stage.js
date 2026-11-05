/* Our work (work.html), 2 Nov 2026, 2.50pm: the eight case studies as one pinned panel with a progress column.
   While you scroll through the case-study area the panel holds still in the middle of the screen and shows one case
   at a time; each step of scrolling (three quarters of a screen) moves to the next case, which fades in once you
   pass the halfway point. Eight dots in the left margin show progress: the line between them fills in coral as you
   scroll and each dot fills once you reach it; hover or focus shows the client, click jumps to it.
   The panel is exactly as tall as the longest case and only pins inside its own area, so it never covers the
   heading above or the quotes below, and the quotes follow straight after it. A "Next" line under the case names the
   next client (or "In their words" after the last) and jumps there.
   Built only on screens at least 1000px wide where the longest case fits, and not for reduced motion; otherwise the
   page stays a normal list. Links such as work.html#fcdo (and #fcdo on this page) still land on the right case.
   CSS: block "the eight case studies as one pinned panel with a progress column" at the end of site.css. */
(function () {
  var secs = [].slice.call(document.querySelectorAll('.case-sec'));
  if (secs.length < 2) return;
  var parent = secs[0].parentNode, N = secs.length;
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var MENU = 88; // space kept clear for the floating menu
  var B = null, cur = -1, ticking = false;

  function el(tag, cls) { var e = document.createElement(tag); e.className = cls; return e; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function build() {
    var cx = el('div', 'cx'), stage = el('div', 'cx-stage'), deck = el('div', 'cx-deck');
    var dots = el('nav', 'cx-dots'), track = el('span', 'cx-track'), fill = el('span', 'cx-fill');
    dots.setAttribute('aria-label', 'Case studies');
    track.appendChild(fill); dots.appendChild(track);
    parent.insertBefore(cx, secs[0]);
    // 4 Nov 2026 (Nikki): "Next" sits fixed under the last dot, so it never moves with the length of the case
    var next = el('a', 'cx-next cx-next-dot'); next.href = '#';
    stage.appendChild(deck); stage.appendChild(dots); cx.appendChild(stage);
    var marks = [], btns = [];
    secs.forEach(function (s, i) {
      var m = el('div', 'cx-mark'); m.id = s.id; s.setAttribute('data-cx-id', s.id); s.removeAttribute('id');
      cx.appendChild(m); marks.push(m); deck.appendChild(s);
      var name = s.getAttribute('data-short') || ('Case ' + (i + 1));
      var b = el('button', 'cx-dot'); b.type = 'button';
      b.setAttribute('data-label', pad(i + 1) + '  ' + name);
      b.setAttribute('aria-label', 'Case ' + (i + 1) + ' of ' + N + ': ' + name);
      b.addEventListener('click', function () { go(i); });
      dots.appendChild(b); btns.push(b);
    });
    dots.appendChild(next);
    next.addEventListener('click', function (e) { e.preventDefault(); if (cur < N - 1) go(cur + 1); else { var t = document.getElementById('testimonials'); if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - MENU, behavior: rm.matches ? 'instant' : 'smooth' }); } });
    B = { cx: cx, stage: stage, deck: deck, dots: dots, fill: fill, next: next, marks: marks, btns: btns, top: MENU, step: 600 };
    cur = -1; layout();
  }
  function unbuild() {
    secs.forEach(function (s) { s.id = s.getAttribute('data-cx-id'); s.classList.remove('is-on'); parent.insertBefore(s, B.cx); });
    B.cx.parentNode.removeChild(B.cx); B = null; cur = -1;
  }
  function fits() { return B.stage.offsetHeight + MENU + 16 <= window.innerHeight; }
  function layout() { // centre the panel below the menu, size the scroll area, place the dots in the margin
    var vh = window.innerHeight, H = B.stage.offsetHeight;
    B.top = Math.max(MENU, Math.round(MENU + (vh - MENU - H) * 0.42)); // a little above the middle, where it looks centred
    B.step = Math.max(420, Math.round(vh * 0.75));
    B.stage.style.setProperty('--cx-top', B.top + 'px');
    B.cx.style.height = (H + (N - 1) * B.step) + 'px';
    B.marks.forEach(function (m, i) { m.style.top = (i * B.step) + 'px'; });
    var w = secs[0].querySelector('.wrap');
    var left = w.getBoundingClientRect().left + (parseFloat(getComputedStyle(w).paddingLeft) || 0);
    B.dots.style.setProperty('--cx-dots-x', Math.max(18, Math.round(left / 2)) + 'px');
    cur = -1; sync(); placeNext();
  }
  function scrolled() { return Math.max(0, B.top - B.cx.getBoundingClientRect().top); }
  function sync() {
    ticking = false; if (!B) return;
    var d = scrolled(), run = (N - 1) * B.step;
    B.fill.style.transform = 'scaleY(' + Math.min(1, d / run).toFixed(4) + ')';
    var i = Math.max(0, Math.min(N - 1, Math.floor((d + B.step / 2) / B.step)));
    if (i === cur) return;
    cur = i;
    secs.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
    B.btns.forEach(function (b, k) { b.classList.toggle('is-done', k <= i); b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    B.next.textContent = '';
    var lead = document.createElement('span'); lead.textContent = 'Next';
    var arrow = document.createElement('span'); arrow.className = 'cx-next-arrow'; arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '\u2193';
    var nextName = i < N - 1 ? pad(i + 2) + '  ' + (secs[i + 1].getAttribute('data-short') || '') : 'In their words';
    B.next.setAttribute('data-label', nextName); B.next.setAttribute('aria-label', 'Next: ' + nextName);
    B.next.appendChild(lead); B.next.appendChild(arrow);
    placeNext();
  }
  function placeNext() {} // 4 Nov 2026: Next no longer follows the case; it is fixed under the dots
  function targetY(i) { return B.cx.getBoundingClientRect().top + window.scrollY - B.top + i * B.step; }
  function go(i, instant) { window.scrollTo({ top: targetY(i), behavior: (instant || rm.matches) ? 'instant' : 'smooth' }); }
  function decide() {
    var want = window.innerWidth >= 1000 && !rm.matches;
    if (want && !B) { build(); if (!fits()) unbuild(); }
    else if (B && (!want || !fits())) unbuild();
    else if (B) layout();
  }
  function hashCase(h) { if (!B || !h) return -1; var id = h.replace(/^#/, ''); for (var i = 0; i < B.marks.length; i++) if (B.marks[i].id === id) return i; return -1; }

  decide();
  if (B && location.hash) { var hi = hashCase(location.hash); if (hi >= 0) requestAnimationFrame(function () { go(hi, true); sync(); }); }
  document.addEventListener('click', function (e) { // in-page links such as "Read the Foreign Office story"
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var i = hashCase(a.getAttribute('href')); if (i < 0) return;
    e.preventDefault(); go(i); history.replaceState(null, '', a.getAttribute('href'));
  });
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
  var rt = null;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(decide, 150); });
  if (rm.addEventListener) rm.addEventListener('change', decide);
  function settle() { if (B && !fits()) unbuild(); else if (B) layout(); else decide(); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
  window.addEventListener('load', settle);
})();
