/*
 * rz-overview - "zoom out" grid of every slide for the <deck-stage> runtime
 * (Merton deck, Oct 2026).
 * --------------------------------------------------------------------------
 *   - Up arrow opens a full-screen grid of every slide (static clones), with
 *     the current slide highlighted and scrolled into view.
 *   - Click a thumbnail to jump there. Or Left / Right to move the selection
 *     and Enter to jump.
 *   - Up again, Down, or Escape closes without moving.
 *   - Slides marked data-deck-skip show dimmed with a SKIPPED badge (they are
 *     still clickable, as a deliberate jump).
 *
 * Coexistence: capture-phase keydown on document. Does nothing while the
 * lightbox is open (window.rzLightbox) and does not open while a thumbnail in
 * deck-stage's own rail has focus (the rail uses Up / Down itself; its focus
 * lives in the deck-stage shadow root, so we check shadowRoot.activeElement).
 * While open it consumes every navigation key so nothing moves underneath.
 */
(function () {
  'use strict';
  if (window.__rzOverviewLoaded) return;
  window.__rzOverviewLoaded = true;

  var STYLE_ID = 'rz-overview-style';
  var W = 1920, H = 1080, COLS = 6;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '.rz-ov{position:fixed;inset:0;z-index:2147483000;background:#120d28;overflow-y:auto;',
      'padding:28px 32px 48px;box-sizing:border-box;display:none;font-family:"JetBrains Mono",monospace;}',
      '.rz-ov.is-open{display:block;}',
      '.rz-ov__head{color:#fbf3d8;opacity:.7;font-size:13px;letter-spacing:.14em;text-transform:uppercase;margin:0 0 18px;}',
      // minmax(0,1fr): the nowrap labels must not widen their columns.
      '.rz-ov__grid{display:grid;grid-template-columns:repeat(' + COLS + ',minmax(0,1fr));gap:18px;}',
      '.rz-ov__tile{position:relative;min-width:0;cursor:pointer;outline:2px solid transparent;outline-offset:3px;}',
      '.rz-ov__frame{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:#2b1f4f;}',
      '.rz-ov__scaler{position:absolute;left:0;top:0;width:' + W + 'px;height:' + H + 'px;transform-origin:0 0;pointer-events:none;}',
      '.rz-ov__scaler > section{position:absolute !important;inset:0 !important;width:100% !important;height:100% !important;',
      'visibility:visible !important;opacity:1 !important;overflow:hidden;}',

      '.rz-ov__lbl{color:#fbf3d8;font-size:12px;letter-spacing:.08em;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.75;}',
      '.rz-ov__tile.is-current .rz-ov__frame{box-shadow:0 0 0 4px #fff200;}',
      '.rz-ov__tile.is-sel{outline-color:#ff5fa2;}',
      '.rz-ov__tile.is-skip .rz-ov__frame{opacity:.35;}',
      '.rz-ov__skip{position:absolute;top:8px;right:8px;background:#ff5fa2;color:#1a1438;font-size:11px;',
      'font-weight:700;letter-spacing:.12em;padding:3px 7px;z-index:2;}',
      '@media print{.rz-ov{display:none !important;}}'
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  var deck = null, root = null, grid = null, opened = false, sel = 0, tiles = [];

  function slides() { return deck ? Array.prototype.slice.call(deck.children).filter(function (c) { return c.tagName === 'SECTION'; }) : []; }

  function railHasFocus() {
    try {
      var a = deck && deck.shadowRoot && deck.shadowRoot.activeElement;
      return !!(a && a.closest && a.closest('.rail'));
    } catch (e) { return false; }
  }

  function cloneFor(section) {
    var c = section.cloneNode(true);
    c.removeAttribute('data-deck-active');
    c.removeAttribute('id');
    Array.prototype.forEach.call(c.querySelectorAll('[id]'), function (el) { el.removeAttribute('id'); });
    Array.prototype.forEach.call(c.querySelectorAll('video'), function (v) {
      v.removeAttribute('autoplay'); v.preload = 'none'; v.muted = true;
    });
    Array.prototype.forEach.call(c.querySelectorAll('iframe, script'), function (f) { f.remove(); });
    Array.prototype.forEach.call(c.querySelectorAll('img'), function (i) { i.loading = 'lazy'; i.setAttribute('data-no-zoom', ''); });
    // Show the slide's FINAL built state, deterministically: every build
    // revealed, and anything with data-step-out <= total builds hidden.
    var total = (window.rzSteps && window.rzSteps.count) ? window.rzSteps.count(section) : 0;
    Array.prototype.forEach.call(c.querySelectorAll('.rz-step-hidden'), function (el) { el.classList.remove('rz-step-hidden'); });
    if (total) {
      Array.prototype.forEach.call(c.querySelectorAll('[data-step-out]'), function (el) {
        var o = parseInt(el.getAttribute('data-step-out'), 10);
        if (!isNaN(o) && o <= total) el.classList.add('rz-step-hidden');
      });
    }
    return c;
  }

  function build() {
    grid.innerHTML = '';
    tiles = [];
    var all = slides();
    all.forEach(function (s, i) {
      var tile = document.createElement('div');
      tile.className = 'rz-ov__tile';
      if (s.hasAttribute('data-deck-skip')) tile.classList.add('is-skip');
      var frame = document.createElement('div'); frame.className = 'rz-ov__frame';
      var scaler = document.createElement('div'); scaler.className = 'rz-ov__scaler';
      scaler.appendChild(cloneFor(s));
      frame.appendChild(scaler);
      if (s.hasAttribute('data-deck-skip')) {
        var b = document.createElement('div'); b.className = 'rz-ov__skip'; b.textContent = 'SKIPPED'; frame.appendChild(b);
      }
      var lbl = document.createElement('div'); lbl.className = 'rz-ov__lbl';
      lbl.textContent = String(i + 1).padStart(2, '0') + '  ' + (s.getAttribute('data-label') || '');
      tile.appendChild(frame); tile.appendChild(lbl);
      tile.addEventListener('click', function (e) { e.stopPropagation(); jump(i); });
      grid.appendChild(tile);
      tiles.push(tile);
    });
    scale();
  }

  function scale() {
    if (!tiles.length) return;
    var fw = tiles[0].querySelector('.rz-ov__frame').getBoundingClientRect().width;
    var k = fw / W;
    tiles.forEach(function (t) { t.querySelector('.rz-ov__scaler').style.transform = 'scale(' + k + ')'; });
  }

  function select(i) {
    if (!tiles.length) return;
    sel = Math.max(0, Math.min(tiles.length - 1, i));
    tiles.forEach(function (t, j) { t.classList.toggle('is-sel', j === sel); });
    tiles[sel].scrollIntoView({ block: 'nearest' });
  }

  function open() {
    if (opened || !deck) return;
    if (!root) {
      root = document.createElement('div'); root.className = 'rz-ov';
      var head = document.createElement('div'); head.className = 'rz-ov__head';
      head.textContent = 'All slides  ·  click or Enter to jump  ·  Left/Right to move  ·  Up, Down or Esc to close';
      grid = document.createElement('div'); grid.className = 'rz-ov__grid';
      root.appendChild(head); root.appendChild(grid);
      root.addEventListener('click', function (e) { if (e.target === root) close(); });
      document.body.appendChild(root);
    }
    opened = true;
    root.classList.add('is-open');
    build();
    var cur = deck.index || 0;
    tiles.forEach(function (t, j) { t.classList.toggle('is-current', j === cur); });
    select(cur);
    tiles[cur] && tiles[cur].scrollIntoView({ block: 'center' });
  }

  function close() {
    if (!opened) return;
    opened = false;
    root.classList.remove('is-open');
    grid.innerHTML = '';          // drop the clones (and their decoded images)
    tiles = [];
  }

  function jump(i) {
    close();
    if (deck && typeof deck.goTo === 'function') deck.goTo(i);
  }

  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (window.rzLightbox && window.rzLightbox.isOpen && window.rzLightbox.isOpen()) return;
    var k = e.key;
    if (!opened) {
      // (No rail-focus guard: this runs at document capture, before a focused
      // rail thumb's own Up handler, and stops it - so Up always opens the grid.)
      if (k === 'ArrowUp') {
        e.stopImmediatePropagation(); e.preventDefault();
        open();
      }
      return;
    }
    // Open: consume navigation keys.
    var handled = true;
    if (k === 'ArrowUp' || k === 'ArrowDown' || k === 'Escape') close();
    else if (k === 'ArrowRight') select(sel + 1);
    else if (k === 'ArrowLeft') select(sel - 1);
    else if (k === 'Enter' || k === ' ') jump(sel);
    else if (k === 'Home') select(0);
    else if (k === 'End') select(tiles.length - 1);
    else if (k === 'PageDown' || k === 'PageUp' || k === 'Tab' || /^[0-9]$/.test(k) || k === 'r' || k === 'R') { /* swallow */ }
    else handled = false;
    if (handled) { e.stopImmediatePropagation(); e.preventDefault(); }
  }

  function init() {
    injectStyle();
    deck = document.querySelector('deck-stage');
    window.addEventListener('resize', function () { if (opened) scale(); });
  }

  document.addEventListener('keydown', onKey, true);
  window.rzOverview = { isOpen: function () { return opened; }, open: open, close: close };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
