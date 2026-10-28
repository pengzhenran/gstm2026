/* ============================================================
   GSTM 2026 — interaction layer
   ============================================================ */
import * as THREE from '../vendor/three.module.js';

window.__appBooted = true;

const DATA = window.GSTM;
const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------
   0. loader / smooth scroll / chrome
   ------------------------------------------------------------ */
const loader = $('#loader');
const loaderBar = $('#loaderBar');
const loaderPct = $('#loaderPct');
const rootEl = document.documentElement;
rootEl.classList.add('is-loading');
document.body.classList.add('is-loading');

const boot = { fonts: false, hero: false, started: performance.now(), done: false, minTimer: null };
let loadPct = parseFloat(loaderBar?.style.width) || 0;
function setLoad(p){
  loadPct = Math.max(loadPct, p);
  if (loaderBar) loaderBar.style.width = loadPct + '%';
  if (loaderPct) loaderPct.textContent = String(Math.round(loadPct)).padStart(2, '0');
}
function hideLoader(){
  if (boot.done) return;
  boot.done = true;
  setLoad(100);
  document.body.classList.add('loaded');
  loader.classList.add('done');
  lenis?.start();
  setTimeout(() => {
    rootEl.classList.remove('is-loading');
    document.body.classList.remove('is-loading');
    loader.remove();
  }, 620);
}
function maybeDone(){
  if (boot.done) return;
  if (!boot.fonts || !boot.hero) return;
  const wait = 1400 - (performance.now() - boot.started);
  if (wait > 0) {
    if (!boot.minTimer) {
      boot.minTimer = setTimeout(() => { boot.minTimer = null; maybeDone(); }, wait + 40);
    }
    return;
  }
  setLoad(100);
  setTimeout(hideLoader, 180);
}
function markHeroReady(){
  boot.hero = true;
  setLoad(84);
  maybeDone();
}
window.__markHeroReady = markHeroReady;
setLoad(12);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => { boot.fonts = true; setLoad(58); maybeDone(); });
} else {
  boot.fonts = true;
}
setTimeout(markHeroReady, 8000);
setTimeout(() => { boot.fonts = boot.hero = true; hideLoader(); }, 11000);

let lenis = null;
if (window.Lenis && !REDUCED) {
  lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  lenis.stop();
}

const topbar = $('#topbar');
const progress = $('#scrollProgress');
function onScroll(){
  const y = window.scrollY || document.documentElement.scrollTop;
  const h = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  topbar.classList.toggle('scrolled', y > 40);
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* active section nav */
const navLinks = $$('.nav a');
const secIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const id = '#' + en.target.id;
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
['hero','prologue','programme','signals','missions','world','explore','archive'].forEach(id => { const el = document.getElementById(id); if (el) secIO.observe(el); });

const menuBtn = $('#menuBtn');
const mobileMenu = $('#mobileMenu');
function closeMenu(){ document.body.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded','false'); }
menuBtn.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
$$('[data-scroll]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  if (!id || !id.startsWith('#')) return;
  const target = $(id);
  if (!target) return;
  e.preventDefault();
  closeMenu();
  if (lenis) lenis.scrollTo(target, { offset: -64, duration: 1.4 });
  else target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
}));

/* custom cursor */
const cursor = $('#cursor');
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  let cx = innerWidth/2, cy = innerHeight/2, tx = cx, ty = cy;
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cursor.classList.add('on'); });
  const loop = () => { cx += (tx-cx)*.18; cy += (ty-cy)*.18; cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; requestAnimationFrame(loop); };
  loop();
  $$('a, button, .paper-card, .session-row, .chip, .rank-row').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
  });
}

/* reveal */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
$$('[data-reveal]').forEach((el, i) => {
  if (!REDUCED) el.style.transitionDelay = (i % 5) * 55 + 'ms';
  revealIO.observe(el);
});

