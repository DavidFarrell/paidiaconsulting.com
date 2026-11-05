/* Paidia home page motion (v4, 2 Nov 2026): restrained.
   1. The hero painting drifts gently as the hero scrolls away (scroll-linked, a few per cent).
   2. The three service boxes (icon and text in one sage card) grow in as they scroll into view, after Daniel
      Schwarz's CodePen RNGvRWo: each starts at 70% size, faint and unfilled, then grows to full size and fills
      with sage, one after another; on desktop the outer two tilt 3 degrees outwards. It is tied to the scroll position:
      the boxes grow as you scroll down and shrink straight back as you scroll up.
      Built with GSAP rather than CSS animation-trigger, which only the newest Chrome supports.
   3. Case-study cards rise in once (short, no bounce) when they reach the screen.
   Headings, text, buttons and figures are never animated. Nothing is hidden by CSS; elements are only set to their
   start state by this script (icons never below 40% opacity), so content stays visible if anything fails.
   Runs only when the visitor allows motion. Uses GSAP 3.12.5 ScrollTrigger. */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', function () {
    // 1 hero painting: a slow drift and a touch of zoom while the hero leaves the screen
    var art = document.querySelector('.mo-art');
    var hero = document.querySelector('.mo');
    if (art && hero) {
      gsap.fromTo(art, { y: 0, scale: 1 }, {
        y: -36, scale: 1.03, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6 }
      });
    }

    // 3 once-only reveal for the case-study cards
    function reveal(selector, stagger) {
      var items = gsap.utils.toArray(selector);
      var below = items.filter(function (el) { return el.getBoundingClientRect().top > window.innerHeight * 0.92; });
      if (!below.length) return;
      gsap.set(below, { opacity: 0, y: 16 });
      ScrollTrigger.batch(below, {
        start: 'top 88%', once: true,
        onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: stagger, overwrite: true }); }
      });
      // safety net: if a trigger never fires (for example after an anchor jump), show everything anyway
      setTimeout(function () { below.forEach(function (el) { if (getComputedStyle(el).opacity === '0' && el.getBoundingClientRect().top < window.innerHeight) gsap.to(el, { opacity: 1, y: 0, duration: 0.3 }); }); }, 2500);
    }
    reveal('.mo-cards .cs-grid > li', 0.08);

    return function () {
      gsap.set(gsap.utils.toArray('.mo-art, .svc-item, .mo-cards .cs-grid > li'), { clearProps: 'all' });
    };
  });
  // 2 service boxes, desktop only (4 Nov 2026, 8.45pm, Nikki's mobile pass). On phones and tablets (900px and
  // narrower) the cards used to start at 70% size and 35% opacity until scrolled well into view, which made them look
  // faint and empty; there they now simply show at full size. gsap.matchMedia undoes this animation (and clears its
  // inline styles) when the window narrows past 901px, and site.css ("mobile pass") forces full size and opacity there
  // too, so no script can override it.
  mm.add('(min-width:901px) and (prefers-reduced-motion: no-preference)', function () {
    // 2 service boxes: each whole card (icon and text together) grows in, one after another; reverses on leaving
    var desktop = true; // this context only runs at 901px and wider
    var boxes = gsap.utils.toArray('.svc-item');
    var tilt = desktop ? [-3, 0, 3] : [0, 0, 0], origin = ['right center', 'center', 'left center'];
    // Tied to the scroll: the boxes grow as you scroll down and shrink straight back as you scroll up, with no
    // lag. They are full size once their top is 55% of the way up the screen (desktop) or 70% (phones).
    function growWithScroll(targets, trigger, endAt) {
      var tl = gsap.timeline({ scrollTrigger: { trigger: trigger, start: 'top bottom', end: 'top ' + endAt, scrub: 0.15 } });
      targets.forEach(function (el, n) {
        var i = boxes.indexOf(el);
        tl.fromTo(el,
          { scale: 0.7, opacity: 0.35, backgroundColor: 'rgba(230,214,245,0)', rotation: 0, transformOrigin: origin[i % 3] },
          { scale: 1, opacity: 1, backgroundColor: 'rgba(230,214,245,1)', rotation: tilt[i % 3], duration: 1, ease: 'none' },
          n * 0.25);
      });
    }
    // 4 Nov 2026, 8.45pm (Nikki, mobile pass): desktop only. On phones and tablets (900px and narrower) the cards
    // used to start at 70% size and 35% opacity until scrolled well into view, which made them look faint and empty;
    // there they now simply show at full size. site.css ("mobile pass") also forces this, so no script can undo it.
    if (boxes.length && desktop) growWithScroll(boxes, document.querySelector('.svc-list') || boxes[0], '55%'); // the row, left to right

    return function () { gsap.set(gsap.utils.toArray('.svc-item'), { clearProps: 'all' }); };
  });
})();
