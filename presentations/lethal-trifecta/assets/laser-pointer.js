/*
 * rz-laser — presenter laser pointer for the Riso Zine deck system.
 * --------------------------------------------------------------------------
 * Self-contained, dependency-free, injects its own CSS. Drop it into a deck
 * and the presenter can turn the mouse into a red laser dot mid-talk — handy
 * when projecting and pointing at part of a slide.
 *
 *   - Press  L  to toggle the pointer on/off. While on, the system cursor is
 *     hidden and a glowing red dot follows the mouse. Press L (or Escape)
 *     again to turn it off.
 *   - The dot has pointer-events:none, so clicking still advances the slide
 *     (deck-stage's click-to-advance, links, the lightbox) while you point.
 *   - Sits above everything, including a zoomed lightbox image.
 *
 * Deck coexistence: deck-stage listens for navigation keys on `window` at the
 * bubble phase. This module registers at the CAPTURE phase and, only for the
 * keys it owns (L, and Escape while active), calls stopImmediatePropagation +
 * preventDefault so deck-stage never sees them. Every other key passes through
 * untouched, so slide navigation is fully intact.
 *
 * Deck-only: load this alongside deck-stage.js. There's no reason to load it
 * on a website build.
 */
(function () {
  'use strict';

  if (window.__rzLaserLoaded) return;            // singleton — safe if double-included
  window.__rzLaserLoaded = true;

  var STYLE_ID = 'rz-laser-style';

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var css = [
      '#rz-laser{position:fixed;z-index:2147483647;width:18px;height:18px;',
      'margin-left:-9px;margin-top:-9px;border-radius:50%;display:none;',
      'pointer-events:none;',
      'background:radial-gradient(circle,#ff3b30 0%,#ff3b30 38%,',
      'rgba(255,59,48,0.55) 60%,rgba(255,59,48,0) 75%);',
      'box-shadow:0 0 14px 4px rgba(255,59,48,0.6);}',
      'body.rz-laser-on,body.rz-laser-on *{cursor:none !important;}'
    ].join('');
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  var dot = null, on = false, x = -100, y = -100;

  function ensureDot() {
    if (dot) return dot;
    dot = document.createElement('div');
    dot.id = 'rz-laser';
    document.body.appendChild(dot);
    return dot;
  }

  function place() { if (dot) { dot.style.left = x + 'px'; dot.style.top = y + 'px'; } }

  function setOn(v) {
    on = v;
    ensureDot();
    if (on) {
      document.body.appendChild(dot);               // move to end so it paints above the lightbox
      document.body.classList.add('rz-laser-on');
      dot.style.display = 'block';
      place();
    } else {
      document.body.classList.remove('rz-laser-on');
      dot.style.display = 'none';
    }
  }

  document.addEventListener('mousemove', function (e) {
    x = e.clientX; y = e.clientY; if (on) place();
  }, true);

  // Capture phase: own L (and Escape while active) before deck-stage sees them.
  window.addEventListener('keydown', function (e) {
    if (e.key === 'l' || e.key === 'L') {
      if (e.metaKey || e.ctrlKey || e.altKey) return;  // leave shortcuts alone
      e.stopImmediatePropagation(); e.preventDefault();
      setOn(!on);
      return;
    }
    if (on && e.key === 'Escape') {
      e.stopImmediatePropagation(); e.preventDefault();
      setOn(false);
    }
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyle);
  } else {
    injectStyle();
  }
})();