/* count up */
function countUp(el){
  const to = +el.dataset.count;
  if (REDUCED || !to) { el.textContent = to; return; }
  const dur = 1500, t0 = performance.now();
  const tick = now => {
    const p = clamp((now - t0) / dur, 0, 1);
    const e = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.round(to * e);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const heroStats = $('.hero-stats');
if (heroStats) {
  const io = new IntersectionObserver(en => {
    if (en[0].isIntersecting) { $$('[data-count]', heroStats).forEach(countUp); io.disconnect(); }
  }, { threshold: .4 });
  io.observe(heroStats);
}

/* ------------------------------------------------------------
   1. hero — Three.js gravity globe
   ------------------------------------------------------------ */
async function initHero(){
  const canvas = $('#heroCanvas');
  if (!canvas || REDUCED) { window.__markHeroReady?.(); return; }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch(e) { canvas.style.display = 'none'; window.__markHeroReady?.(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 7.6);

  const root = new THREE.Group();
  scene.add(root);

  /* point sphere */
  const N = innerWidth < 760 ? 18000 : 34000;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N * 3);
  const seed = new Float32Array(N);
  const phase = new Float32Array(N);
  const GA = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y*y));
    const th = GA * i;
    pos[i*3] = Math.cos(th) * r;
    pos[i*3+1] = y;
    pos[i*3+2] = Math.sin(th) * r;
    seed[i] = Math.random();
    phase[i] = Math.random() * Math.PI * 2;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));

  const uniforms = {
    uTime: { value: 0 },
    uSize: { value: innerWidth < 760 ? 9 : 11 },
    uPixel: { value: Math.min(devicePixelRatio, 1.8) },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      uniform float uTime; uniform float uSize; uniform float uPixel;
      attribute float aSeed; attribute float aPhase;
      varying float vMix; varying float vAlpha;
      void main(){
        vec3 p = position;
        float d = 0.018*sin(p.y*6.0 + uTime*0.55)*sin(p.x*5.0 - uTime*0.33)
                + 0.014*cos(p.z*7.5 + uTime*0.42)
                + 0.010*sin(p.x*11.0 - p.z*7.0 + uTime*0.25);
        // a few mass-change "hotspots"
        d += 0.022*exp(-16.0*distance(p, normalize(vec3(-0.6,0.72,0.3))));
        d += 0.018*exp(-18.0*distance(p, normalize(vec3(0.2,-0.25,-0.9))));
        p *= 1.0 + d;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float twinkle = 0.78 + 0.22*sin(uTime*1.7 + aPhase*3.0);
        gl_PointSize = uSize * (0.5 + aSeed*0.85) * twinkle * (1.0 / -mv.z);
        vMix = smoothstep(-0.015, 0.06, d);
        vAlpha = 0.13 + 0.42*aSeed;
      }`,
    fragmentShader: `
      varying float vMix; varying float vAlpha;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if(d > 0.5) discard;
        float a = smoothstep(0.5, 0.02, d);
        vec3 cold = vec3(0.38, 0.78, 0.84);
        vec3 warm = vec3(0.95, 0.75, 0.36);
        vec3 col = mix(cold, warm, vMix);
        gl_FragColor = vec4(col, a * vAlpha);
      }`,
  });
  const globe = new THREE.Points(geo, mat);
  globe.scale.setScalar(2.0);
  globe.rotation.z = -0.18;
  root.add(globe);

  /* graticule — a quiet lat/long scaffold, no diagonal mesh */
  const grat = new THREE.Group();
  const gmat = new THREE.LineBasicMaterial({ color: 0x3b8492, transparent: true, opacity: 0.10 });
  for (let lat = -60; lat <= 60; lat += 30) {
    const phi = lat * Math.PI / 180, r = Math.cos(phi) * 2.01, y = Math.sin(phi) * 2.01;
    const pts = [];
    for (let i = 0; i <= 160; i++) { const a = i/160*Math.PI*2; pts.push(new THREE.Vector3(Math.cos(a)*r, y, Math.sin(a)*r)); }
    grat.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gmat));
  }
  for (let lon = 0; lon < 180; lon += 30) {
    const l = lon * Math.PI / 180, pts = [];
    for (let i = 0; i <= 90; i++) {
      const p = -Math.PI/2 + i/90*Math.PI;
      pts.push(new THREE.Vector3(Math.cos(p)*2.01*Math.cos(l), Math.sin(p)*2.01, Math.cos(p)*2.01*Math.sin(l)));
    }
    grat.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gmat));
  }
  root.add(grat);

  /* orbit rings + satellites */
  function ring(rx, ry, tilt, color, opacity){
    const pts = [];
    for (let i = 0; i <= 220; i++) {
      const a = (i/220) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a)*rx, 0, Math.sin(a)*ry));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    const line = new THREE.Line(g, m);
    line.rotation.x = tilt;
    return line;
  }
  const orbits = [
    { r: ring(2.75, 2.55, 1.02, 0x83d9e6, .20), speed: .16, color: 0x9fe6ef, size: .026 },
    { r: ring(3.10, 2.95, 1.22, 0xe6bb63, .18), speed: -.11, color: 0xffd487, size: .022 },
    { r: ring(3.48, 3.25, 1.36, 0xffffff, .10), speed: .075, color: 0xdfe9f2, size: .016 },
  ];
  const sats = [];
  orbits.forEach((o, idx) => {
    root.add(o.r);
    const sat = new THREE.Mesh(new THREE.SphereGeometry(o.size, 10, 10), new THREE.MeshBasicMaterial({ color: o.color }));
    root.add(sat);
    const trailGeo = new THREE.BufferGeometry();
    const n = 44;
    trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n*3), 3));
    const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: o.color, transparent: true, opacity: .28 }));
    root.add(trail);
    sats.push({ ...o, sat, trail, n, phase: idx * 2.1 });
  });

  /* starfield */
  const starsGeo = new THREE.BufferGeometry();
  const SN = 900;
  const sp = new Float32Array(SN*3);
  for (let i = 0; i < SN; i++) {
    const r = 14 + Math.random()*22;
    const th = Math.random()*Math.PI*2;
    const ph = Math.acos(2*Math.random()-1);
    sp[i*3] = r*Math.sin(ph)*Math.cos(th);
    sp[i*3+1] = r*Math.cos(ph);
    sp[i*3+2] = r*Math.sin(ph)*Math.sin(th);
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0x9fb4c8, size: .028, transparent: true, opacity: .55, sizeAttenuation: true }));
  scene.add(stars);

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener('pointermove', e => {
    tmx = (e.clientX / innerWidth - .5);
    tmy = (e.clientY / innerHeight - .5);
  }, { passive: true });

  function layout(){
    const w = innerWidth, h = innerHeight;
    const mobile = w < 900;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    uniforms.uSize.value = mobile ? 9 : 11;
    if (mobile) {
      root.position.set(0, .95, 0);
      root.scale.setScalar(1.0);
      camera.position.z = 8.4;
    } else {
      root.position.set(w > 1600 ? 3.1 : 2.95, 0.18, 0);
      root.scale.setScalar(0.86);
      camera.position.z = 7.35;
    }
  }
  layout();
  addEventListener('resize', layout);

  let visible = true;
  new IntersectionObserver(en => { visible = en[0].isIntersecting; }, { threshold: 0.01 }).observe($('#hero'));

  const t0 = performance.now();
  const trailPos = sats.map(s => new Float32Array(s.n*3));
  function frame(){
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = (performance.now() - t0) / 1000;
    uniforms.uTime.value = t;

    mx += (tmx - mx) * .035;
    my += (tmy - my) * .035;
    root.rotation.y = mx * .35 + t * .012;
    root.rotation.x = my * .18;
    stars.rotation.y = t * .004;

    sats.forEach((s, si) => {
      const a = t * s.speed + s.phase;
      const x = Math.cos(a) * (si === 0 ? 2.75 : si === 1 ? 3.10 : 3.48);
      const z = Math.sin(a) * (si === 0 ? 2.55 : si === 1 ? 2.95 : 3.25);
      const v = new THREE.Vector3(x, 0, z);
      v.applyEuler(new THREE.Euler(si === 0 ? 1.02 : si === 1 ? 1.22 : 1.36, 0, 0));
      // apply the ring's rotation to the satellite as well
      s.sat.position.copy(v);
      const arr = trailPos[si];
      for (let i = s.n - 1; i > 0; i--) { arr[i*3] = arr[(i-1)*3]; arr[i*3+1] = arr[(i-1)*3+1]; arr[i*3+2] = arr[(i-1)*3+2]; }
      arr[0] = v.x; arr[1] = v.y; arr[2] = v.z;
      s.trail.geometry.attributes.position.needsUpdate = true;
      s.trail.geometry.setDrawRange(0, s.n);
    });

    const sy = window.scrollY;
    const fade = clamp(1 - sy / (innerHeight * .9), 0, 1);
    canvas.style.opacity = fade.toFixed(3);
    renderer.render(scene, camera);
  }
  renderer.render(scene, camera);
  window.__markHeroReady?.();
  frame();
}
initHero();

/* ------------------------------------------------------------
   2. programme — donut, session list, days, matrix
   ------------------------------------------------------------ */
const SESSIONS = DATA.sessions;
const ITEMS = DATA.items;
const SESSION_COLORS = ['#e6bb63','#dfb15a','#d7a651','#c99a4d','#b98e4c','#a4834f','#8e7d55','#79a3a0','#83d9e6','#9fe6ef'];

function renderDonut(){
  const svg = $('#donut');
  if (!svg) return;
  const total = ITEMS.length;
  const R = 150, C = 2 * Math.PI * R;
  const NS = 'http://www.w3.org/2000/svg';
  const bg = document.createElementNS(NS, 'circle');
  bg.setAttribute('cx', 210); bg.setAttribute('cy', 210); bg.setAttribute('r', R);
  bg.setAttribute('fill', 'none'); bg.setAttribute('stroke', 'rgba(241,238,231,.06)'); bg.setAttribute('stroke-width', 26);
  svg.appendChild(bg);

  let offset = 0;
  SESSIONS.forEach((s, i) => {
    const len = (s.count / total) * C;
    const gap = 3;
    const seg = document.createElementNS(NS, 'circle');
    seg.setAttribute('cx', 210); seg.setAttribute('cy', 210); seg.setAttribute('r', R);
    seg.setAttribute('fill', 'none');
    seg.setAttribute('stroke', SESSION_COLORS[i % SESSION_COLORS.length]);
    seg.setAttribute('stroke-width', 26);
    seg.setAttribute('stroke-dasharray', `${Math.max(1, len - gap)} ${C - Math.max(1, len - gap)}`);
    seg.setAttribute('stroke-dashoffset', -offset);
    seg.setAttribute('transform', 'rotate(-90 210 210)');
    seg.style.transition = 'opacity .3s, stroke-width .3s';
    seg.style.cursor = 'pointer';
    seg.dataset.code = s.code;
    seg.addEventListener('mouseenter', () => setDonutActive(s.code));
    seg.addEventListener('mouseleave', () => setDonutActive(null));
    seg.addEventListener('click', () => filterToSession(s.code));
    svg.appendChild(seg);
    offset += len;
  });

  const inner = document.createElementNS(NS, 'circle');
  inner.setAttribute('cx', 210); inner.setAttribute('cy', 210); inner.setAttribute('r', 116);
  inner.setAttribute('fill', 'none'); inner.setAttribute('stroke', 'rgba(241,238,231,.10)');
  inner.setAttribute('stroke-width', 1); inner.setAttribute('stroke-dasharray', '1 7');
  svg.appendChild(inner);
}

function setDonutActive(code){
  $$('#donut circle[data-code]').forEach(c => {
    c.style.opacity = !code || c.dataset.code === code ? 1 : .18;
    c.setAttribute('stroke-width', c.dataset.code === code ? 30 : 26);
  });
  $$('.session-row').forEach(r => r.classList.toggle('dim', !!code && r.dataset.code !== code));
  const label = $('#donutLabel');
  if (!label) return;
  if (code) {
    const s = SESSIONS.find(x => x.code === code);
    label.textContent = `${s.code} · ${s.count}`;
    $('#donutCount').textContent = s.count;
  } else {
    label.textContent = 'ALL SESSIONS';
    $('#donutCount').textContent = ITEMS.length;
  }
}

function renderSessions(){
  const wrap = $('#sessionList');
  if (!wrap) return;
  const max = Math.max(...SESSIONS.map(s => s.count));
  SESSIONS.forEach(s => {
    const row = document.createElement('div');
    row.className = 'session-row';
    row.dataset.code = s.code;
    row.innerHTML = `
      <span class="code">${s.code}</span>
      <span class="name">${esc(s.name)}<small>${s.slots[0] ? s.slots[0].weekday + ' ' + s.slots[0].day + ' OCT · ' + s.slots[0].time : ''}</small></span>
      <span class="bar"><i style="width:0"></i></span>
      <span class="num">${s.count}</span>`;
    row.addEventListener('mouseenter', () => setDonutActive(s.code));
    row.addEventListener('mouseleave', () => setDonutActive(null));
    row.addEventListener('click', () => filterToSession(s.code));
    wrap.appendChild(row);
  });
  const io = new IntersectionObserver(en => {
    if (!en[0].isIntersecting) return;
    $$('.session-row .bar i', wrap).forEach((bar, i) => setTimeout(() => { bar.style.width = (SESSIONS[i].count / max * 100) + '%'; }, 80 + i*55));
    io.disconnect();
  }, { threshold: .2 });
  io.observe(wrap);
}

function filterToSession(code){
  setExplorerFilter(code);
  const target = $('#explore');
  if (target) {
    if (lenis) lenis.scrollTo(target, { offset: -60, duration: 1.3 });
    else target.scrollIntoView({ behavior: 'smooth' });
  }
}

function parseRange(str){
  const m = String(str || '').match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return { s: +m[1]*60 + +m[2], e: +m[3]*60 + +m[4] };
}

function renderDays(){
  const wrap = $('#dayTimeline');
  if (!wrap) return;
  const START = 8.5*60, END = 18.25*60, SPAN = END - START;
  const days = [
    { d: 13, label: 'TUE', date: '13 OCT' },
    { d: 14, label: 'WED', date: '14 OCT' },
    { d: 15, label: 'THU', date: '15 OCT' },
  ];
  days.forEach(day => {
    const col = document.createElement('div');
    col.className = 'tl-col';
    col.innerHTML = `<h4><b>${day.label}</b>${day.date}</h4>`;
    for (let t = 9; t <= 18; t += 1) {
      const line = document.createElement('div');
      line.className = 'tl-hour';
      line.style.top = ((t*60 - START) / SPAN * 100) + '%';
      line.innerHTML = t % 2 === 1 ? `<span>${String(t).padStart(2,'0')}:00</span>` : '';
      col.appendChild(line);
    }
    const fmt = m => String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0');
    const entries = [];
    SESSIONS.forEach(s => s.slots.filter(sl => sl.day === day.d).forEach(sl => {
      const r = parseRange(sl.time);
      if (r) entries.push({ s, sl, r, poster: sl.type === 'Posters' });
    }));

    const posterEntry = entries.find(e => e.poster);
    if (posterEntry) {
      const total = ITEMS.filter(i => i.type === 'Poster' && i.day === day.d).length;
      const b = document.createElement('div');
      b.className = 'tl-block poster';
      b.style.top = ((posterEntry.r.s - START) / SPAN * 100) + '%';
      b.style.height = ((posterEntry.r.e - posterEntry.r.s) / SPAN * 100) + '%';
      b.innerHTML = `<b>POSTERS · ${total}</b><span>Poster session</span><em>${posterEntry.sl.time} · Foyer</em>`;
      b.title = 'Poster session — ' + total + ' posters';
      col.appendChild(b);
    }

    const orals = entries.filter(e => !e.poster).sort((a,b) => a.r.s - b.r.s);
    const merged = [];
    for (const e of orals) {
      const last = merged[merged.length-1];
      if (last && (last.r.e - last.r.s) <= 15 && e.r.s <= last.r.e + 2) {
        last.r.e = e.r.e;
        last.sessions.push(e.s);
      } else {
        merged.push({ r: { ...e.r }, sessions: [e.s] });
      }
    }
    merged.forEach(m => {
      const count = m.sessions.reduce((a,s) => a + s.count, 0);
      const codes = m.sessions.map(s => s.code).join(' + ');
      const names = [...new Set(m.sessions.map(s => s.name))].join(' / ');
      const b = document.createElement('div');
      b.className = 'tl-block';
      const top = (m.r.s - START) / SPAN * 100;
      const hgt = (m.r.e - m.r.s) / SPAN * 100;
      if (hgt < 8) b.classList.add('compact');
      else if (hgt < 20) b.classList.add('short');
      b.style.top = top + '%';
      b.style.height = hgt + '%';
      b.style.borderColor = SESSION_COLORS[SESSIONS.indexOf(m.sessions[0])] + '55';
      b.innerHTML = `<b>${codes} · ${count}</b><span>${esc(names)}</span><em>${fmt(m.r.s)}–${fmt(m.r.e)}</em>`;
      b.title = names + ' — ' + fmt(m.r.s) + '–' + fmt(m.r.e);
      col.appendChild(b);
    });
    wrap.appendChild(col);
  });
}

const MATRIX_TAGS = [
  ['Future', 'Future missions'], ['AI', 'AI & machine learning'], ['Water', 'Hydrology & extremes'],
  ['Cryo', 'Cryosphere'], ['Ocean', 'Ocean & sea level'], ['Earth', 'Solid Earth'],
  ['Ops', 'Operational services'], ['Frame', 'Reference frames'],
];
function renderMatrix(){
  const wrap = $('#matrix');
  if (!wrap) return;
  wrap.appendChild(Object.assign(document.createElement('div'), { className: 'mh', textContent: '' }));
  MATRIX_TAGS.forEach(([label]) => {
    const d = document.createElement('div'); d.className = 'mh'; d.textContent = label; wrap.appendChild(d);
  });
  let max = 0;
  const grid = SESSIONS.map(s => MATRIX_TAGS.map(([, tag]) => {
    const n = ITEMS.filter(i => i.session === s.code && i.tags.includes(tag)).length;
    max = Math.max(max, n); return n;
  }));
  SESSIONS.forEach((s, si) => {
    const label = document.createElement('div');
    label.className = 'mr';
    label.innerHTML = `<b>${s.code}</b><span>${esc(s.name.split(' ').slice(0,2).join(' '))}</span>`;
    wrap.appendChild(label);
    MATRIX_TAGS.forEach(([label2, tag], ti) => {
      const n = grid[si][ti];
      const cell = document.createElement('div');
      cell.className = 'mc';
      cell.textContent = n || '';
      cell.title = `${s.code} · ${tag}: ${n} papers`;
      const a = n === 0 ? 0 : 0.10 + 0.62 * Math.pow(n / max, .7);
      cell.style.background = n === 0 ? 'rgba(255,255,255,.025)' : `rgba(230,187,99,${a.toFixed(2)})`;
      if (a > .36) cell.style.color = '#080808';
      wrap.appendChild(cell);
    });
  });
}

function renderAiBars(){
  const wrap = $('#aiBars');
  if (!wrap) return;
  const rows = [
    ['DOWNSCALING / GAP-FILL', 3],
    ['SIGNAL SEPARATION', 1],
    ['SENSOR TRANSPLANT', 1],
    ['QUALITY SCREENING', 1],
    ['OTHER', 1],
  ];
  wrap.innerHTML = rows.map(([label, n]) => `<div class="mini-bar"><span>${label}</span><i style="--w:${n/3*100}%"></i><b>${n}</b></div>`).join('');
}

renderDonut();
renderSessions();
renderDays();
renderMatrix();
renderAiBars();

/* ------------------------------------------------------------
   3. mission timeline
   ------------------------------------------------------------ */
function renderMissions(){
  const wrap = $('#missionItems');
  if (!wrap) return;
  const items = [
    { y: '2002', t: 'GRACE', d: '双星发射，开启 22 年的时变重力记录。', tag: 'LAUNCH' },
    { y: '2017', t: 'GRACE ends', d: '任务结束；GRACE-FO 尚未入轨，record 出现 11 个月空档。', tag: 'GAP' },
    { y: '2018', t: 'GRACE-FO', d: 'LRI 在轨验证；月产品继续，成为气候系统的基础观测。', tag: 'IN ORBIT' },
    { y: '2026', t: 'GSTM 2026', d: 'RL07 于 Q4 发布；GRACE-C 进入 AIT；MAGIC / NGGM 进入设计对话。', tag: 'NOW', now: true },
    { y: '2027', t: 'GRATTIS', d: '2 月飞行，验证 S-GRS 简化引力参考传感器，目标 10⁻¹⁰ m/s²/√Hz。', tag: 'TECH DEMO' },
    { y: '2028', t: 'GRACE-C', d: '12 月发射；NASA / DLR 联合，接续极轨对与 LRI 观测。', tag: 'NEXT PAIR' },
    { y: '2030s', t: 'MAGIC / NGGM', d: '极轨 + 倾斜多对编队，目标 5—10 天、更细空间尺度的质量变化。', tag: 'CONSTELLATION' },
  ];
  wrap.innerHTML = items.map(i => `
    <div class="mission-item ${i.now ? 'now' : ''}">
      <div class="my">${i.y}</div>
      <h4>${i.t}</h4>
      <p>${i.d}</p>
      <em>${i.tag}</em>
    </div>`).join('');
}
renderMissions();

/* ------------------------------------------------------------
   4. map + ranks
   ------------------------------------------------------------ */
const COUNTRIES_CN = {
  'United States':'美国','Germany':'德国','France':'法国','Netherlands':'荷兰','Austria':'奥地利',
  'Denmark':'丹麦','Finland':'芬兰','Switzerland':'瑞士','China':'中国','United Kingdom':'英国',
  'Italy':'意大利','Poland':'波兰','Japan':'日本','India':'印度','Sweden':'瑞典','Lithuania':'立陶宛',
  'Czech Republic':'捷克','DR Congo':'刚果（金）','South Korea':'韩国','Australia':'澳大利亚','Belgium':'比利时'
};

function initMap(){
  const canvas = $('#mapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 1200, H = 510;
  canvas.width = W; canvas.height = H;
  const dots = DATA.map.dots;
  const maxC = Math.max(...dots.map(d => d[2]), 1);
  const tip = $('#mapTooltip');
  let t0 = null, hover = null;

  function draw(progress){
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < dots.length; i++) {
      const [x, y, c] = dots[i];
      const px = x * W, py = y * H;
      const local = clamp((progress - (x * .25)) / .75, 0, 1);
      if (local <= 0) continue;
      if (!c) {
        ctx.fillStyle = `rgba(241,238,231,${.13 * local})`;
        ctx.beginPath(); ctx.arc(px, py, 1.05, 0, 6.283); ctx.fill();
      } else {
        const k = Math.sqrt(c / maxC);
        const a = (.22 + .62 * k) * local;
        if (hover === c) {
          ctx.fillStyle = `rgba(131,217,230,${a})`;
          ctx.beginPath(); ctx.arc(px, py, 1.5 + 1.9*k, 0, 6.283); ctx.fill();
        } else {
          ctx.fillStyle = `rgba(230,187,99,${a})`;
          ctx.beginPath(); ctx.arc(px, py, 1.15 + 1.35*k, 0, 6.283); ctx.fill();
        }
      }
    }
    // graticule
    ctx.strokeStyle = 'rgba(241,238,231,.05)'; ctx.lineWidth = 1;
    for (let i = 1; i < 6; i++) { const y = H*i/6; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  }

  const io = new IntersectionObserver(en => {
    if (!en[0].isIntersecting) return;
    io.disconnect();
    if (REDUCED) { draw(1); return; }
    const start = performance.now();
    const tick = now => {
      const p = clamp((now-start)/1500, 0, 1);
      draw(1 - Math.pow(1-p, 3));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { threshold: .2 });
  io.observe(canvas);
  draw(1);

  let rafPending = false;
  const schedule = () => {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => { rafPending = false; draw(1); });
  };
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    const pr = canvas.parentElement.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width, my = (e.clientY - r.top) / r.height;
    let best = null, bd = .05;
    DATA.map.hot.forEach(h => {
      const d = Math.hypot(h.x - mx, (h.y - my) * 0.5);
      if (d < bd) { bd = d; best = h; }
    });
    if (best) {
      hover = best.count;
      tip.classList.add('on');
      tip.style.left = (r.left - pr.left + best.x * r.width) + 'px';
      tip.style.top = (r.top - pr.top + best.y * r.height) + 'px';
      tip.innerHTML = `<b>${best.count}</b> papers · ${esc(best.name)}`;
    } else {
      hover = null;
      tip.classList.remove('on');
    }
    schedule();
  });
  canvas.addEventListener('mouseleave', () => { hover = null; tip.classList.remove('on'); schedule(); });
}

function renderRanks(tab = 'countries'){
  const wrap = $('#rankList');
  if (!wrap) return;
  const src = tab === 'countries' ? DATA.countries : DATA.institutions;
  const entries = Object.entries(src).slice(0, 12);
  const max = entries[0]?.[1] || 1;
  wrap.innerHTML = entries.map(([name, n], i) => {
    const cn = tab === 'countries' ? (COUNTRIES_CN[name] || '') : '';
    return `<div class="rank-row">
      <span class="ri">${String(i+1).padStart(2,'0')}</span>
      <span class="rn" style="--w:${(n/max*100).toFixed(1)}%">${esc(name)}${cn ? ' <span style="color:var(--dim)">' + cn + '</span>' : ''}</span>
      <span class="rv">${n}</span>
    </div>`;
  }).join('');
}

initMap();
renderRanks('countries');
$$('.world-tabs button').forEach(b => b.addEventListener('click', () => {
  $$('.world-tabs button').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  renderRanks(b.dataset.tab);
}));

/* ------------------------------------------------------------
   5. explorer
   ------------------------------------------------------------ */
const state = { session: 'all', type: 'all', q: '', shown: 24 };
const grid = $('#paperGrid');
const resultCount = $('#resultCount');
const activeFilter = $('#activeFilter');
const loadMore = $('#loadMore');

function buildFilters(){
  const wrap = $('#sessionFilters');
  const all = document.createElement('button');
  all.textContent = 'ALL'; all.className = 'active'; all.dataset.session = 'all';
  wrap.appendChild(all);
  SESSIONS.forEach(s => {
    const b = document.createElement('button');
    b.textContent = s.code; b.dataset.session = s.code; b.title = s.name;
    wrap.appendChild(b);
  });
  wrap.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', wrap).forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    setExplorerFilter(b.dataset.session);
  });
}

function setExplorerFilter(code){
  state.session = code; state.shown = 24;
  const wrap = $('#sessionFilters');
  if (wrap) $$('button', wrap).forEach(b => b.classList.toggle('active', b.dataset.session === code));
  const s = SESSIONS.find(x => x.code === code);
  if (activeFilter) activeFilter.textContent = code === 'all' ? 'ALL SESSIONS' : `${code} · ${s ? s.name.toUpperCase() : ''}`;
  renderPapers();
}

function filtered(){
  const q = state.q.trim().toLowerCase();
  return ITEMS.filter(i => {
    if (state.session !== 'all' && i.session !== state.session) return false;
    if (state.type !== 'all' && i.type !== state.type) return false;
    if (!q) return true;
    return (i.title + ' ' + i.authors + ' ' + i.text + ' ' + i.sessionName).toLowerCase().includes(q);
  }).sort((a,b) => a.n - b.n);
}

function highlight(text, q){
  if (!q) return esc(text);
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i+q.length)) + '</mark>' + esc(text.slice(i+q.length));
}

function renderPapers(){
  if (!grid) return;
  const list = filtered();
  const show = list.slice(0, state.shown);
  if (resultCount) resultCount.textContent = `${list.length} contribution${list.length === 1 ? '' : 's'}`;
  if (!list.length) {
    grid.innerHTML = `<div class="empty-result"><b>0</b><span>没有匹配的报告。试试更短的关键词，或切回 ALL。</span></div>`;
    if (loadMore) loadMore.classList.add('hidden');
    return;
  }
  grid.innerHTML = show.map(i => {
    const tags = i.tags.slice(0, 3);
    const q = state.q.trim().toLowerCase();
    return `<article class="paper-card" data-n="${i.n}" tabindex="0" role="button" aria-label="打开摘要 ${esc(i.title)}">
      <div class="pc-top"><b>GSTM2026-${i.n}</b><span>${i.session} · ${i.type.toUpperCase()}</span></div>
      <h3 class="pc-title">${highlight(i.title, q)}</h3>
      <p class="pc-authors">${esc(i.authors)}</p>
      <div class="pc-tags">${tags.map(t => `<span class="${t === 'Future missions' || t === 'AI & machine learning' ? 'hot' : ''}">${esc(t)}</span>`).join('')}</div>
    </article>`;
  }).join('');
  if (loadMore) loadMore.classList.toggle('hidden', state.shown >= list.length);

  $$('.paper-card', grid).forEach(card => {
    const open = () => openPaper(+card.dataset.n);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
}

function renderAnatomy(){
  const table = $('#coocTable');
  if (!table) return;
  const topics = [
    ['Data products', 'DATA'],
    ['Hydrology & extremes', 'WATER'],
    ['Ocean & sea level', 'OCEAN'],
    ['Future missions', 'FUTURE'],
    ['Cryosphere', 'ICE'],
    ['Reference frames', 'FRAME'],
    ['Operational services', 'OPS'],
    ['AI & machine learning', 'AI']
  ];
  let html = '<thead><tr><th></th>' + topics.map(t => '<th title="' + t[0] + '">' + t[1] + '</th>').join('') + '</tr></thead><tbody>';
  topics.forEach((a, i) => {
    html += '<tr><td class="row" title="' + a[0] + '">' + a[1] + '</td>';
    topics.forEach((b, j) => {
      if (i === j) { html += '<td class="diag">—</td>'; return; }
      const n = ITEMS.filter(it => (it.tags || []).includes(a[0]) && (it.tags || []).includes(b[0])).length;
      const lv = n === 0 ? '' : n <= 5 ? 'l1' : n <= 10 ? 'l2' : n <= 18 ? 'l3' : 'l4';
      html += '<td class="' + lv + '" title="' + a[0] + ' × ' + b[0] + ': ' + n + '">' + (n || '·') + '</td>';
    });
    html += '</tr>';
  });
  table.innerHTML = html + '</tbody>';

  const sessionBars = $('#sessionBars');
  if (sessionBars) {
    const sessions = [...SESSIONS].sort((a, b) => b.count - a.count);
    const max = Math.max(...sessions.map(s => s.count));
    sessionBars.innerHTML = sessions.map(s => {
      const oral = s.orals / max * 100;
      const poster = s.posters / max * 100;
      const label = s.code + ' · ' + s.name.split(/\s+/).slice(0, 2).join(' ');
      return '<div class="an-bar-row" title="' + esc(s.name) + '">' +
        '<div class="an-bar-label"><b>' + s.code + '</b>' + esc(s.name.split(/\s+/).slice(0, 2).join(' ')) + '</div>' +
        '<div class="an-track"><i class="oral" style="width:' + oral.toFixed(2) + '%"></i><i class="poster" style="width:' + poster.toFixed(2) + '%"></i></div>' +
        '<div class="an-val">' + s.count + '</div></div>';
    }).join('');
  }

  const instBars = $('#institutionBars');
  if (instBars) {
    const inst = Object.entries(DATA.institutions).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const max = inst[0][1];
    instBars.innerHTML = inst.map(([name, n]) =>
      '<div class="an-bar-row"><div class="an-bar-label" title="' + esc(name) + '">' + esc(name) + '</div>' +
      '<div class="an-track"><i class="single" style="width:' + (n / max * 100).toFixed(2) + '%"></i></div>' +
      '<div class="an-val">' + n + '</div></div>'
    ).join('');
  }

  const authorBars = $('#authorBars');
  if (authorBars) {
    const bins = [['1–3', 0], ['4–6', 0], ['7–9', 0], ['10–14', 0], ['15+', 0]];
    ITEMS.forEach(it => {
      const n = (it.authors.match(/,/g) || []).length + 1;
      const k = n <= 3 ? 0 : n <= 6 ? 1 : n <= 9 ? 2 : n <= 14 ? 3 : 4;
      bins[k][1]++;
    });
    const max = Math.max(...bins.map(b => b[1]));
    authorBars.innerHTML = bins.map(([label, n]) =>
      '<div class="an-bar-row"><div class="an-bar-label">' + label + ' 位</div>' +
      '<div class="an-track"><i class="single" style="width:' + (n / max * 100).toFixed(2) + '%"></i></div>' +
      '<div class="an-val">' + n + '</div></div>'
    ).join('');
  }
}

function renderDomainMap(){
  const svg = $('#domainMap');
  if (!svg) return;
  const N = ITEMS.length;
  const W = 1200, H = 640, PAD = 56;
  const stop = new Set('the and for with from that this these those are was were has have had not but its their they we our using used use into over under between within during than then also such can may will would could should about across after before more most other some each both all any only own same very just because while where when what which who whom whose how why is are be been being do does did doing a an of to in on at by as or if it it’s'.split(/\s+/));
  const methods = ['grace-c','nggm','magic','slr','vlbi','gnss','gps','kalman','mascon','spherical harmonic','least squares','tikhonov','svd','lstm','mlp','bilstm','u-net','random forest','machine learning','deep learning','neural network','inversion','assimilation','stacked','l1b','l2','l3','l4','quicklook','accelerometer','laser ranging','interferometry','clock','cold atom','gravimetry','altimetry','argo','downscaling','filter','eof','empirical orthogonal','bias correction','regularization','joint inversion','data assimilation','degree 90','gaussian'];
  const dataWords = ['tws','groundwater','lake','reservoir','ice sheet','glacier','sea level','ocean','atmosphere','aod1b','precipitation','soil moisture','drought','flood','hydrology','cryosphere','solid earth','gia','reference frame','trf','orbit','mascon','level-2','terrestrial water storage','water storage','mass balance','sea-level','groundwater storage'];
  const tokenize = (it) => {
    const base = (it.title + ' ' + it.title + ' ' + it.text + ' ' + (it.tags || []).join(' ') + ' ' + (it.tags || []).join(' ')).toLowerCase();
    const toks = base.match(/[a-z][a-z0-9-]{2,}/g) || [];
    const extra = [];
    for (const term of methods.concat(dataWords)) {
      if (base.includes(term)) {
        const parts = term.split(/\s+/);
        extra.push(...parts, ...parts);
      }
    }
    return toks.concat(extra).filter(t => !stop.has(t));
  };
  const docs = ITEMS.map(tokenize);
  const df = {};
  docs.forEach(toks => [...new Set(toks)].forEach(t => { df[t] = (df[t] || 0) + 1; }));
  const vocab = Object.keys(df).filter(t => df[t] >= 2 && df[t] <= 80);
  const index = new Map(vocab.map((t, i) => [t, i]));
  const vecs = docs.map(toks => {
    const tf = new Map();
    toks.forEach(t => { if (index.has(t)) tf.set(t, (tf.get(t) || 0) + 1); });
    const v = new Float64Array(vocab.length);
    let norm = 0;
    for (const [t, n] of tf) {
      const i = index.get(t);
      const w = (1 + Math.log(n)) * Math.log((N + 1) / (df[t] + 1));
      v[i] = w; norm += w * w;
    }
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < v.length; i++) v[i] /= norm;
    return v;
  });
  const sim = Array.from({ length: N }, () => new Float64Array(N));
  for (let i = 0; i < N; i++) {
    sim[i][i] = 1;
    for (let j = i + 1; j < N; j++) {
      let s = 0;
      const a = vecs[i], b = vecs[j];
      for (let k = 0; k < vocab.length; k++) s += a[k] * b[k];
      sim[i][j] = sim[j][i] = s;
    }
  }
  const row = new Float64Array(N), col = new Float64Array(N);
  let grand = 0;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { row[i] += sim[i][j]; col[j] += sim[i][j]; grand += sim[i][j]; }
  for (let i = 0; i < N; i++) { row[i] /= N; col[i] /= N; }
  grand /= N * N;
  const G = Array.from({ length: N }, () => new Float64Array(N));
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) G[i][j] = sim[i][j] - row[i] - col[j] + grand;

  function topVec(M) {
    let v = new Float64Array(N);
    for (let i = 0; i < N; i++) v[i] = Math.sin(i * 12.9898) * 43758.5453 % 1 + .1;
    let norm = Math.hypot(...v) || 1;
    for (let i = 0; i < N; i++) v[i] /= norm;
    let lambda = 0;
    for (let it = 0; it < 180; it++) {
      const w = new Float64Array(N);
      for (let i = 0; i < N; i++) { let s = 0; for (let j = 0; j < N; j++) s += M[i][j] * v[j]; w[i] = s; }
      norm = Math.hypot(...w) || 1;
      for (let i = 0; i < N; i++) w[i] /= norm;
      lambda = 0; for (let i = 0; i < N; i++) lambda += v[i] * w[i] * norm;
      v = w;
    }
    return { v, lambda };
  }
  const e1 = topVec(G);
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) G[i][j] -= e1.lambda * e1.v[i] * e1.v[j];
  const e2 = topVec(G);
  const s1 = Math.sqrt(Math.max(e1.lambda, 0)), s2 = Math.sqrt(Math.max(e2.lambda, 0));
  let xs = e1.v.map((v, i) => v * s1), ys = e2.v.map((v, i) => v * s2);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const mapX = x => PAD + (x - minX) / (maxX - minX || 1) * (W - PAD * 2);
  const mapY = y => PAD + (y - minY) / (maxY - minY || 1) * (H - PAD * 2);
  xs = xs.map(mapX); ys = ys.map(mapY);

  const domains = [
    { key: 'AI & machine learning', label: 'AI / ML', color: '#e07a5f' },
    { key: 'Hydrology & extremes', label: 'HYDROLOGY', color: '#4fa3b8' },
    { key: 'Cryosphere', label: 'CRYOSPHERE', color: '#83d9e6' },
    { key: 'Ocean & sea level', label: 'OCEAN', color: '#3e7fa8' },
    { key: 'Future missions', label: 'FUTURE', color: '#e6bb63' },
    { key: 'Solid Earth', label: 'SOLID EARTH', color: '#c9973f' },
    { key: 'Reference frames', label: 'REFERENCE', color: '#9b8cff' },
    { key: 'Data products', label: 'DATA', color: '#8e98a6' },
    { key: 'Operational services', label: 'OPS', color: '#b9a16b' }
  ];
  const domainOf = (it) => (domains.find(d => (it.tags || []).includes(d.key)) || domains[7]).key;
  const colorOf = (it) => (domains.find(d => d.key === domainOf(it)) || domains[7]).color;

  const edges = new Set();
  for (let i = 0; i < N; i++) {
    const ranked = [];
    for (let j = 0; j < N; j++) if (i !== j && sim[i][j] > .16) ranked.push([j, sim[i][j]]);
    ranked.sort((a, b) => b[1] - a[1]);
    ranked.slice(0, 3).forEach(([j, s]) => edges.add(i < j ? i + '-' + j + '-' + s.toFixed(2) : j + '-' + i + '-' + s.toFixed(2)));
  }
  const ns = 'http://www.w3.org/2000/svg';
  const add = (tag, attrs) => { const e = document.createElementNS(ns, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; };
  svg.innerHTML = '';
  add('rect', { x: 0, y: 0, width: W, height: H, fill: '#080c13' });
  add('g', { opacity: .55 }).innerHTML = '';
  const grid = add('g', { opacity: .45 });
  for (let i = 1; i < 6; i++) {
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', 0); line.setAttribute('x2', W); line.setAttribute('y1', H / 6 * i); line.setAttribute('y2', H / 6 * i);
    line.setAttribute('stroke', 'rgba(241,238,231,.06)'); grid.appendChild(line);
  }
  const groups = {};
  ITEMS.forEach((it, i) => { const d = domainOf(it); (groups[d] ||= []).push(i); });
  const hullOf = (points) => {
    const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [];
    for (const q of p) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
    const upper = [];
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
    lower.pop(); upper.pop();
    return lower.concat(upper);
  };
  const defs = add('defs', {});
  defs.innerHTML = '<filter id="terrainBlur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="24"/></filter>';
  const fieldGroup = add('g', {});
  Object.entries(groups).forEach(([key, arr]) => {
    if (arr.length < 3) return;
    const d = domains.find(x => x.key === key) || domains[7];
    const cx = arr.reduce((s, i) => s + xs[i], 0) / arr.length;
    const cy = arr.reduce((s, i) => s + ys[i], 0) / arr.length;
    const radius = Math.max(...arr.map(i => Math.hypot(xs[i] - cx, ys[i] - cy))) + 16;
    const halo = document.createElementNS(ns, 'circle');
    halo.setAttribute('cx', cx); halo.setAttribute('cy', cy); halo.setAttribute('r', radius);
    halo.setAttribute('fill', d.color); halo.setAttribute('fill-opacity', '.065');
    halo.setAttribute('filter', 'url(#terrainBlur)'); fieldGroup.appendChild(halo);
    const pts = hullOf(arr.map(i => [xs[i], ys[i]]));
    if (pts.length >= 3) {
      const path = document.createElementNS(ns, 'path');
      const dd = pts.map(([x, y], i) => {
        const dx = x - cx, dy = y - cy, len = Math.hypot(dx, dy) || 1;
        return (i ? 'L' : 'M') + (x + dx / len * 12).toFixed(1) + ',' + (y + dy / len * 12).toFixed(1);
      }).join(' ') + 'Z';
      path.setAttribute('d', dd); path.setAttribute('fill', d.color); path.setAttribute('fill-opacity', '.025');
      path.setAttribute('stroke', d.color); path.setAttribute('stroke-opacity', '.32'); path.setAttribute('stroke-width', '1');
      path.setAttribute('stroke-dasharray', '2 6'); fieldGroup.appendChild(path);
    }
  });
  const edgeGroup = add('g', { opacity: .8 });
  edges.forEach(key => {
    const [a, b, s] = key.split('-');
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', xs[+a]); line.setAttribute('y1', ys[+a]); line.setAttribute('x2', xs[+b]); line.setAttribute('y2', ys[+b]);
    line.setAttribute('stroke', 'rgba(131,217,230,' + Math.min(.34, (+s - .16) * 1.6).toFixed(2) + ')');
    line.setAttribute('stroke-width', .7); edgeGroup.appendChild(line);
  });
  const nodeGroup = add('g', {});
  ITEMS.forEach((it, i) => {
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'domain-node');
    g.setAttribute('data-n', it.n);
    g.setAttribute('transform', 'translate(' + xs[i].toFixed(1) + ',' + ys[i].toFixed(1) + ')');
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('r', it.tags && it.tags.includes('Data products') ? 5.2 : 4.2);
    c.setAttribute('fill', colorOf(it)); c.setAttribute('fill-opacity', '.82');
    c.setAttribute('stroke', (it.tags || []).includes('Future missions') ? '#e6bb63' : '#080c13');
    c.setAttribute('stroke-width', (it.tags || []).includes('Future missions') ? '1.7' : '1.2');
    const title = document.createElementNS(ns, 'title');
    title.textContent = it.title + ' · ' + it.session + ' · ' + (it.tags || []).join(' / ');
    g.appendChild(c); g.appendChild(title); nodeGroup.appendChild(g);
  });
  const labelGroup = add('g', {});
  Object.entries(groups).forEach(([key, arr]) => {
    if (arr.length < 3) return;
    const d = domains.find(x => x.key === key) || domains[7];
    const cx = arr.reduce((s, i) => s + xs[i], 0) / arr.length;
    const cy = arr.reduce((s, i) => s + ys[i], 0) / arr.length;
    const off = { 'Future missions': [-104, -24], 'Data products': [62, 10], 'Ocean & sea level': [-42, 30], 'Reference frames': [40, -18] }[key] || [0, -16];
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', (cx + off[0]).toFixed(1)); t.setAttribute('y', (cy + off[1]).toFixed(1));
    t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'domain-label');
    t.setAttribute('fill', d.color);
    t.textContent = d.label + ' · ' + arr.length;
    labelGroup.appendChild(t);
  });
  svg.querySelectorAll('.domain-node').forEach(g => g.addEventListener('click', () => openPaper(+g.dataset.n)));

  const legend = $('#domainLegend');
  if (legend) {
    const counts = {};
    ITEMS.forEach(it => { const d = domainOf(it); counts[d] = (counts[d] || 0) + 1; });
    legend.innerHTML = '<span class="legend-lead">DOMINANT THEME</span>' + domains.filter(d => counts[d.key]).map(d => '<span><i style="background:' + d.color + '"></i>' + d.label + ' <b>' + counts[d.key] + '</b></span>').join('') +
      '<span class="future-ring"><i></i>FUTURE MISSION RING <b>' + ITEMS.filter(it => (it.tags || []).includes('Future missions')).length + '</b></span>';
  }
}

function renderAlluvial(){
  const svg = $('#alluvMap');
  if (!svg) return;
  const W = 1200, H = 620, TOP = 58, BOT = 34, GAP = 7, NW = 18;
  const methodDefs = [
    { key: 'ML / statistics', label: 'ML / STATS', color: '#e07a5f' },
    { key: 'Mission / sensor', label: 'MISSION / SENSOR', color: '#e6bb63' },
    { key: 'Gravity inversion / mascon', label: 'INVERSION / MASCON', color: '#4fa3b8' },
    { key: 'Reference / orbit', label: 'REFERENCE / ORBIT', color: '#9b8cff' },
    { key: 'Data / ops / other', label: 'DATA / OPS / OTHER', color: '#8e98a6' }
  ];
  const dataDefs = [
    { key: 'Water / land', label: 'WATER / LAND', color: '#4fa3b8' },
    { key: 'Ice', label: 'ICE', color: '#83d9e6' },
    { key: 'Ocean', label: 'OCEAN', color: '#3e7fa8' },
    { key: 'Solid Earth', label: 'SOLID EARTH', color: '#c9973f' },
    { key: 'Reference / multi', label: 'REFERENCE / MULTI', color: '#9b8cff' },
    { key: 'Mission / other', label: 'MISSION / OTHER', color: '#e6bb63' },
    { key: 'Data / other', label: 'DATA / OTHER', color: '#8e98a6' }
  ];
  const methodOf = (it) => {
    const t = (it.title + ' ' + it.text + ' ' + (it.tags || []).join(' ')).toLowerCase();
    if ((it.tags || []).includes('AI & machine learning')) return 'ML / statistics';
    if (/slr|vlbi|gnss|reference frame|\btrf\b/.test(t)) return 'Reference / orbit';
    if ((it.tags || []).includes('Future missions') && /grace-c|nggm|magic|laser|accelerometer|clock|orbit|satellite|instrument/.test(t)) return 'Mission / sensor';
    if (/mascon|spherical harmonic|inversion|least squares|tikhonov|regularization|kalman|assimilation/.test(t)) return 'Gravity inversion / mascon';
    return 'Data / ops / other';
  };
  const dataOf = (it) => {
    const t = it.tags || [];
    if (t.includes('Hydrology & extremes')) return 'Water / land';
    if (t.includes('Cryosphere')) return 'Ice';
    if (t.includes('Ocean & sea level')) return 'Ocean';
    if (t.includes('Solid Earth')) return 'Solid Earth';
    if (t.includes('Reference frames')) return 'Reference / multi';
    if (t.includes('Future missions')) return 'Mission / other';
    return 'Data / other';
  };
  const sessions = [...SESSIONS].map(s => ({ key: s.code, label: s.code, name: s.name, count: 0, color: '#1d2733' })).sort((a, b) => a.key.localeCompare(b.key));
  const methods = methodDefs.map(d => ({ ...d, count: 0 }));
  const datas = dataDefs.map(d => ({ ...d, count: 0 }));
  const byKey = (arr, k) => arr.find(x => x.key === k);
  const sm = new Map(), md = new Map();
  ITEMS.forEach(it => {
    const s = byKey(sessions, it.session);
    const m = byKey(methods, methodOf(it));
    const d = byKey(datas, dataOf(it));
    if (!s || !m || !d) return;
    s.count++; m.count++; d.count++;
    const a = s.key + '\u0001' + m.key, b = m.key + '\u0001' + d.key;
    sm.set(a, (sm.get(a) || 0) + 1);
    md.set(b, (md.get(b) || 0) + 1);
  });
  const maxNodes = Math.max(sessions.length, methods.length, datas.length);
  const scale = (H - TOP - BOT - GAP * (maxNodes - 1)) / ITEMS.length;
  const layout = (arr) => {
    const totalH = arr.reduce((s, n) => s + n.count, 0) * scale + GAP * (arr.length - 1);
    let y = TOP + (H - TOP - BOT - totalH) / 2;
    arr.forEach(n => { n.h = n.count * scale; n.y = y; y += n.h + GAP; });
  };
  layout(sessions); layout(methods); layout(datas);
  const xs = { s: 76, m: 548, d: 1032 };
  const ns = 'http://www.w3.org/2000/svg';
  const add = (tag, attrs = {}) => { const e = document.createElementNS(ns, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; };
  svg.innerHTML = '';
  add('rect', { x: 0, y: 0, width: W, height: H, fill: '#080c13' });
  ['SESSION', 'METHOD', 'DATA DOMAIN'].forEach((t, i) => {
    const x = [xs.s, xs.m, xs.d][i];
    const e = add('text', { x: x + NW / 2, y: 28, 'text-anchor': 'middle', class: 'alluv-head' });
    e.textContent = t;
  });
  const linkGroup = add('g', {});
  const nodeGroup = add('g', {});
  const flows = [];
  sessions.forEach(s => {
    const out = [...sm.entries()].filter(([k]) => k.startsWith(s.key + '\u0001')).map(([k, n]) => ({ m: k.split('\u0001')[1], n }));
    out.sort((a, b) => byKey(methods, a.m).y - byKey(methods, b.m).y);
    let off = 0;
    out.forEach(f => { const m = byKey(methods, f.m); flows.push({ kind: 'sm', s, m, n: f.n, sOff: off, mOff: 0 }); off += f.n * scale; });
  });
  methods.forEach(m => {
    const inc = flows.filter(f => f.m === m && f.kind === 'sm').sort((a, b) => a.s.y - b.s.y);
    let off = 0; inc.forEach(f => { f.mOff = off; off += f.n * scale; });
  });
  const flows2 = [];
  methods.forEach(m => {
    const out = [...md.entries()].filter(([k]) => k.startsWith(m.key + '\u0001')).map(([k, n]) => ({ d: k.split('\u0001')[1], n }));
    out.sort((a, b) => byKey(datas, a.d).y - byKey(datas, b.d).y);
    let off = 0;
    out.forEach(f => { const d = byKey(datas, f.d); flows2.push({ kind: 'md', m, d, n: f.n, mOff: off, dOff: 0 }); off += f.n * scale; });
  });
  datas.forEach(d => {
    const inc = flows2.filter(f => f.d === d).sort((a, b) => a.m.y - b.m.y);
    let off = 0; inc.forEach(f => { f.dOff = off; off += f.n * scale; });
  });
  const path = (x0, y0, x1, y1, h) => {
    const c = (x1 - x0) * .5;
    return 'M' + x0 + ',' + y0 + 'C' + (x0 + c) + ',' + y0 + ' ' + (x1 - c) + ',' + y1 + ' ' + x1 + ',' + y1 +
      'L' + x1 + ',' + (y1 + h) + 'C' + (x1 - c) + ',' + (y1 + h) + ' ' + (x0 + c) + ',' + (y0 + h) + ' ' + x0 + ',' + (y0 + h) + 'Z';
  };
  flows.forEach(f => {
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', path(xs.s + NW, f.s.y + f.sOff, xs.m, f.m.y + f.mOff, f.n * scale));
    p.setAttribute('fill', f.m.color); p.setAttribute('fill-opacity', '.16');
    p.setAttribute('class', 'alluv-link');
    const title = document.createElementNS(ns, 'title');
    title.textContent = f.s.name + ' → ' + f.m.key + ' · ' + f.n;
    p.appendChild(title); linkGroup.appendChild(p);
  });
  flows2.forEach(f => {
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', path(xs.m + NW, f.m.y + f.mOff, xs.d, f.d.y + f.dOff, f.n * scale));
    p.setAttribute('fill', f.m.color); p.setAttribute('fill-opacity', '.12');
    p.setAttribute('class', 'alluv-link');
    const title = document.createElementNS(ns, 'title');
    title.textContent = f.m.key + ' → ' + f.d.key + ' · ' + f.n;
    p.appendChild(title); linkGroup.appendChild(p);
  });
  const node = (x, n, align, color, label) => {
    const r = document.createElementNS(ns, 'rect');
    r.setAttribute('x', x); r.setAttribute('y', n.y); r.setAttribute('width', NW); r.setAttribute('height', Math.max(2, n.h));
    r.setAttribute('fill', color); r.setAttribute('rx', 1); nodeGroup.appendChild(r);
    const t = document.createElementNS(ns, 'text');
    const tx = align === 'left' ? x - 8 : align === 'above' ? x + NW / 2 : x + NW + 8;
    const ty = align === 'above' ? n.y - 12 : n.y + Math.min(n.h, 18) / 2 + 3;
    t.setAttribute('x', tx); t.setAttribute('y', ty);
    t.setAttribute('text-anchor', align === 'left' ? 'end' : align === 'above' ? 'middle' : 'start');
    t.setAttribute('class', 'alluv-label');
    t.textContent = label + ' ' + n.count;
    nodeGroup.appendChild(t);
  };
  sessions.forEach(n => node(xs.s, n, 'left', '#25303d', n.label));
  methods.forEach(n => node(xs.m, n, 'above', n.color, n.label));
  datas.forEach(n => node(xs.d, n, 'right', '#25303d', n.label));
  const legend = $('#alluvLegend');
  if (legend) legend.innerHTML = methodDefs.map(d => '<span><i style="background:' + d.color + '"></i>' + d.label + '</span>').join('');
}

function openPaper(n){
  const p = ITEMS.find(i => i.n === n);
  if (!p) return;
  const dialog = $('#paperDialog');
  const content = $('#dialogContent');
  const doi = p.doi || `https://doi.org/10.5194/gstm2026-${p.n}`;
  const abs = p.text.split(/\n{2,}/).filter(Boolean).map(t => `<p>${esc(t)}</p>`).join('');
  content.innerHTML = `
    <div class="dlg-kicker"><b>GSTM2026-${p.n}</b><span>${p.session} · ${esc(p.sessionName)}</span><span>${p.type.toUpperCase()} · ${p.day} OCT</span></div>
    <h2 class="dlg-title">${esc(p.title)}</h2>
    <div class="dlg-authors">${esc(p.authors)}</div>
    <div class="dlg-abs">${abs || '<p>No abstract text available.</p>'}</div>
    <div class="dlg-aff">${esc((p.affiliations || []).join(' · '))}</div>
    <div class="dlg-foot">
      <a href="${doi}" target="_blank" rel="noopener">DOI · 10.5194/gstm2026-${p.n} ↗</a>
      <button id="copyCite" data-n="${p.n}">COPY CITATION</button>
    </div>`;
  if (typeof dialog.showModal === 'function') { if (!dialog.open) dialog.showModal(); }
  else dialog.setAttribute('open', '');
  document.body.classList.add('dialog-open');
  if (lenis) lenis.stop();
  content.scrollTop = 0;
  dialog.scrollTop = 0;
  requestAnimationFrame(() => { content.scrollTop = 0; });
  const copy = $('#copyCite');
  if (copy) copy.addEventListener('click', async () => {
    const cite = `${p.authors}: ${p.title}, GRACE/GRACE-FO Science Team Meeting 2026, Potsdam, Germany, 13–15 Oct 2026, GSTM2026-${p.n}, ${doi}, 2026.`;
    try { await navigator.clipboard.writeText(cite); copy.textContent = 'COPIED'; setTimeout(() => copy.textContent = 'COPY CITATION', 1600); } catch(e) {}
  });
}

