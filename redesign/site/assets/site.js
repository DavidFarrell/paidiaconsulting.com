// Paidia Consulting - small site behaviours. No dependencies.
// BOOKING_URL: paste the Papperlapapp booking page (David's calendar on hello@) here once it exists.
// While it is empty, every "Book a call" link goes to the contact page instead.
var PAIDIA = { BOOKING_URL: "", EMAIL: "info@paidiaconsulting.com" };

(function () {
  document.documentElement.classList.add("js");
  // Quotes rise gently into view; everything is visible without this
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });
  } else { document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  document.querySelectorAll("[data-book]").forEach(function (a) {
    if (PAIDIA.BOOKING_URL) { a.href = PAIDIA.BOOKING_URL; a.target = "_blank"; a.rel = "noopener"; }
    else { a.href = a.getAttribute("data-fallback") || "contact.html"; }
  });

  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Close" : "Menu";
    });
    var closeMenu = function () { if (nav.classList.contains("open")) { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); btn.textContent = "Menu"; } };
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    document.addEventListener("click", function (e) { if (!e.target.closest(".site-header")) closeMenu(); });
  }

  // Header: tuck away when scrolling down, come back on scroll up or keyboard focus
  var head = document.querySelector(".site-header");
  if (head) {
    var lastY = window.scrollY, ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY, menuOpen = nav && nav.classList.contains("open");
        if (Math.abs(y - lastY) > 120) { lastY = y; ticking = false; return; } // an anchor jump, not a scroll: leave the header as it is
        if (y > 160 && y > lastY + 4 && !menuOpen && window.innerWidth > 900) head.classList.add("is-hidden");
        else if (y < lastY - 4 || y <= 160) head.classList.remove("is-hidden");
        lastY = y; ticking = false;
      });
    }, { passive: true });
    document.addEventListener("keydown", function (e) { if (e.key === "Tab") head.classList.remove("is-hidden"); });
  }

  // Forms: build an email draft (nothing is sent or stored by the site). Replace with Tally / Cal.com / Luma before launch.
  document.querySelectorAll("form[data-mail]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var subject = f.getAttribute("data-subject") || "Hello from the website", lines = [];
      f.querySelectorAll("input,textarea,select").forEach(function (i) {
        if (i.type === "checkbox" || i.type === "radio") { if (i.checked) lines.push((i.getAttribute("data-label") || i.name) + ": " + (i.value === "on" ? "yes" : i.value)); }
        else if (i.value) lines.push((i.getAttribute("data-label") || i.name) + ": " + i.value);
      });
      var msg = f.querySelector(".form-msg"); if (msg) msg.hidden = false;
      window.location.href = "mailto:" + PAIDIA.EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
    });
  });
})();

// The scroll-linked fade (a16z-style) was removed on 25 Oct 2026 after site review 3: it took the bottom third of every screen below WCAG contrast. Backup: site.js.bak-2026-10-25-tiera
