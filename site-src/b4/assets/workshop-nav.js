/* Workshop page: the section bar takes the menu pill's place (4 Nov 2026, 10pm, Nikki; reviewed by a second agent).
   - Once the section bar ("Overview ... FAQ") reaches the menu pill, scrolling down slides the pill up out of view and
     the bar moves to the top in its place. Scrolling up by 40px or more brings the pill back with the bar under it.
     The pill also comes back when anything in it has keyboard focus, when the footer is reached,
     and while the phone menu is open.
   - Tapping a section link never brings the pill back over the heading it lands on: the reveal is held until the
     jump ends.
   - The bar highlights the section being read (aria-current="location"); "What's included" counts as "Who it's for"
     and the reviews as "Who teaches it". On phones the bar scrolls sideways to keep that link in view.
   - Everything moves with transform only; with reduced motion it swaps instantly (CSS). Nothing is hidden from
     screen readers or from the Tab order. Without JavaScript the page keeps the old behaviour.
   CSS: "section bar takes the menu pill's place" at the end of site.css (scoped to html.ws-nav). */
(function () {
  var bar = document.querySelector('.mv-tabs'), head = document.querySelector('.site-header');
  if (!bar || !head || !('IntersectionObserver' in window)) return;
  var root = document.documentElement, track = bar.querySelector('.wrap') || bar;
  var menuBtn = document.querySelector('.menu-btn'), footer = document.querySelector('.site-footer');
  root.classList.add('ws-nav');

  // a 1px marker just above the bar tells us when the bar has reached its sticky place
  var mark = document.createElement('div');
  mark.setAttribute('aria-hidden', 'true');
  mark.style.cssText = 'height:1px;margin-bottom:-1px';
  bar.parentNode.insertBefore(mark, bar);

  // the bar rests just under the pill, whatever height the pill has (it shrinks after scrolling)
  var restTop = 96;
  function measure() {
    restTop = Math.round(head.offsetHeight + 8); // layout height, unaffected by the slide
    root.style.setProperty('--ws-tabs-top', restTop + 'px');
  }
  measure();
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(head);
  window.addEventListener('resize', measure);

  var lastY = window.scrollY, upFrom = null, jumping = false, jumpTimer = null, ticking = false;
  function menuOpen() { return menuBtn && menuBtn.getAttribute('aria-expanded') === 'true'; }
  // keyboard focus in the menu pill (not a mouse or finger tap) brings it back and keeps it until focus leaves it
  var headFocus = false;
  head.addEventListener('focusin', function (e) {
    var kb = true; try { kb = e.target.matches(':focus-visible'); } catch (err) {}
    if (kb) { headFocus = true; setTucked(false); }
  });
  head.addEventListener('focusout', function () { setTimeout(function () { if (!head.contains(document.activeElement)) headFocus = false; }, 0); });
  function setTucked(on) { root.classList.toggle('ws-tucked', !!on); }

  function update() {
    ticking = false;
    var y = window.scrollY;
    var passed = mark.getBoundingClientRect().top <= restTop + 1;
    var atEnd = footer && footer.getBoundingClientRect().top < window.innerHeight;
    if (!passed || atEnd || menuOpen() || headFocus) { setTucked(false); upFrom = null; lastY = y; return; }
    if (y > lastY) { upFrom = null; setTucked(true); }                      // scrolling down
    else if (y < lastY) {                                                      // scrolling up
      if (upFrom === null) upFrom = lastY;
      if (!jumping && upFrom - y >= 40) setTucked(false);
    }
    lastY = y;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });

  // section links: hold the reveal until the jump has finished
  function endJump() { jumping = false; clearTimeout(jumpTimer); upFrom = null; lastY = window.scrollY; }
  bar.addEventListener('click', function (e) {
    if (!e.target.closest('a[href^="#"]')) return;
    jumping = true; clearTimeout(jumpTimer); jumpTimer = setTimeout(endJump, 1200);
    if (passed()) setTucked(true);
  });
  function passed() { return mark.getBoundingClientRect().top <= restTop + 1; }
  if ('onscrollend' in window) window.addEventListener('scrollend', function () { if (jumping) endJump(); });
  if (menuBtn) menuBtn.addEventListener('click', function () { setTimeout(update, 0); });

  // highlight the section being read
  var links = {};
  [].slice.call(bar.querySelectorAll('a[href^="#"]')).forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var alias = { included: 'for', reviews: 'teacher' };
  var current = null;
  function setCurrent(id) {
    var key = alias[id] || id, a = links[key];
    if (!a || a === current) return;
    if (current) current.removeAttribute('aria-current');
    a.setAttribute('aria-current', 'location');
    current = a;
    // keep it in view inside the sideways-scrolling bar, without moving the page
    var l = a.offsetLeft, w = a.offsetWidth, vl = track.scrollLeft, vw = track.clientWidth;
    if (l < vl + 8 || l + w > vl + vw - 8) {
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      try { track.scrollTo({ left: Math.max(0, l - 16), behavior: reduce ? 'auto' : 'smooth' }); } catch (err) { track.scrollLeft = Math.max(0, l - 16); }
    }
  }
  function clearCurrent() { if (current) current.removeAttribute('aria-current'); current = null; }
  var ids = ['overview', 'learn', 'for', 'included', 'syllabus', 'teacher', 'reviews', 'faq'];
  var secs = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var spy = new IntersectionObserver(function () {
    // the section crossing a line 40% down the screen is the one being read
    var line = window.innerHeight * 0.4, hit = null;
    secs.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= line && r.bottom > line) hit = s; });
    if (hit) setCurrent(hit.id); else if (secs.length && secs[0].getBoundingClientRect().top > line) clearCurrent();
  }, { rootMargin: '-40% 0px -59% 0px', threshold: 0 });
  secs.forEach(function (s) { spy.observe(s); });
})();
