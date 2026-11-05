/* "In their words" (work.html), 4 Nov 2026 (Nikki: "make it just a normal carousel").
   Replaces the fanned deck of cards. A plain row of the six quote cards: swipe or scroll sideways, or use the arrow
   buttons; the counter shows which card is first in view. Cards snap into place, all full size, the next one peeking
   in at the edge. No autoplay. Without JavaScript the row still scrolls sideways. Arrow keys work when the row has focus. */
(function () {
  var hq = document.querySelector('[data-hq]'); if (!hq) return;
  var track = hq.querySelector('.hq-track'), nav = hq.querySelector('.hq-nav');
  var prev = hq.querySelector('.hq-prev'), next = hq.querySelector('.hq-next'), count = hq.querySelector('.hq-count');
  var cards = [].slice.call(track.children), N = cards.length;
  if (N < 2) return;
  hq.className = 'hq hq-row';
  track.setAttribute('aria-label', 'Client testimonials, ' + N + ' cards. Scroll sideways or use the arrow buttons.');
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)');

  function step() { return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth; }
  function index() { return Math.max(0, Math.min(N - 1, Math.round(track.scrollLeft / step()))); }
  function atEnd() { return track.scrollLeft + track.clientWidth >= track.scrollWidth - 4; }
  function update() {
    var i = atEnd() ? N - 1 : index();
    if (count) count.textContent = (i + 1) + ' / ' + N;
    if (prev) prev.disabled = track.scrollLeft < 4;
    if (next) next.disabled = atEnd();
  }
  function go(d) { track.scrollBy({ left: d * step(), behavior: rm.matches ? 'auto' : 'smooth' }); }

  if (nav) nav.hidden = false;
  if (prev) prev.addEventListener('click', function () { go(-1); });
  if (next) next.addEventListener('click', function () { go(1); });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });
  var raf; track.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
