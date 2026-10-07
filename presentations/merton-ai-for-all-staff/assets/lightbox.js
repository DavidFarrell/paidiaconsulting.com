/*
 * rz-lightbox — default click-to-zoom image viewer for the Riso Zine system.
 * --------------------------------------------------------------------------
 * Self-contained, dependency-free, injects its own CSS. Loads by default on
 * BOTH decks and websites built with this system — zero per-project wiring.
 *
 *   - Click any <img> or filled <image-slot> to open it full-viewport.
 *   - MERTON DECK VARIANT (David's spec, 7 Oct 2026): Left / Right CLOSE the
 *     viewer (they do not step between images - on a multi-image slide the
 *     slide-level image-steps.js does that job). A click ANYWHERE (backdrop
 *     or the image itself) closes. Escape closes. Space / PgUp / PgDn / Tab
 *     are swallowed while open so the slide never moves underneath.
 *   - window.rzLightbox.isOpen() is exported so image-steps.js / overview.js
 *     can tell the viewer is up.
 *   - <video> is never hijacked (native fullscreen is left intact).
 *   - Opt out per-image with the `data-no-zoom` attribute.
 *
 * Deck coexistence: the deck-stage component uses Left / Right / Space for
 * SLIDE navigation, listening on `window` at the bubble phase. This module
 * registers its keydown handler at the CAPTURE phase and, WHILE THE MODAL IS
 * OPEN, consumes Left / Right / Escape / Space / Tab (stopPropagation +
 * preventDefault) so deck-stage never sees them. WHILE CLOSED the capture
 * listener is removed entirely, so slide navigation and any host page's own
 * key handling are fully intact.
 */
