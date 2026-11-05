/* Paidia home hero: the rotating last word of "We show you what's possible." (2 Nov 2026, Nikki).
   Words: possible. / useful. / next. "possible." shows at once; each word holds 2.5 s, then the old word slides up
   about 8px and fades out while the next slides up from 8px below and fades in, over 350ms (CSS in site.css,
   block "hero headline with a rotating word"). No typing, spinning or bouncing.
   - The words share one grid cell, so its width is always the longest word and nothing else moves.
   - Screen readers read the hidden static "possible." in the h1; the rotating copy is aria-hidden.
   - No pause button (removed at Nikki's request, 2 Nov 2026).
   - Visitors who prefer reduced motion see "possible." only.
   - Without JavaScript the headline reads "We show you what's possible." as plain text. */
(function () {
  var rot = document.querySelector('.mo-copy h1 .rot[data-words], .hl-copy h1 .rot[data-words]');
  if (!rot) return;
  var words = rot.getAttribute('data-words').split('|');
  if (words.length < 2) return;

  // build one span per word in the shared cell, first word showing
  rot.textContent = '';
  var els = words.map(function (w, i) {
    var s = document.createElement('span');
    s.className = 'rot-w' + (i === 0 ? ' is-on' : '');
    s.textContent = w;
    rot.appendChild(s);
    return s;
  });
  rot.classList.add('is-ready');

  var HOLD = 1800; // ms each word stays (4000 until 2 Nov, 11.50am; 2500 until 4 Nov, Nikki: a little faster)
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var cur = 0, timer = null;

  function show(i) {
    var old = els[cur], next = els[i];
    old.classList.remove('is-on'); old.classList.add('is-out');
    next.classList.remove('is-out');
    void next.offsetWidth; // start the new word from below
    next.classList.add('is-on');
    setTimeout(function () { old.classList.remove('is-out'); }, 400);
    cur = i;
  }
  function stop() { clearTimeout(timer); timer = null; }
  function hold() {
    stop();
    if (reduce.matches) return;
    timer = setTimeout(function () { show((cur + 1) % els.length); hold(); }, HOLD + 350);
  }
  function start() { stop(); timer = setTimeout(function () { show((cur + 1) % els.length); hold(); }, HOLD); }

  function reset() { // back to "possible." with no animation
    stop();
    els.forEach(function (e, i) { e.classList.toggle('is-on', i === 0); e.classList.remove('is-out'); });
    cur = 0;
  }

  function onMotionPref() { if (reduce.matches) reset(); else start(); }
  if (reduce.addEventListener) reduce.addEventListener('change', onMotionPref); else if (reduce.addListener) reduce.addListener(onMotionPref);

  if (!reduce.matches) start();
})();
