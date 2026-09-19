/* NWT Dev — conversion tracking + lead forms.
   Fill in the IDs below when the Google accounts exist. Until then, events are
   still pushed to window.dataLayer, and no third-party script is loaded. */
(function () {
  var CONFIG = {
    ga4Id: '',          // e.g. 'G-XXXXXXXXXX'
    adsId: '',          // e.g. 'AW-XXXXXXXXX'
    adsLeadLabel: ''    // conversion label for form leads, e.g. 'AbC-D_efG-h12345'
  };
  var WHATSAPP = '263780511822';
  var WEB3FORMS_KEY = '9a70ef2e-12ea-4db9-a2a6-55ab6b284713'; // public key; delivers to the site owner's email

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  if (CONFIG.ga4Id || CONFIG.adsId) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CONFIG.ga4Id || CONFIG.adsId);
    document.head.appendChild(s);
    gtag('js', new Date());
    if (CONFIG.ga4Id) gtag('config', CONFIG.ga4Id);
    if (CONFIG.adsId) gtag('config', CONFIG.adsId);
  }

  function track(name, params) {
    params = params || {};
    params.page_path = location.pathname;
    window.dataLayer.push({ event: name, ...params });
    if (CONFIG.ga4Id || CONFIG.adsId) gtag('event', name, params);
    if (name === 'lead_thank_you' && CONFIG.adsId && CONFIG.adsLeadLabel) {
      gtag('event', 'conversion', { send_to: CONFIG.adsId + '/' + CONFIG.adsLeadLabel });
    }
  }
  window.nwtTrack = track;

  // Click tracking: explicit data-track, plus automatic WhatsApp / phone / email links.
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a,button');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var label = a.getAttribute('data-track-label') || (a.textContent || '').trim().slice(0, 60);
    if (/^https:\/\/wa\.me\//.test(href)) return track('click_whatsapp', { label: label });
    if (/^tel:/.test(href)) return track('click_phone', { label: label });
    if (/^mailto:/.test(href)) return track('click_email', { label: label });
    if (a.hasAttribute('data-track')) track(a.getAttribute('data-track'), { label: label });
  });

  // Lead forms: <form data-lead-form data-subject="Free demo request from {business}">
  var LABELS = { name: 'Name', whatsapp: 'WhatsApp', email: 'Email', business: 'Business',
    businessType: 'Business type', social: 'Website/social', service: 'Service', details: 'Message' };
  document.querySelectorAll('form[data-lead-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(form), lines = [], details = '';
      f.forEach(function (v, k) {
        v = String(v).trim();
        if (k === 'details') { details = v; return; }
        if (v) lines.push((LABELS[k] || k) + ': ' + v);
      });
      var tags = Array.prototype.map.call(form.querySelectorAll('.tag-btn.active'), function (b) { return b.textContent; });
      if (tags.length) lines.push('Category: ' + tags.join(', '));
      var body = lines.join('\n') + (details ? '\n\n' + details : '');
      var subject = (form.getAttribute('data-subject') || 'Website enquiry from {business}')
        .replace('{business}', f.get('business') || 'website visitor');
      track('generate_lead', { label: form.getAttribute('data-lead-form'), service: f.get('service') || 'general' });

      var status = form.querySelector('.form-status');
      if (!status) {
        status = document.createElement('p');
        status.className = 'form-status';
        status.setAttribute('role', 'status');
        form.appendChild(status);
      }
      var btn = form.querySelector('button[type="submit"]');
      var btnText = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending\u2026'; }
      status.textContent = '';

      var wa = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(subject + '\n\n' + body);
      var payload = {
        access_key: WEB3FORMS_KEY,
        subject: subject,
        from_name: 'NWT Dev Website',
        name: f.get('name') || '',
        message: body,
        botcheck: ''
      };
      if (f.get('email')) payload.email = f.get('email');

      function fallback() {
        // Could not send automatically: open the email app and offer WhatsApp. No thank-you redirect.
        if (btn) { btn.disabled = false; btn.textContent = btnText; }
        status.innerHTML = 'We couldn\u2019t send that automatically. Your email app should open with your message ready to send, or ' +
          '<a href="' + wa + '" target="_blank" rel="noopener">send it on WhatsApp instead</a>.';
        window.location.href = 'mailto:ngaatendwew@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      }

      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 12000);
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (r) { return r.json(); }).then(function (res) {
        clearTimeout(timer);
        if (res && res.success) {
          try { sessionStorage.setItem('nwt_lead', JSON.stringify({ text: subject + '\n\n' + body })); } catch (err) {}
          window.location.href = '/thank-you';
        } else { fallback(); }
      }).catch(function () { clearTimeout(timer); fallback(); });
    });
  });
  document.querySelectorAll('.tag-btn').forEach(function (b) {
    b.addEventListener('click', function () { b.classList.toggle('active'); });
  });
})();