(function () {
  'use strict';

  if (window.__rzLightboxLoaded) return;        // singleton — safe if double-included
  window.__rzLightboxLoaded = true;

  var STYLE_ID = 'rz-lightbox-style';

  // ── self-injected styles ────────────────────────────────────────────────
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var css = [
      // A single persistent overlay, toggled by `.is-open` — never duplicated,
      // so a fast reopen can never race a still-fading-out element. Closed, it
      // is invisible AND inert (visibility:hidden + pointer-events:none).
      '.rz-lightbox{position:fixed;inset:0;z-index:2147483647;display:flex;',
      'align-items:center;justify-content:center;background:rgba(26,20,56,0.92);',
      'cursor:zoom-out;opacity:0;visibility:hidden;pointer-events:none;',
      'transition:opacity .15s ease, visibility .15s ease;}',
      '.rz-lightbox.is-open{opacity:1;visibility:visible;pointer-events:auto;}',
      '.rz-lightbox__img{max-width:92vw;max-height:92vh;object-fit:contain;',
      'cursor:default;box-shadow:0 24px 80px rgba(0,0,0,.5);border-radius:8px;',
      'background:transparent;}',
      // zoom-in affordance on anything zoomable (not the viewer's own image,
      // not opted-out images, not video).
      'img:not([data-no-zoom]):not(.rz-lightbox__img),',
      'image-slot:not([data-no-zoom]){cursor:zoom-in;}',
      '@media (prefers-reduced-motion: reduce){.rz-lightbox{transition:none;}}'
    ].join('');
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  // ── source reading ──────────────────────────────────────────────────────
  // For <image-slot>, prefer the inner rendered <img> src (so a user-dropped
  // data-URL still enlarges); fall back to the host `src` attribute resolved
  // against document.baseURI.
  function slotSrc(slot) {
    try {
      var inner = slot.shadowRoot &&
        slot.shadowRoot.querySelector('img[part="image"], .frame img');
      if (inner && inner.getAttribute('src') && inner.src) return inner.src;
    } catch (e) { /* closed shadow / nothing rendered yet */ }
    var attr = slot.getAttribute('src');
    if (attr) {
      try { return new URL(attr, document.baseURI).href; } catch (e2) { return attr; }
    }
    return '';
  }

  function srcOf(el) {
    if (el.tagName === 'IMAGE-SLOT') return slotSrc(el);
    return el.currentSrc || el.src || '';
  }

  function isZoomable(el) {
    if (!el || !el.tagName) return false;
    if (el.hasAttribute('data-no-zoom')) return false;
    if (el.classList && el.classList.contains('rz-lightbox__img')) return false;
    if (el.closest && el.closest('video')) return false;
    if (el.tagName === 'IMG') return true;
    if (el.tagName === 'IMAGE-SLOT') return !!slotSrc(el);
    return false;
  }

  // The navigable set: every zoomable image in the same deck slide, or — when
  // not inside a deck — the whole document, in document order. querySelectorAll
  // does not pierce shadow DOM, so it returns light-DOM <img> + <image-slot>
  // hosts only (never an image-slot's internal shadow <img>).
  function siblingsOf(el) {
    var scope = (el.closest && el.closest('[data-deck-slide]')) || document;
    var found = Array.prototype.slice.call(scope.querySelectorAll('img, image-slot'));
    return found.filter(isZoomable);
  }

  // ── modal state ─────────────────────────────────────────────────────────
  // One persistent overlay element, reused for every open. `opened` is the
  // single source of truth — never inferred from DOM presence.
  var overlay = null, viewer = null, opened = false;
  var list = [], idx = 0, trigger = null, prevFocus = null;

  function isOpen() { return opened; }

  function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'rz-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.tabIndex = -1;

    viewer = document.createElement('img');
    viewer.className = 'rz-lightbox__img';
    overlay.appendChild(viewer);

    // Merton variant: a click anywhere (backdrop OR image) closes.
    overlay.addEventListener('click', function (e) {
      e.stopPropagation();
      close();
    });

    document.body.appendChild(overlay);
  }

  function open(el) {
    if (opened) return;
    list = siblingsOf(el);
    idx = list.indexOf(el);
    if (idx < 0) { list = [el]; idx = 0; }
    trigger = el;
    prevFocus = document.activeElement;

    ensureOverlay();
    render();
    opened = true;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.focus();

    // Capture phase: win the key before deck-stage's bubble-phase window handler.
    document.addEventListener('keydown', onKey, true);
  }

  function render() {
    var el = list[idx];
    viewer.src = srcOf(el);
    var alt = (el.getAttribute && (el.getAttribute('alt') || el.getAttribute('aria-label'))) || '';
    viewer.alt = alt;
    overlay.setAttribute('aria-label', alt ? ('Image viewer: ' + alt) : 'Image viewer');
  }

  // Step within the set; pushing past either end closes the viewer.
  function step(dir) {
    var next = idx + dir;
    if (next < 0 || next >= list.length) { close(); return; }
    idx = next;
    render();
  }

  function close() {
    if (!opened) return;
    opened = false;
    document.removeEventListener('keydown', onKey, true);
    overlay.classList.remove('is-open');           // fades out; element stays for reuse
    overlay.setAttribute('aria-hidden', 'true');
    // Restore focus to the triggering image, else wherever it was.
    var t = trigger; trigger = null;
    try {
      if (t && t.focus) t.focus();
      else if (prevFocus && prevFocus.focus) prevFocus.focus();
    } catch (e) { /* element gone */ }
  }

  function onKey(e) {
    if (!isOpen()) return;                          // defensive — listener is removed on close
    var k = e.key;
    // Merton variant: while the viewer is up NOTHING reaches the deck (so R,
    // Home, End, 0-9 can't move the slide underneath). L passes through for
    // the laser (it runs earlier, at window capture, anyway); modified keys
    // (browser shortcuts) pass through untouched.
    if (k === 'l' || k === 'L' || e.metaKey || e.ctrlKey || e.altKey) return;
    e.stopPropagation();
    e.preventDefault();
    // Escape, Left and Right close; everything else is swallowed.
    if (k === 'Escape' || k === 'ArrowRight' || k === 'ArrowLeft') close();
  }

  // ── open on click ───────────────────────────────────────────────────────
  // Bubble phase: a click inside an <image-slot> retargets to the host; a
  // click on a slotted light-DOM <img> reports the <img>. Both resolve here.
  document.addEventListener('click', function (e) {
    if (isOpen()) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var el = e.target;
    if (!el || !el.closest) return;
    if (el.closest('.rz-lightbox')) return;          // ignore the viewer's own DOM
    var z = el.closest('img, image-slot');
    if (!z || !isZoomable(z)) return;
    // Leave linked images to their link (commonly the full-res target).
    if (z.tagName === 'IMG' && z.closest('a[href]')) return;
    e.preventDefault();
    open(z);
  });

  window.rzLightbox = { isOpen: isOpen, close: close };

  // Create the overlay up front, so the laser dot (appended to <body> when L
  // is pressed) always sits after it and paints above it.
  function boot() { injectStyle(); ensureOverlay(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
