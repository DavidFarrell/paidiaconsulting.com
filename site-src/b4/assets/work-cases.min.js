/* 10 Nov 2026 - Our work (work.html): the eight cases as one list, with the tiles locked under the menu (Nikki, site review).
   Replaces the pinned one-case-at-a-time panel of 2 Nov (the case-stage script, kept in this folder but no longer loaded), which left
   wide empty bands above and below each case. Now the cases run one after another, so the start of the next case is
   always in view at the bottom of the screen. Once you scroll past the eight tiles at the top, a slim row of the same
   eight tiles appears under the menu and stays there until the last case ends: the current case is highlighted and
   a click jumps to any case. Works at every width; on narrow screens the row scrolls sideways.
   CSS: block "Our work: the eight cases as one list" at the end of site.css. */
(function () {
  var header = document.querySelector('.site-header');
  var overview = document.querySelector('.cs-overview');
  var secs = [].slice.call(document.querySelectorAll('.case-sec'));
  if (!header || !overview || secs.length < 2) return;

  var nav = document.createElement('nav');
  nav.className = 'wk-strip'; nav.setAttribute('aria-label', 'Case studies');
  var ul = document.createElement('ul'); nav.appendChild(ul);
  var links = [];
  [].slice.call(overview.querySelectorAll('a.cso-card')).forEach(function (card) {
    var li = document.createElement('li'), a = document.createElement('a');
    a.href = card.getAttribute('href');
    var logo = card.querySelector('.cso-logo'), fig = card.querySelector('.cso-fig');
    if (logo && logo.tagName === 'IMG') { var img = document.createElement('img'); img.src = logo.getAttribute('src'); img.alt = ''; a.appendChild(img); }
    else if (logo) { var svg = logo.cloneNode(true); svg.removeAttribute('class'); svg.setAttribute('class', 'wk-svg'); a.appendChild(svg); } // ZINC's logo is drawn inline
    var s = document.createElement('span'); s.textContent = fig ? fig.textContent : ''; a.appendChild(s);
    var sec = document.getElementById(a.getAttribute('href').slice(1));
    a.setAttribute('aria-label', (sec && sec.getAttribute('data-short') ? sec.getAttribute('data-short') + ': ' : '') + s.textContent);
    li.appendChild(a); ul.appendChild(li); links.push(a);
  });
  header.appendChild(nav);

  var cur = -1, ticking = false;
  function sync() {
    ticking = false;
    var hb = header.querySelector('.bar').getBoundingClientRect().bottom;
    var show = overview.getBoundingClientRect().bottom < hb && secs[secs.length - 1].getBoundingClientRect().bottom > hb + 140;
    header.classList.toggle('has-wk-strip', show);
    var line = header.getBoundingClientRect().bottom + 40, i = 0;
    secs.forEach(function (s, k) { if (s.getBoundingClientRect().top <= line) i = k; });
    if (i !== cur) {
      cur = i;
      links.forEach(function (a, k) { a.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      var a = links[i];
      if (a && ul.scrollWidth > ul.clientWidth) ul.scrollTo({ left: a.parentNode.offsetLeft - 20, behavior: 'smooth' });
    }
    // Room for the menu and the row when a link jumps to a case
    document.documentElement.style.setProperty('--wk-offset', (hb + nav.scrollHeight - 24) + 'px'); // the case's own top padding gives the gap
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
  window.addEventListener('resize', sync);
  sync();
})();
