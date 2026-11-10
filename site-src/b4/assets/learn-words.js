/* 10 Nov 2026 - What we offer (learn.html): the rotating word in "Learn to do real work with AI." (Nikki, site review).
   Words: real / useful / valuable, at the same pace and with the same slide and fade as the home page hero
   (the hero-words script). The word sits mid-sentence, so its box eases to the width of each word instead of
   staying as wide as the longest one, and "work with AI." follows it without a gap.
   Screen readers read the hidden static "real"; reduced motion or no script shows "real" only. CSS: block
   "What we offer: rotating word" at the end of site.css. */
(function () {
  var rot = document.querySelector('.lx-hero h1 .rot[data-words]');
  if (!rot) return;
  var words = rot.getAttribute('data-words').split('|');
  if (words.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  rot.textContent = '';
  var els = words.map(function (w, i) {
    var s = document.createElement('span'); s.className = 'rot-w' + (i === 0 ? ' is-on' : ''); s.textContent = w;
    rot.appendChild(s); return s;
  });
  function fit(i) { rot.style.width = els[i].offsetWidth + 'px'; }
  rot.classList.add('is-ready'); fit(0);
  var cur = 0;
  setInterval(function () {
    if (document.hidden) return;
    var old = els[cur], i = (cur + 1) % els.length, next = els[i];
    old.classList.remove('is-on'); old.classList.add('is-out');
    next.classList.remove('is-out'); void next.offsetWidth; next.classList.add('is-on'); fit(i);
    setTimeout(function () { old.classList.remove('is-out'); }, 400);
    cur = i;
  }, 1800);
  window.addEventListener('resize', function () { fit(cur); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(cur); });
})();