$$('.chip[data-paper]').forEach(chip => chip.addEventListener('click', () => openPaper(+chip.dataset.paper)));

const dialog = $('#paperDialog');
function closePaper(){
  if (dialog.open) dialog.close();
  document.body.classList.remove('dialog-open');
  if (lenis) lenis.start();
}
$('#dialogClose').addEventListener('click', closePaper);
dialog.addEventListener('click', e => { if (e.target === dialog) closePaper(); });
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (lenis) lenis.start();
});
dialog.addEventListener('wheel', e => e.stopPropagation(), { passive: true });
dialog.addEventListener('touchmove', e => e.stopPropagation(), { passive: true });

renderAnatomy();
renderDomainMap();
renderAlluvial();

if (grid) {
  buildFilters();
  renderPapers();
  setExplorerFilter('all');
}
const searchInput = $('#searchInput');
if (searchInput) {
  let timer;
  searchInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.q = searchInput.value; state.shown = 24; renderPapers(); }, 120);
  });
}
$$('#typeToggle button').forEach(b => b.addEventListener('click', () => {
  $$('#typeToggle button').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  state.type = b.dataset.type; state.shown = 24; renderPapers();
}));
if (loadMore) loadMore.addEventListener('click', () => { state.shown += 24; renderPapers(); });

addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== searchInput) { e.preventDefault(); searchInput?.focus(); }
  if (e.key === 'Escape') closeMenu();
});

/* on-page type scale */
(() => {
  const base = () => matchMedia('(max-width:760px)').matches ? 18 : 19;
  let scale = 1;
  try { scale = clamp(parseFloat(localStorage.getItem('gstmFontScale')) || 1, .85, 1.4); } catch(e) {}
  const pct = $('#fontPct');
  const box = $('#typeControl');
  const handle = $('#typeHandle');
  handle?.addEventListener('click', e => {
    e.stopPropagation();
    const open = box.classList.toggle('open');
    handle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => {
    if (box && !box.contains(e.target)) { box.classList.remove('open'); handle?.setAttribute('aria-expanded','false'); }
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && box) { box.classList.remove('open'); handle?.setAttribute('aria-expanded','false'); }
  });
  const apply = () => {
    document.documentElement.style.fontSize = (base() * scale).toFixed(2) + 'px';
    if (pct) pct.textContent = Math.round(scale * 100) + '%';
  };
  const save = () => { try { localStorage.setItem('gstmFontScale', String(scale)); } catch(e) {} };
  $('#fontMinus')?.addEventListener('click', () => { scale = clamp(+(scale - .075).toFixed(3), .85, 1.4); apply(); save(); });
  $('#fontPlus')?.addEventListener('click', () => { scale = clamp(+(scale + .075).toFixed(3), .85, 1.4); apply(); save(); });
  addEventListener('resize', apply);
  apply();
})();

/* URL hash deep-link to a paper, e.g. #paper-58 */
function fromHash(){
  const m = location.hash.match(/^#paper-(\d+)$/);
  if (m) setTimeout(() => openPaper(+m[1]), 700);
}
addEventListener('hashchange', fromHash);
fromHash();
