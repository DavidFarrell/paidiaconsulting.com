/* Paidia site integrations (added by site-src/build/optimise.py, step "integrations").
   Settings come from site-src/build/config.json; the build writes them into CONFIG below.
   - Forms: Nikki's pages build an email draft (mailto:) when a form is sent. If a form endpoint is set,
     the form is posted to it instead and her existing message line shows a thank-you. If no endpoint is
     set, or the post fails, nothing here interferes and her email draft still works.
   - Office hours (replaced by free Maven Lightning Lessons on 11 Nov 2026): if a Luma link is set, any
     [data-luma] or [data-oh-signup] link goes there. No page has one now.
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

  // Contact enquiries get a fuller acknowledgement: thank them by name, confirm where the reply
  // will go, and offer one easy next step while they wait.
  function thank(form) {
    var first = ((form.elements.first || {}).value || '').trim();
    var email = ((form.elements.email || {}).value || '').trim();
    var h = form.querySelector('h2');
    if (h) h.textContent = first ? 'Thank you, ' + first + '.' : 'Thank you.';
    var m = form.querySelector('.form-msg');
    if (!m) return;
    m.textContent = '';
    m.appendChild(document.createTextNode('Your message has reached David and Nikki, and we will be in touch shortly' + (email ? ' at ' : '.')));
    if (email) { var b = document.createElement('b'); b.textContent = email; m.appendChild(b); m.appendChild(document.createTextNode('.')); }
    var p = document.createElement('p'); p.className = 'note form-next';
    p.appendChild(document.createTextNode('If our reply does not turn up, check your spam folder or email us at '));
    var a = document.createElement('a'); a.href = 'mailto:info@paidiaconsulting.com'; a.textContent = 'info@paidiaconsulting.com';
    p.appendChild(a); p.appendChild(document.createTextNode('. In the meantime, you are welcome to '));
    var oh = document.createElement('a'); oh.href = 'learn.html#upcoming'; oh.textContent = 'join one of our free Lightning Lessons';
    p.appendChild(oh); p.appendChild(document.createTextNode('.'));
    var old = form.querySelector('.form-next'); if (old) old.remove();
    m.insertAdjacentElement('afterend', p);
    m.hidden = false;
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
    // answer cross-site requests: course_* settings cover that. (MailerLite's embed endpoint does answer.)
    var course = kind === 'course' && CONFIG.course_endpoint, rename = (course && CONFIG.course_field_names) || {};
    if (course) {
      var renamed = new FormData();
      data.forEach(function (v, k) { renamed.append(rename[k] || k, v); });
      data = renamed;
      Object.keys(CONFIG.course_extra_fields || {}).forEach(function (k) { data.append(k, CONFIG.course_extra_fields[k]); });
    } else {
      // Formspark's names for the notification email's subject and sender name
      data.append('_email.subject', form.getAttribute('data-subject') || 'Paidia website form');
      data.append('_email.from', 'Paidia website');
      data.append('form', kind);
      data.append('page', location.pathname);
    }
    var blind = !!(course && CONFIG.course_no_cors); // the reply can't be read, so a sent request counts as success
    var btn = form.querySelector('[type="submit"], button:not([type])');
    if (btn) btn.disabled = true;
    fetch(url, blind ? { method: 'POST', body: data, mode: 'no-cors' } : { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (blind) return;
        if (!r.ok) throw new Error(r.status);
        // MailerLite answers 200 with {"success":false} when it rejects a sign-up
        return r.json().catch(function () { return {}; }).then(function (b) { if (b.success === false) throw new Error('rejected'); });
      })
      .then(function () {
        if (kind === 'contact') thank(form); else say(form, MSG[kind]);
        form.reset();
        // The fields give way to the thank-you line (styled by the build), which takes focus
        // because the button it replaces had it.
        form.classList.add('is-sent');
        var m = form.querySelector('.form-msg');
        if (m) { m.setAttribute('tabindex', '-1'); m.focus(); }
      })
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
  // Screen readers announce the thank-you or failure line when it appears.
  document.querySelectorAll('form[data-mail] .form-msg').forEach(function (m) { m.setAttribute('role', 'status'); });

  // learn.js sets the sign-up button's mailto when it runs; set ours after everything has loaded.
  if (document.readyState === 'complete') links(); else window.addEventListener('load', links);
})();
