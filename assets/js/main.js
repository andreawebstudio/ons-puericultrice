/* ONS — Puericultrice · script essenziali */
(function () {
  'use strict';

  var EMAIL = 'onsrpuericultrice@gmail.com';
  function reduceMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  /* ---------- Header: ombra allo scroll ---------- */
  var header = document.querySelector('.site-header');
  function onScrollHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  /* ---------- Menu burger (solo mobile) ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('mobile-nav');
  var mq = window.matchMedia('(max-width: 1023px)');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Chiudi il menu' : 'Apri il menu';
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      var hash = a.getAttribute('href');
      var target = hash && hash.charAt(0) === '#' ? document.querySelector(hash) : null;
      setMenu(false);
      // Lo scroll era bloccato col menu aperto: si scorre dopo averlo sbloccato
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' });
        history.pushState(null, '', hash);
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });
    mq.addEventListener('change', function (e) { if (!e.matches) setMenu(false); });
  }

  /* ---------- Voce di menu attiva (desktop) ---------- */
  var links = document.querySelectorAll('.desktop-nav a[href^="#"]');
  if ('IntersectionObserver' in window && links.length) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
          map[en.target.id].classList.add('is-active');
          map[en.target.id].setAttribute('aria-current', 'location');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- Fade-in leggero ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion()) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Come funziona: percorso che si illumina allo scroll ---------- */
  var journey = document.getElementById('journey');
  var track = journey && journey.querySelector('.journey-track');
  var steps = journey ? journey.querySelectorAll('.journey-step') : [];
  var maxP = 0;

  // Allinea la linea esattamente ai centri del primo e dell'ultimo cerchio
  function layoutTrack() {
    if (!journey || !track || !steps.length) return;
    var jr = journey.getBoundingClientRect();
    var a = steps[0].querySelector('.step-dot').getBoundingClientRect();
    var b = steps[steps.length - 1].querySelector('.step-dot').getBoundingClientRect();
    var vertical = Math.abs(b.top - a.top) > Math.abs(b.left - a.left);
    var s = track.style;
    if (vertical) {
      s.left = (a.left + a.width / 2 - jr.left - 1) + 'px'; s.right = 'auto';
      s.top = (a.top + a.height / 2 - jr.top) + 'px';
      s.bottom = (jr.bottom - (b.top + b.height / 2)) + 'px';
    } else {
      s.top = (a.top + a.height / 2 - jr.top - 1) + 'px'; s.bottom = 'auto';
      s.left = (a.left + a.width / 2 - jr.left) + 'px';
      s.right = (jr.right - (b.left + b.width / 2)) + 'px';
    }
  }

  function updateJourney() {
    if (!journey || !track) return;
    if (reduceMotion()) {
      journey.style.setProperty('--p', 1);
      steps.forEach(function (s) { s.classList.add('is-active'); });
      return;
    }
    var vh = window.innerHeight;
    var tr = track.getBoundingClientRect();
    var vertical = tr.height > tr.width;
    var p;
    if (vertical) {
      p = (vh * 0.62 - tr.top) / tr.height;
    } else {
      var jr = journey.getBoundingClientRect();
      p = (vh * 0.85 - jr.top) / (vh * 0.45);
    }
    p = Math.max(0, Math.min(1, p));
    maxP = Math.max(maxP, p); // il percorso, una volta illuminato, resta acceso
    journey.style.setProperty('--p', maxP.toFixed(4));

    steps.forEach(function (s) {
      var dot = s.querySelector('.step-dot').getBoundingClientRect();
      var pos = vertical
        ? (dot.top + dot.height / 2 - tr.top) / tr.height
        : (dot.left + dot.width / 2 - tr.left) / tr.width;
      if (maxP >= pos - 0.02) s.classList.add('is-active');
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScrollHeader();
      updateJourney();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { layoutTrack(); onScroll(); });
  window.addEventListener('load', function () { layoutTrack(); updateJourney(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layoutTrack(); updateJourney(); });
  onScrollHeader();
  layoutTrack();
  updateJourney();

  /* ---------- FAQ accordion (tutte chiuse all'avvio) ---------- */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('is-open', !open);
    });
  });

  /* ---------- Modulo contatti → email precompilata ----------
     Nessun backend configurato: il modulo NON simula un invio.
     Compone il messaggio e apre il programma di posta dell'utente. */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');

    function showError(field, msg) {
      field.setAttribute('aria-invalid', 'true');
      var wrap = field.closest('.field');
      var err = wrap.querySelector('.field-error');
      if (!err) {
        err = document.createElement('p');
        err.className = 'field-error';
        err.id = field.id + '-error';
        wrap.appendChild(err);
        var desc = field.getAttribute('aria-describedby');
        field.setAttribute('aria-describedby', desc ? desc + ' ' + err.id : err.id);
      }
      err.textContent = msg;
    }
    function clearError(field) {
      field.removeAttribute('aria-invalid');
      var err = field.closest('.field').querySelector('.field-error');
      if (err) err.textContent = '';
    }

    form.addEventListener('input', function (e) { if (e.target.hasAttribute('aria-invalid')) clearError(e.target); });
    form.addEventListener('change', function (e) { if (e.target.hasAttribute('aria-invalid')) clearError(e.target); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var invalid = [];

      if (!f.nome.value.trim()) { showError(f.nome, 'Inserisci il tuo nome.'); invalid.push(f.nome); }
      if (!f.email.value.trim() || !f.email.checkValidity()) { showError(f.email, 'Inserisci un indirizzo email valido.'); invalid.push(f.email); }
      if (!f.argomento.value) { showError(f.argomento, 'Seleziona un argomento.'); invalid.push(f.argomento); }
      if (!f.messaggio.value.trim()) { showError(f.messaggio, 'Scrivi un breve messaggio.'); invalid.push(f.messaggio); }
      if (!f.privacy.checked) { showError(f.privacy, 'Per procedere è necessario accettare l\'informativa privacy.'); invalid.push(f.privacy); }

      if (invalid.length) {
        status.textContent = 'Controlla i campi evidenziati.';
        invalid[0].focus();
        return;
      }

      var subject = 'Richiesta informazioni – ' + f.argomento.value;
      var body =
        'Nome: ' + f.nome.value.trim() + '\n' +
        'Email: ' + f.email.value.trim() + '\n' +
        'Argomento: ' + f.argomento.value + '\n\n' +
        f.messaggio.value.trim() + '\n';

      window.location.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      status.innerHTML = 'Si sta aprendo il tuo programma di posta con il messaggio già compilato: ricordati di premere <strong>Invia</strong>. ' +
        'Se non si apre nulla, scrivi direttamente a <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.';
    });
  }

  /* ---------- Anno nel footer ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
