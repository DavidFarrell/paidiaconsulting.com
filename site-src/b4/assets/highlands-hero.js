/* Home hero, Highlands light loop (4 Nov 2026; speed pass 6.45pm).
   - The still (an <img> with phone-, laptop- and full-size copies of the same frame) paints first, at high priority.
   - The video file is only requested once the page has finished loading, so it never competes with the still and the
     text for the first screen; it fades in over the still once its first frame is showing (same picture, so the swap
     cannot be seen). Muted, inline, looping; paused while off screen.
   - Visitors who ask for reduced motion keep the still and the video is never downloaded.
   - If the video cannot play, the still simply stays. */
(function () {
  var v = document.querySelector('.hl-video');
  if (!v) return;
  var media = v.closest('.hl-media');
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var onScreen = true, started = false;

  function tryPlay() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  function show() { if (media) media.classList.add('is-playing'); }
  v.addEventListener('playing', function () {
    if ('requestVideoFrameCallback' in v) v.requestVideoFrameCallback(show); else show();
  });
  function start() {
    if (started || rm.matches) return;
    started = true;
    v.src = v.getAttribute('data-src');
    v.preload = 'auto';
    if (onScreen) tryPlay();
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      onScreen = es[0].isIntersecting;
      if (!started) return;
      if (onScreen && !rm.matches) tryPlay(); else v.pause();
    }, { threshold: 0.15 }).observe(v);
  }
  if (document.readyState === 'complete') setTimeout(start, 0);
  else window.addEventListener('load', function () { setTimeout(start, 0); });
  function onPref() { if (rm.matches) { v.pause(); if (media) media.classList.remove('is-playing'); } else { start(); if (started && onScreen) tryPlay(); } }
  if (rm.addEventListener) rm.addEventListener('change', onPref); else if (rm.addListener) rm.addListener(onPref);
})();
