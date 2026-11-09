(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Theme toggle ---------- */

  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') ||
        (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      var next = current === 'light' ? 'dark' : 'light';
      var apply = function () {
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
      };
      if (document.startViewTransition && !reduceMotion) document.startViewTransition(apply);
      else apply();
    });
  }

  /* ---------- Nav state + reading progress ---------- */

  var nav = document.querySelector('.nav');
  var progress = document.querySelector('.progress');
  var article = document.querySelector('.article');

  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 12);
    if (progress && article) {
      var max = article.offsetTop + article.offsetHeight - window.innerHeight;
      progress.style.setProperty('--progress', Math.min(Math.max(y / Math.max(max, 1), 0), 1));
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Split headlines into animated words ---------- */

  var wordIndex = 0;
  function splitNode(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === Node.TEXT_NODE) {
        var frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var outer = document.createElement('span');
          var inner = document.createElement('span');
          outer.className = 'word';
          inner.textContent = part;
          inner.style.setProperty('--i', wordIndex++);
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        splitNode(child);
      }
    });
  }

  document.querySelectorAll('.split').forEach(function (el) {
    wordIndex = 0;
    el.setAttribute('aria-label', el.textContent.trim());
    splitNode(el);
    el.classList.add('is-split');
    el.classList.add('reveal');
  });

  /* ---------- Reveal on scroll (staggered) ---------- */

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; });
      batch.forEach(function (entry, i) {
        entry.target.style.setProperty('--delay', (i * 0.08) + 's');
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Typewriter ---------- */

  var typer = document.querySelector('.typer');
  if (typer) {
    var words = typer.getAttribute('data-words').split('|');
    if (reduceMotion) {
      typer.textContent = words[0];
    } else {
      var w = 0, c = 0, deleting = false;
      (function tick() {
        var word = Array.from(words[w]);
        typer.textContent = word.slice(0, c).join('');
        var delay = deleting ? 40 : 85;
        if (!deleting && c === word.length) { deleting = true; delay = 1600; }
        else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 350; }
        c += deleting ? -1 : 1;
        if (deleting && c < 0) c = 0;
        setTimeout(tick, delay);
      })();
    }
  }

  if (!finePointer || reduceMotion) return;

  /* ---------- Pointer effects (desktop only) ---------- */

  var glow = document.querySelector('.backdrop');
  var raf = null, gx = 0, gy = 0;
  window.addEventListener('pointermove', function (e) {
    gx = e.clientX; gy = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(function () {
      glow.style.setProperty('--gx', gx + 'px');
      glow.style.setProperty('--gy', gy + 'px');
      raf = null;
    });
  }, { passive: true });

  // Spotlight that follows the cursor inside cards
  document.querySelectorAll('.spotlight').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Magnetic buttons
  document.querySelectorAll('.magnetic').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) * 0.35;
      var y = (e.clientY - r.top - r.height / 2) * 0.35;
      el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });

  // 3D tilt
  document.querySelectorAll('.tilt').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = 'perspective(900px) rotateX(' + (-py * 6) + 'deg) rotateY(' + (px * 8) + 'deg) translateY(-2px)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });
})();

/* ---------- Copy link (works without the pointer effects above) ---------- */
document.querySelectorAll('.copy-link').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var done = function () {
      btn.textContent = 'Copied ✓';
      btn.classList.add('is-copied');
      setTimeout(function () { btn.textContent = 'Copy link'; btn.classList.remove('is-copied'); }, 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(btn.getAttribute('data-url')).then(done);
  });
});
