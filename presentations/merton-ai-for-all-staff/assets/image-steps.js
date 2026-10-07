/*
 * rz-steps - slide-level builds for the <deck-stage> runtime (Merton deck, Oct 2026).
 * --------------------------------------------------------------------------
 * David's spec: on a slide with several images, Right steps through them
 * first (each press reveals the next one, like a build); Right after the last
 * one goes to the next slide. Left steps back, then to the previous slide.
 * A slide with one image: Right just advances.
 *
 * Authoring (opt-in per slide, so plain slides are untouched):
 *
 *   <section data-steps> ...
 *     <img src="a.png">                          visible on arrival
 *     <img src="b.png" data-step>                revealed by the 1st Right
 *     <li data-step>...</li>                     revealed by the 2nd Right
 *   </section>
 *
 *   - [data-step] elements are hidden until revealed, in document order.
 *   - data-step="k" (a number, 1-based) puts an element in build group k, so
 *     a bullet and its image can appear on the SAME press. Unnumbered
 *     [data-step] elements take the next free numbers in document order.
 *     The slide's step count is the highest group number.
 *   - data-step-out="k" (on ANY element in the slide) hides it again once k
 *     steps have been revealed - so a stack of images can REPLACE each other:
 *       <img src="a" data-step-out="1">
 *       <img src="b" data-step data-step-out="2">
 *       <img src="c" data-step>
 *
 * Direction: arriving at a slide going FORWARD starts it at step 0; arriving
 * going BACKWARD shows it fully built, so Left walks the builds back.
 *
 * Key coexistence (all listeners are capture-phase, so this runs before
 * deck-stage's bubble-phase window handler):
 *   - laser-pointer.js owns L / Escape on window capture (fires first).
 *   - lightbox.js adds a document-capture listener only while open. It is
 *     added AFTER this one, so this one would fire first - hence the explicit
 *     window.rzLightbox.isOpen() check: while the viewer is up we do nothing
 *     and lightbox closes on Left / Right.
 *   - overview.js: while the overview grid is open we do nothing.
 * When a step is consumed we stopImmediatePropagation + preventDefault so
 * deck-stage never sees the key.
 */
