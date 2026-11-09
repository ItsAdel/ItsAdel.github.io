// Hackathon globe: an orthographic d3-geo globe on a canvas, with arcs from home
// to each city. Tours the cities on its own; hover a card or drag to take over.
import { geoOrthographic, geoPath, geoGraticule10, geoInterpolate, geoDistance } from 'https://cdn.jsdelivr.net/npm/d3-geo@3.1.1/+esm';
import { feature } from 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm';

const LAND_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json';
const TOUR_EVERY = 4500;
const IDLE_AFTER = 6000;

const canvas = document.querySelector('.globe');
if (canvas) init(canvas);

async function init(canvas) {
  const wrap = canvas.parentElement;
  const home = JSON.parse(canvas.dataset.home);
  const cities = JSON.parse(canvas.dataset.cities);
  const cards = [...document.querySelectorAll('.hack')];
  const labelCity = wrap.querySelector('.globe-city');
  const labelEvent = wrap.querySelector('.globe-event');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let land;
  try {
    const topo = await fetch(LAND_URL).then((r) => r.json());
    land = feature(topo, topo.objects.land);
  } catch (e) {
    return; // the CSS orb stays as a placeholder
  }

  const ctx = canvas.getContext('2d');
  const projection = geoOrthographic().clipAngle(90).precision(0.4);
  const path = geoPath(projection, ctx);
  const graticule = geoGraticule10();
  const arcs = cities.map((c) => geoInterpolate([home.lng, home.lat], [c.lng, c.lat]));
  let size = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = canvas.clientWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    projection.translate([size / 2, size / 2]).scale(size / 2 - 1);
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  // rotate() takes [-lng, -lat]; start looking at home, tilted a little north.
  let rot = [-home.lng, -25];
  let tween = null;
  let active = -1;
  let arcStart = 0;
  let lastInteract = -Infinity;
  let hovering = false;
  let dragging = null;
  let lastTour = 0;
  let visible = false;

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function focus(i, now = performance.now()) {
    if (i === active && tween) return;
    active = i;
    const c = cities[i];
    const from = rot.slice();
    // Spin the short way round.
    const dl = ((((-c.lng - from[0]) % 360) + 540) % 360) - 180;
    tween = { from, to: [from[0] + dl, -c.lat * 0.55], start: now, dur: reduce ? 1 : 1500 };
    arcStart = now;
    lastTour = now;
    cards.forEach((el, j) => el.classList.toggle('is-active', j === i));
    labelCity.textContent = c.city;
    labelEvent.textContent = cards[i] ? cards[i].dataset.event : '';
    wrap.classList.add('has-label');
  }

  // Cards drive the globe
  cards.forEach((card, i) => {
    const take = () => { hovering = true; focus(i); };
    card.addEventListener('pointerenter', take);
    card.addEventListener('focus', take);
    card.addEventListener('click', take);
    card.addEventListener('pointerleave', () => { hovering = false; lastInteract = performance.now(); });
    card.addEventListener('blur', () => { hovering = false; lastInteract = performance.now(); });
  });

  // Drag to spin
  canvas.addEventListener('pointerdown', (e) => {
    dragging = { x: e.clientX, y: e.clientY, rot: rot.slice() };
    tween = null;
    canvas.setPointerCapture(e.pointerId);
    wrap.classList.add('is-dragging');
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const k = 180 / size;
    rot = [
      dragging.rot[0] + (e.clientX - dragging.x) * k,
      Math.max(-70, Math.min(70, dragging.rot[1] - (e.clientY - dragging.y) * k)),
    ];
  });
  const release = () => {
    dragging = null;
    lastInteract = performance.now();
    wrap.classList.remove('is-dragging');
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) {
      if (active < 0) focus(0);
      requestAnimationFrame(frame);
    }
  }).observe(canvas);

  const css = getComputedStyle(document.documentElement);
  const token = (name) => css.getPropertyValue(name).trim();

  let prev = performance.now();
  function frame(now) {
    if (!visible) return;
    const dt = Math.min(now - prev, 50);
    prev = now;

    const idle = !dragging && !hovering && now - lastInteract > IDLE_AFTER;
    if (tween) {
      const t = Math.min((now - tween.start) / tween.dur, 1);
      const e = ease(t);
      rot = [tween.from[0] + (tween.to[0] - tween.from[0]) * e, tween.from[1] + (tween.to[1] - tween.from[1]) * e];
      if (t === 1) tween = null;
    } else if (idle && !reduce) {
      rot[0] += dt * 0.004; // gentle drift between stops
      if (now - lastTour > TOUR_EVERY) focus((active + 1) % cities.length, now);
    }

    draw(now);
    requestAnimationFrame(frame);
  }

  function draw(now) {
    const accent1 = token('--accent-1');
    const accent2 = token('--accent-2');
    const text = token('--text');
    const muted = token('--muted');
    projection.rotate(rot);
    ctx.clearRect(0, 0, size, size);

    // Sphere, grid, land
    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.fillStyle = token('--globe-sphere');
    ctx.fill();

    ctx.beginPath();
    path(graticule);
    ctx.strokeStyle = token('--globe-grid');
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.beginPath();
    path(land);
    ctx.fillStyle = token('--globe-land');
    ctx.fill();
    ctx.strokeStyle = token('--globe-coast');
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.strokeStyle = token('--border-strong');
    ctx.lineWidth = 1;
    ctx.stroke();

    // Arcs: faint for all, drawn-in gradient for the active one
    const center = [-rot[0], -rot[1]];
    arcs.forEach((interp, i) => {
      const isActive = i === active;
      const t = isActive ? Math.min((now - arcStart) / 1200, 1) : 1;
      const steps = 64;
      const coords = [];
      for (let s = 0; s <= steps * ease(t); s++) coords.push(interp(s / steps));
      if (coords.length < 2) return;
      ctx.beginPath();
      path({ type: 'LineString', coordinates: coords });
      if (isActive) {
        const g = ctx.createLinearGradient(0, 0, size, size);
        g.addColorStop(0, accent1);
        g.addColorStop(1, accent2);
        ctx.strokeStyle = g;
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = muted;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // A little traveller riding the active arc once it's drawn
      if (isActive && t === 1 && !reduce) {
        const p = interp(((now - arcStart - 1200) / 2600) % 1);
        if (geoDistance(p, center) < Math.PI / 2) {
          const [x, y] = projection(p);
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = text;
          ctx.fill();
        }
      }
    });

    // Markers
    ctx.font = '500 11px "Geist Mono", ui-monospace, monospace';
    ctx.textBaseline = 'middle';
    const pulse = reduce ? 0.5 : ((now % 1800) / 1800);
    cities.forEach((c, i) => {
      const p = [c.lng, c.lat];
      if (geoDistance(p, center) > Math.PI / 2 - 0.03) return;
      const [x, y] = projection(p);
      const isActive = i === active;
      if (isActive) {
        ctx.beginPath();
        ctx.arc(x, y, 5 + pulse * 14, 0, Math.PI * 2);
        ctx.strokeStyle = accent2;
        ctx.globalAlpha = 1 - pulse;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.beginPath();
      ctx.arc(x, y, isActive ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? accent2 : accent1;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = token('--bg');
      ctx.stroke();
      ctx.fillStyle = isActive ? text : muted;
      ctx.fillText(c.city, x + 10, y);
    });

    // Home
    const h = [home.lng, home.lat];
    if (geoDistance(h, center) < Math.PI / 2 - 0.03) {
      const [x, y] = projection(h);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = text;
      ctx.fillRect(-3.5, -3.5, 7, 7);
      ctx.restore();
      // Label above so it doesn't collide with nearby cities (SF sits just below)
      ctx.fillStyle = muted;
      ctx.textAlign = 'center';
      ctx.fillText('home · ' + home.city, x, y - 13);
      ctx.textAlign = 'left';
    }
  }
}
