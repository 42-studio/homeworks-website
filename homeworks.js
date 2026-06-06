/* ===========================================================
   HOMEWORKS — interactions
   =========================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---- year ---- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---- header hide/show on scroll ---- */
  var header = document.getElementById('header');
  var lastY = window.scrollY;
  window.addEventListener('scroll', function () {
    var cur = window.scrollY;
    if (cur > 120 && cur > lastY) header.classList.add('hide');
    else header.classList.remove('hide');
    lastY = cur;
  }, { passive: true });

  /* ---- mobile menu ---- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  function closeMenu() { document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---- scroll reveals ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: 0.01, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });

  /* fallback: anything already in the viewport on load reveals immediately */
  requestAnimationFrame(function () {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in-view');
    });
  });

  /* ---- counters ---- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    if (target === 0) { el.textContent = prefix + '0' + suffix; return; }
    var dur = 1200, start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var countIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { animateCount(e.target); countIO.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) { countIO.observe(el); });

  /* ---- form: floating labels + Web3Forms submit ---- */
  var form = document.getElementById('quoteForm');
  if (form) {
    form.querySelectorAll('input, textarea').forEach(function (inp) {
      function sync() { inp.parentElement.classList.toggle('filled', !!inp.value); }
      inp.addEventListener('input', sync);
      inp.addEventListener('blur', sync);
    });

    var note = document.getElementById('formNote');
    var submitBtn = form.querySelector('.form-submit');

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      var name = form.querySelector('#f-name');
      var email = form.querySelector('#f-email');
      var msg = form.querySelector('#f-msg');

      if (!name.value || !email.value || !msg.value) {
        note.textContent = '⚠ Please add your name, email and a short message.';
        note.style.color = '#e0a23a';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Sending…';
      note.textContent = '';
      note.style.color = '';

      var data = new FormData(form);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data
      })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (json.success) {
            note.style.color = '';
            note.textContent = '✓ Thanks ' + name.value.split(' ')[0] + ' — we\'ll be in touch shortly with your free quote.';
            form.reset();
            form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('filled'); });
          } else {
            note.textContent = '⚠ Something went wrong — please try again or call us directly.';
            note.style.color = '#e0a23a';
          }
        })
        .catch(function () {
          note.textContent = '⚠ Could not send — please try again or call us directly.';
          note.style.color = '#e0a23a';
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.querySelector('span').textContent = 'Request a free quote';
        });
    });
  }

})();