(function () {
  'use strict';
  if (window.__rzStepsLoaded) return;
  window.__rzStepsLoaded = true;

  var STYLE_ID = 'rz-steps-style';
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '[data-step],[data-step-out]{transition:opacity .18s ease;}',
      '.rz-step-hidden{opacity:0 !important;visibility:hidden !important;pointer-events:none !important;}',
      // Print / PDF: beforeprint (below) puts every slide in its final state.
      '@media print{[data-step-out].rz-step-hidden{display:none !important;}}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  var deck = null;
  var cur = new WeakMap();          // slide element -> revealed step count

  function stepsOf(slide) {
    if (!slide || !slide.hasAttribute || !slide.hasAttribute('data-steps')) return [];
    return Array.prototype.slice.call(slide.querySelectorAll('[data-step]'));
  }

  // Group number for each step element (explicit data-step="k", else next free).
  function groupsOf(slide) {
    var els = stepsOf(slide), used = {}, map = new Map(), next = 1, max = 0;
    els.forEach(function (el) {
      var k = parseInt(el.getAttribute('data-step'), 10);
      if (!isNaN(k) && k > 0) { map.set(el, k); used[k] = true; }
    });
    els.forEach(function (el) {
      if (map.has(el)) return;
      while (used[next]) next++;
      map.set(el, next); used[next] = true;
    });
    map.forEach(function (k) { if (k > max) max = k; });
    return { map: map, count: max };
  }

  function countOf(slide) { return groupsOf(slide).count; }

  // Stop any video / YouTube player inside an element a build is hiding.
  function pauseIn(el) {
    Array.prototype.forEach.call(el.querySelectorAll('video, audio'), function (m) { try { m.pause(); } catch (e) {} });
    Array.prototype.forEach.call(el.querySelectorAll('iframe[src*="youtube"]'), function (f) {
      try { f.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*'); } catch (e) {}
    });
  }

  function apply(slide) {
    var g = groupsOf(slide);
    if (!g.count) return;
    var wasVisible = [];
    Array.prototype.forEach.call(slide.querySelectorAll('[data-step], [data-step-out]'), function (el) {
      if (!el.classList.contains('rz-step-hidden')) wasVisible.push(el);
    });
    var n = cur.get(slide) || 0;
    g.map.forEach(function (k, el) { el.classList.toggle('rz-step-hidden', k > n); });
    Array.prototype.forEach.call(slide.querySelectorAll('[data-step-out]'), function (el) {
      var out = parseInt(el.getAttribute('data-step-out'), 10);
      var notYet = g.map.has(el) && g.map.get(el) > n;
      el.classList.toggle('rz-step-hidden', notYet || (!isNaN(out) && n >= out));
    });
    wasVisible.forEach(function (el) { if (el.classList.contains('rz-step-hidden')) pauseIn(el); });
  }

  function activeSlide() {
    if (!deck) return null;
    return deck.querySelector(':scope > [data-deck-active]');
  }

  function busy() {
    if (window.rzLightbox && window.rzLightbox.isOpen && window.rzLightbox.isOpen()) return true;
    if (window.rzOverview && window.rzOverview.isOpen && window.rzOverview.isOpen()) return true;
    return false;
  }

  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (busy()) return;
    var k = e.key;
    var fwd = (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'Spacebar');
    var back = (k === 'ArrowLeft' || k === 'PageUp');
    if (!fwd && !back) return;
    var slide = activeSlide();
    var total = countOf(slide);
    if (!total) return;
    var n = cur.get(slide) || 0;
    if (fwd && n < total) n++;
    else if (back && n > 0) n--;
    else return;                                   // at an end: let deck-stage change slide
    cur.set(slide, n);
    apply(slide);
    e.stopImmediatePropagation();
    e.preventDefault();
  }

  // ?build=all in the URL shows every slide fully built (review / screenshots).
  var ALL = /[?&]build=all\b/.test(location.search);

  function onSlideChange(e) {
    var d = e.detail || {};
    var slide = d.slide;
    var total = countOf(slide);
    if (!total) return;
    if (d.reason === 'mutation') { apply(slide); return; }   // rail reorder/delete: keep state
    // Fully built only when stepping BACK from the next visible slide (Left /
    // PgUp). Jumps backwards (Home, R, numbers, overview, rail) start at 0.
    var backward = false;
    if (d.previousIndex > d.index && d.previousIndex >= 0) {
      backward = true;
      for (var j = d.index + 1; j < d.previousIndex; j++) {
        if (!deck.children[j].hasAttribute('data-deck-skip')) { backward = false; break; }
      }
    }
    cur.set(slide, (backward || ALL) ? total : 0);
    apply(slide);
  }

  function init() {
    injectStyle();
    deck = document.querySelector('deck-stage');
    if (!deck) return;
    // Initial state for every stepped slide: nothing revealed.
    Array.prototype.forEach.call(deck.children, function (s) {
      if (countOf(s)) { cur.set(s, ALL ? countOf(s) : 0); apply(s); }
    });
    deck.addEventListener('slidechange', onSlideChange);
    // The initial slidechange may already have fired (reason 'init').
    var a = activeSlide();
    if (a && countOf(a)) { cur.set(a, ALL ? countOf(a) : 0); apply(a); }
  }

  document.addEventListener('keydown', onKey, true);
  // Print / PDF: every slide in its final built state, then restore.
  var saved = null;
  window.addEventListener('beforeprint', function () {
    if (!deck) return;
    saved = new Map();
    Array.prototype.forEach.call(deck.children, function (sl) {
      var t = countOf(sl);
      if (t) { saved.set(sl, cur.get(sl) || 0); cur.set(sl, t); apply(sl); }
    });
  });
  window.addEventListener('afterprint', function () {
    if (!saved) return;
    saved.forEach(function (n, sl) { cur.set(sl, n); apply(sl); });
    saved = null;
  });
  window.rzSteps = {
    reset: function (slide) { cur.set(slide, 0); apply(slide); },
    revealAll: function (slide) { cur.set(slide, countOf(slide)); apply(slide); },
    count: countOf,
    current: function (slide) { return cur.get(slide) || 0; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
