/* Paidia site integrations (added by site-src/build/optimise.py, step "integrations").
   Settings come from site-src/build/config.json; the build writes them into CONFIG below.
   - Forms: Nikki's pages build an email draft (mailto:) when a form is sent. If a form endpoint is set,
     the form is posted to it instead and her existing message line shows a thank-you. If no endpoint is
     set, or the post fails, nothing here interferes and her email draft still works.
   - Office hours: if a Luma link is set, the "Join our Monday office hours" and "Sign up for Monday"
     buttons go there instead of the email sign-up.
   - Booking: if a booking link is set (Maven), every [data-book] link goes there. */
(function () {
  var CONFIG = /*CONFIG*/{};
  var MSG = CONFIG.messages || {};

  function endpointFor(form) {
    if (form.matches('.cp-form, .ln-form')) return CONFIG.course_endpoint || CONFIG.form_endpoint;
    return CONFIG.form_endpoint;
  }
  function kindOf(form) {
    if (form.matches('.cp-form, .ln-form')) return 'course';
    if (form.querySelector('[name="task"]')) return 'booking';
    return 'contact';
  }
  function say(form, text) {
    var m = form.querySelector('.form-msg');
    if (m && text) { m.textContent = text; m.hidden = false; }
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches || !form.matches('form[data-mail]')) return;
    var url = endpointFor(form);
    if (!url) return; // no service configured: Nikki's email draft runs as before
    e.preventDefault();
    e.stopImmediatePropagation(); // capture phase, so her mailto handler never runs
    var kind = kindOf(form), data = new FormData(form);
    // A newsletter tool (course forms) may want its own field names and hidden fields, and may not
    // answer cross-site requests (MailerLite's embed endpoint doesn't): course_* settings cover that.
    var course = kind === 'course' && CONFIG.course_endpoint, rename = (course && CONFIG.course_field_names) || {};
    if (course) {
      var renamed = new FormData();
      data.forEach(function (v, k) { renamed.append(rename[k] || k, v); });
      data = renamed;
      Object.keys(CONFIG.course_extra_fields || {}).forEach(function (k) { data.append(k, CONFIG.course_extra_fields[k]); });
    } else {
      data.append('_subject', form.getAttribute('data-subject') || 'Paidia website form');
      data.append('form', kind);
      data.append('page', location.pathname);
    }
    var blind = !!(course && CONFIG.course_no_cors); // the reply can't be read, so a sent request counts as success
    var btn = form.querySelector('[type="submit"], button:not([type])');
    if (btn) btn.disabled = true;
    fetch(url, blind ? { method: 'POST', body: data, mode: 'no-cors' } : { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) { if (!blind && !r.ok) throw new Error(r.status); say(form, MSG[kind]); form.reset(); })
      .catch(function () { say(form, MSG.failed); })
      .then(function () { if (btn) btn.disabled = false; });
  }, true);

  function retarget(selector, url) {
    if (!url) return;
    document.querySelectorAll(selector).forEach(function (a) {
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
    });
  }
  function links() {
    retarget('[data-luma], [data-oh-signup]', CONFIG.luma_url);
    retarget('[data-book]', CONFIG.booking_url);
  }
  // learn.js sets the sign-up button's mailto when it runs; set ours after everything has loaded.
  if (document.readyState === 'complete') links(); else window.addEventListener('load', links);
})();
