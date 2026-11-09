(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- The puppy ----------
     A port of the app's Mascot (src/components/ui/Mascot.tsx) to plain SVG.
     Motion (bob, blink, ear flops, wave, hops) lives in dawg.css. */

  var INK = '#2A1D19';
  var HEAD = 'M60 22 C84 22 100 34 104 54 C108 74 102 94 84 102 C76 106 68 107 60 107 C52 107 44 106 36 102 C18 94 12 74 16 54 C20 34 36 22 60 22 Z';
  var EAR_LEFT = 'M38 26 C24 20 8 30 6 50 C4 66 10 78 18 80 C26 82 30 72 32 60 C34 48 40 38 44 32 C45 29 42 27 38 26 Z';
  var EAR_RIGHT = 'M82 26 C96 20 112 30 114 50 C116 66 110 78 102 80 C94 82 90 72 88 60 C86 48 80 38 76 32 C75 29 78 27 82 26 Z';
  var PAW = 'M90 122 C90 112 91 105 92 100 C84 97 82 82 91 76 C96 73 106 73 111 76 C120 82 118 97 110 100 C111 105 112 112 112 122 Z';
  var uid = 0;

  function star(cx, cy, outer, inner) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var r = i % 2 === 0 ? outer : inner;
      var a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push((cx + r * Math.cos(a)).toFixed(2) + ' ' + (cy + r * Math.sin(a)).toFixed(2));
    }
    return 'M' + pts.join(' L') + ' Z';
  }

  function eyes(mood) {
    if (mood === 'sleepy') {
      return '<g stroke="' + INK + '" stroke-width="3" stroke-linecap="round" fill="none">' +
        '<path d="M35 63 Q43 69 51 63"/><path d="M69 63 Q77 69 85 63"/></g>';
    }
    var big = mood !== 'happy' && mood !== 'curious';
    var rx = big ? 10 : 8.5, ry = big ? 11.5 : 10;
    var shine = mood === 'proud'
      ? '<path d="' + star(46.5, 57.5, 6, 2.6) + '" fill="#FFD95C"/><path d="' + star(80.5, 57.5, 6, 2.6) + '" fill="#FFD95C"/>'
      : '<circle cx="' + (big ? 47 : 46.5) + '" cy="' + (big ? 57 : 57.5) + '" r="' + (big ? 4.6 : 3.6) + '" fill="#fff"/>' +
        '<circle cx="' + (big ? 81 : 80.5) + '" cy="' + (big ? 57 : 57.5) + '" r="' + (big ? 4.6 : 3.6) + '" fill="#fff"/>';
    var out = '<g class="eyes">' +
      '<ellipse cx="43" cy="62" rx="' + rx + '" ry="' + ry + '" fill="' + INK + '"/>' +
      '<ellipse cx="77" cy="62" rx="' + rx + '" ry="' + ry + '" fill="' + INK + '"/>' + shine +
      '<circle cx="' + (big ? 40 : 40.5) + '" cy="' + (big ? 67 : 66.5) + '" r="' + (big ? 2.2 : 1.6) + '" fill="#fff" opacity=".85"/>' +
      '<circle cx="' + (big ? 74 : 74.5) + '" cy="' + (big ? 67 : 66.5) + '" r="' + (big ? 2.2 : 1.6) + '" fill="#fff" opacity=".85"/></g>';
    if (mood === 'pleading') {
      out += '<g stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"><path d="M34 49 L48 44.5"/><path d="M72 44.5 L86 49"/></g>';
    }
    return out;
  }

  function mouth(mood) {
    var w = '<path d="M60 81 L60 86 M52 86 Q56 90.5 60 86 Q64 90.5 68 86" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
    if (mood === 'cheering') {
      return '<path d="M53 87 C52 101 55 105 60 105 C65 105 68 101 67 87 Z" fill="#FF7A93"/>' +
        '<path d="M60 89 L60 100" stroke="#E25B77" stroke-width="1.4" stroke-linecap="round"/>' + w;
    }
    if (mood === 'curious') {
      return '<path d="M60 81 L60 85" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="60" cy="89" rx="3" ry="3.6" fill="' + INK + '"/>';
    }
    if (mood === 'pleading' || mood === 'sleepy') return w;
    return '<path d="M54.5 90 C54.5 99 65.5 99 65.5 90 Z" fill="#FF7A93"/>' +
      '<path d="M60 91 L60 95.5" stroke="#E25B77" stroke-width="1.2" stroke-linecap="round"/>' + w;
  }

  function pupSVG(mood, wave) {
    var id = 'p' + (uid++);
    var blush = mood === 'cheering' || mood === 'proud' ? 0.85 : 0.6;
    return '<svg viewBox="0 0 120 120" role="img" aria-label="dawg puppy, ' + mood + '">' +
      '<defs>' +
      '<radialGradient id="fur' + id + '" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#FFE6BF"/><stop offset=".65" stop-color="#F8CB8E"/><stop offset="1" stop-color="#EAAE69"/></radialGradient>' +
      '<radialGradient id="muz' + id + '" cx="50%" cy="35%" r="65%"><stop offset="0" stop-color="#FFFDF8"/><stop offset="1" stop-color="#F5E3CB"/></radialGradient>' +
      '<radialGradient id="nose' + id + '" cx="40%" cy="30%" r="70%"><stop offset="0" stop-color="#5E443B"/><stop offset="1" stop-color="' + INK + '"/></radialGradient>' +
      '<linearGradient id="ear' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B07240"/><stop offset="1" stop-color="#83502B"/></linearGradient>' +
      '</defs>' +
      '<g class="tilt"><g class="body">' +
      '<path d="' + HEAD + '" fill="url(#fur' + id + ')"/>' +
      '<ellipse cx="33" cy="80" rx="7" ry="4.5" fill="#FF9EAE" opacity="' + blush + '"/>' +
      '<ellipse cx="87" cy="80" rx="7" ry="4.5" fill="#FF9EAE" opacity="' + blush + '"/>' +
      '<path class="ear-l" d="' + EAR_LEFT + '" fill="url(#ear' + id + ')"/>' +
      '<path class="ear-r" d="' + EAR_RIGHT + '" fill="url(#ear' + id + ')"/>' +
      eyes(mood) +
      '<ellipse cx="60" cy="85" rx="18" ry="13" fill="url(#muz' + id + ')"/>' +
      mouth(mood) +
      '<path d="M52.5 76 C52.5 72 67.5 72 67.5 76 C67.5 80 63 82.5 60 82.5 C57 82.5 52.5 80 52.5 76 Z" fill="url(#nose' + id + ')"/>' +
      '<ellipse cx="57" cy="75" rx="3" ry="1.4" fill="#fff" opacity=".6"/>' +
      '</g></g>' +
      (wave
        ? '<g class="paw"><path d="' + PAW + '" fill="url(#fur' + id + ')" stroke="#E0A35E" stroke-width="1.3"/>' +
          '<ellipse cx="101" cy="91" rx="6" ry="4.8" fill="#FFB3C1"/><ellipse cx="93.5" cy="83.5" rx="2.5" ry="2.9" fill="#FFB3C1"/>' +
          '<ellipse cx="98.5" cy="80.5" rx="2.5" ry="2.9" fill="#FFB3C1"/><ellipse cx="103.5" cy="80.5" rx="2.5" ry="2.9" fill="#FFB3C1"/>' +
          '<ellipse cx="108.5" cy="83.5" rx="2.5" ry="2.9" fill="#FFB3C1"/></g>'
        : '') +
      (mood === 'sleepy' ? '<text class="zz" x="98" y="26" font-size="16" font-weight="700" fill="#A89A91">z</text>' : '') +
      '</svg>';
  }

  function render(el) {
    var mood = el.getAttribute('data-mood') || 'happy';
    el.innerHTML = pupSVG(mood, el.hasAttribute('data-wave'));
  }

  function setMood(el, mood) {
    el.setAttribute('data-mood', mood);
    render(el);
    el.classList.remove('is-popping');
    void el.offsetWidth;
    el.classList.add('is-popping');
  }

  document.querySelectorAll('.pup').forEach(render);

  /* ---------- Confetti and hearts ---------- */

  var COLORS = ['#CFC8FB', '#FFDF85', '#BFEBD2', '#FFD1DC', '#CDE7FF', '#FFD9C2', '#6B5FD3'];

  function burst(x, y, kind) {
    if (reduceMotion) return;
    var n = kind === 'hearts' ? 8 : 26;
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.className = 'burst';
      if (kind === 'hearts') {
        s.textContent = ['💜', '🐾', '💛', '🦴'][i % 4];
      } else {
        s.style.width = (6 + Math.random() * 6) + 'px';
        s.style.height = (8 + Math.random() * 8) + 'px';
        s.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        s.style.background = COLORS[i % COLORS.length];
      }
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      document.body.appendChild(s);
      var angle = Math.random() * Math.PI * 2;
      var dist = (kind === 'hearts' ? 60 : 90) + Math.random() * 110;
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist - (kind === 'hearts' ? 80 : 40);
      s.animate([
        { transform: 'translate(-50%, -50%) scale(0.4) rotate(0deg)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(1) rotate(' + (Math.random() * 540 - 270) + 'deg)', opacity: 1, offset: 0.7 },
        { transform: 'translate(calc(-50% + ' + dx * 1.1 + 'px), calc(-50% + ' + (dy + 60) + 'px)) scale(0.9)', opacity: 0 }
      ], { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = s.remove.bind(s);
    }
  }

  function center(el) {
    var r = el.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  }

  // Pet the hero pup: it cheers, then settles back down.
  var heroPup = document.querySelector('.hero-pup');
  if (heroPup) {
    var calm;
    heroPup.addEventListener('click', function () {
      var c = center(heroPup);
      burst(c[0], c[1], 'hearts');
      burst(c[0], c[1], 'confetti');
      setMood(heroPup, 'cheering');
      clearTimeout(calm);
      calm = setTimeout(function () { setMood(heroPup, 'happy'); }, 3200);
    });
  }

  // Mood cards: a little hop and a pop on tap.
  document.querySelectorAll('.mood').forEach(function (card) {
    var pup = card.querySelector('.pup');
    card.addEventListener('click', function () {
      var c = center(pup);
      burst(c[0], c[1], card.getAttribute('data-burst') || 'hearts');
      pup.classList.remove('is-popping');
      void pup.offsetWidth;
      pup.classList.add('is-popping', 'is-hopping');
      setTimeout(function () { pup.classList.remove('is-hopping'); }, 2600);
    });
  });

  /* ---------- Live rest timer on the hero card ---------- */

  var timer = document.querySelector('.card-rest .time');
  if (timer && !reduceMotion) {
    var left = 118;
    setInterval(function () {
      left = left <= 0 ? 118 : left - 1;
      timer.textContent = Math.floor(left / 60) + ':' + ('0' + (left % 60)).slice(-2);
    }, 1000);
  }

  /* ---------- Top bar shadow ---------- */

  var bar = document.querySelector('.topbar');
  function onScroll() { if (bar) bar.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  /* ---------- Reveal on scroll ---------- */

  var io = new IntersectionObserver(function (entries) {
    entries.filter(function (e) { return e.isIntersecting; }).forEach(function (e, i) {
      e.target.style.setProperty('--delay', (i * 0.08) + 's');
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- Scrolly tour: swap the sticky phone's screen ---------- */

  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var screens = Array.prototype.slice.call(document.querySelectorAll('.tour-phone .screen img'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.tour-dots i'));
  if (steps.length && screens.length) {
    var show = function (n) {
      steps.forEach(function (s, i) { s.classList.toggle('is-active', i === n); });
      screens.forEach(function (img, i) {
        img.classList.toggle('is-active', i === n);
        img.classList.toggle('is-past', i < n);
      });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === n); });
    };
    var tour = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) show(steps.indexOf(e.target));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { tour.observe(s); });
    show(0);
  }
})();
