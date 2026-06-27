/* ===========================================================
   HOMEWORKS — interactions
   =========================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---- year ---- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

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

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form)
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

  /* ===========================================================
     MEASURE OVERLAY — crosshair + live mm dimensions
     =========================================================== */
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover) {
    var PPM = 96 / 25.4;
    var toMM = function (px) { return Math.round(px / PPM); };

    document.querySelectorAll('[data-measure]').forEach(function (zone) {
      var ov = document.createElement('div');
      ov.className = 'measure-overlay';
      ov.setAttribute('aria-hidden', 'true');
      ov.innerHTML =
        '<div class="m-frame">' +
          '<div class="m-corner tl"></div><div class="m-corner tr"></div>' +
          '<div class="m-corner bl"></div><div class="m-corner br"></div>' +
          '<div class="m-dim m-dim-x"><span class="m-dim-label">0 mm</span></div>' +
          '<div class="m-dim m-dim-y"><span class="m-dim-label">0 mm</span></div>' +
          '<div class="m-size">□ 0 × 0 MM</div>' +
        '</div>' +
        '<div class="m-line-clip">' +
          '<div class="m-line m-vline"></div>' +
          '<div class="m-line m-hline"></div>' +
        '</div>' +
        '<div class="m-badge">W 0 · H 0 MM</div>';
      zone.appendChild(ov);

      var frame = ov.querySelector('.m-frame');
      var lineClip = ov.querySelector('.m-line-clip');
      var vline = ov.querySelector('.m-vline');
      var hline = ov.querySelector('.m-hline');
      var badge = ov.querySelector('.m-badge');
      var dimX = ov.querySelector('.m-dim-x');
      var dimY = ov.querySelector('.m-dim-y');
      var dimXL = dimX.querySelector('.m-dim-label');
      var dimYL = dimY.querySelector('.m-dim-label');
      var sizeEl = ov.querySelector('.m-size');

      var SUB_SEL = '.ph, .svc, .step, .proj-figure, .feature-figure, .stat';

      var rect = null, px = 0, py = 0, ticking = false;
      var box = { l: 0, t: 0, w: 0, h: 0 }, curSub = null;

      function setBox(el) {
        if (!rect) rect = zone.getBoundingClientRect();
        if (el) {
          var r = el.getBoundingClientRect();
          box.l = r.left - rect.left; box.t = r.top - rect.top;
          box.w = r.width; box.h = r.height;
        } else {
          box.l = 0; box.t = 0; box.w = rect.width; box.h = rect.height;
        }
        frame.style.left = box.l + 'px';
        frame.style.top = box.t + 'px';
        frame.style.width = box.w + 'px';
        frame.style.height = box.h + 'px';
        frame.classList.toggle('sub', !!el);
        sizeEl.textContent = '□ ' + toMM(box.w) + ' × ' + toMM(box.h) + ' MM';
      }

      function draw() {
        ticking = false;
        var rx = Math.max(0, Math.min(px - box.l, box.w));
        var ry = Math.max(0, Math.min(py - box.t, box.h));
        var dimOff = document.documentElement.classList.contains('dim-off');

        if (dimOff) {
          /* move the clip container to the inset area so overflow:hidden bounds the dashed lines */
          var inset = 24;
          var clipL = box.l + inset;
          var clipT = box.t + inset;
          lineClip.style.left = clipL + 'px';
          lineClip.style.top = clipT + 'px';
          lineClip.style.width = Math.max(0, box.w - inset * 2) + 'px';
          lineClip.style.height = Math.max(0, box.h - inset * 2) + 'px';
          lineClip.style.right = 'auto';
          lineClip.style.bottom = 'auto';
          /* lines are positioned relative to the clip */
          vline.style.left = (px - clipL) + 'px';
          hline.style.top = (py - clipT) + 'px';
        } else {
          /* clip covers the full overlay; lines are positioned relative to the overlay */
          lineClip.style.cssText = '';
          vline.style.left = px + 'px';
          hline.style.top = py + 'px';
        }

        badge.style.left = px + 'px';
        badge.style.top = py + 'px';
        badge.textContent = 'W ' + toMM(rx) + ' · H ' + toMM(ry) + ' MM';
        dimX.style.width = rx + 'px';
        dimY.style.height = ry + 'px';
        dimXL.textContent = toMM(rx) + ' mm';
        dimYL.textContent = toMM(ry) + ' mm';
      }

      zone.addEventListener('pointermove', function (e) {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        if (!rect) rect = zone.getBoundingClientRect();
        px = e.clientX - rect.left;
        py = e.clientY - rect.top;
        var sub = e.target.closest ? e.target.closest(SUB_SEL) : null;
        if (sub && !zone.contains(sub)) sub = null;
        if (sub !== curSub) { curSub = sub; setBox(sub); }
        if (!ticking) { ticking = true; requestAnimationFrame(draw); }
      });
      zone.addEventListener('pointerenter', function (e) {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        rect = zone.getBoundingClientRect();
        var sub = e.target.closest ? e.target.closest(SUB_SEL) : null;
        if (sub && !zone.contains(sub)) sub = null;
        curSub = sub; setBox(sub);
        ov.classList.add('active');
      });
      zone.addEventListener('pointerleave', function () { ov.classList.remove('active'); curSub = null; });
      window.addEventListener('scroll', function () { rect = null; }, { passive: true });
      window.addEventListener('resize', function () { rect = null; });
    });
  }

  /* ===========================================================
     TWEAKS PANEL
     =========================================================== */
  var TWEAK_DEFAULTS = {
    accentLead: 'blue',
    headlineStyle: 'serif',
    rulerDetail: 'medium',
    heroLogo: false,
    measureLines: true
  };

  var ACCENTS = { blue: '#3F4C9B', green: '#55BC5A' };
  var t = Object.assign({}, TWEAK_DEFAULTS);

  function apply() {
    var root = document.documentElement;
    root.style.setProperty('--accent', ACCENTS[t.accentLead] || ACCENTS.blue);
    root.classList.toggle('serif-off', t.headlineStyle !== 'serif');
    root.classList.toggle('ruler-min', t.rulerDetail === 'minimal');
    root.classList.toggle('show-hero-logo', !!t.heroLogo);
    root.classList.toggle('dim-off', !t.measureLines);
  }
  apply();

})();
