/* ================================================
   SCRIPT.JS — Clean & Clear Presentation
   ================================================ */

// ── LOADER ──────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    AOS.init({ duration: 650, once: true, easing: 'ease-out-cubic', offset: 70 });
    initParticles();
    initCharts();
    initMemoryBars();
    initChallengeBars();
  }, 2000);
});

// ── SCROLL PROGRESS ──────────────────────────────
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  document.getElementById('progress-bar').style.width = pct + '%';
  updateNav();
});

// ── SIDE NAV ─────────────────────────────────────
function updateNav() {
  const mid = window.scrollY + window.innerHeight / 2;
  document.querySelectorAll('.slide').forEach((s, i) => {
    const dot = document.querySelectorAll('.nav-dot')[i];
    if (dot && mid >= s.offsetTop && mid < s.offsetTop + s.offsetHeight) {
      document.querySelectorAll('.nav-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    }
  });
}
document.querySelectorAll('.nav-dot').forEach((d, i) => {
  d.addEventListener('click', () => {
    document.getElementById('slide-' + i)?.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── PARTICLES ────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, pts;
  const mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); build(); });

  function build() {
    const n = Math.floor(W * H / 11000);
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      r: Math.random() * 1.4 + .5,
      a: Math.random() * .45 + .15,
      c: Math.random() > .5 ? '#00c8f8' : '#7c3aed'
    }));
  }
  build();

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });

  (function frame() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach((p, i) => {
      // connections
      for (let j = i + 1; j < pts.length; j++) {
        const dx = p.x - pts[j].x, dy = p.y - pts[j].y;
        const d = Math.hypot(dx, dy);
        if (d < 110) {
          ctx.strokeStyle = `rgba(0,200,248,${(1 - d / 110) * .1})`;
          ctx.lineWidth = .5;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
      // mouse repel
      const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (md < 90) { p.vx += (p.x - mouse.x) / md * .25; p.vy += (p.y - mouse.y) / md * .25; }
      // draw
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill(); ctx.globalAlpha = 1;
      // move + dampen
      p.x += p.vx; p.y += p.vy; p.vx *= .991; p.vy *= .991;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
    requestAnimationFrame(frame);
  })();
}

// ── CPU TOOLTIPS ─────────────────────────────────
document.querySelectorAll('[data-tip]').forEach(el => {
  const tip = document.getElementById('cpu-tooltip');
  el.addEventListener('mouseenter', () => { tip.textContent = el.dataset.tip; tip.style.opacity = '1'; });
  el.addEventListener('mousemove', e => { tip.style.left = (e.clientX + 14) + 'px'; tip.style.top = (e.clientY - 10) + 'px'; });
  el.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
});

// ── COMPARISON TOGGLE ────────────────────────────
function showView(type) {
  const tbl = document.getElementById('comparison-table');
  const crd = document.getElementById('comparison-cards');
  const tBtn = document.getElementById('table-btn');
  const cBtn = document.getElementById('cards-btn');
  if (type === 'table') {
    tbl.classList.remove('hidden'); crd.classList.add('hidden');
    tBtn.classList.add('active'); cBtn.classList.remove('active');
  } else {
    tbl.classList.add('hidden'); crd.classList.remove('hidden');
    cBtn.classList.add('active'); tBtn.classList.remove('active');
  }
}

// ── CHARTS ───────────────────────────────────────
const BASE = {
  plugins: {
    legend: { labels: { color: '#7a8caa', font: { family: 'Exo 2', size: 12 }, padding: 16 } },
    tooltip: { backgroundColor: 'rgba(9,16,31,.95)', titleFont: { family: 'Orbitron', size: 11 }, bodyFont: { family: 'Exo 2', size: 12 }, borderColor: 'rgba(0,200,248,.3)', borderWidth: 1 }
  },
  scales: {
    x: { ticks: { color: '#7a8caa', font: { family: 'Exo 2', size: 12 } }, grid: { color: 'rgba(255,255,255,.04)' } },
    y: { ticks: { color: '#7a8caa', font: { family: 'Exo 2', size: 12 } }, grid: { color: 'rgba(255,255,255,.04)' } }
  },
  animation: { duration: 1400, easing: 'easeOutQuart' },
  responsive: true, maintainAspectRatio: true
};

function bar(id, labels, d32, d64, unit) {
  new Chart(document.getElementById(id), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: '32-bit', data: d32, backgroundColor: 'rgba(30,90,150,.7)', borderColor: '#5ab4f0', borderWidth: 2, borderRadius: 7 },
        { label: '64-bit', data: d64, backgroundColor: 'rgba(0,200,248,.45)', borderColor: '#00c8f8', borderWidth: 2, borderRadius: 7 }
      ]
    },
    options: {
      ...BASE,
      plugins: { ...BASE.plugins, tooltip: { ...BASE.plugins.tooltip, callbacks: { label: c => c.dataset.label + ': ' + c.raw + ' ' + unit } } }
    }
  });
}

function initCharts() {
  // Performance: FPS
  bar('chart-fps', ['Video Rendering'], [45], [75], 'FPS');

  // Performance: DB Query (lower is better, so we flip colors visually with a note)
  new Chart(document.getElementById('chart-db'), {
    type: 'bar',
    data: {
      labels: ['Query Time (seconds)'],
      datasets: [
        { label: '32-bit', data: [12], backgroundColor: 'rgba(244,63,142,.45)', borderColor: '#f43f8e', borderWidth: 2, borderRadius: 7 },
        { label: '64-bit', data: [7],  backgroundColor: 'rgba(6,255,212,.35)',  borderColor: '#06ffd4', borderWidth: 2, borderRadius: 7 }
      ]
    },
    options: { ...BASE, plugins: { ...BASE.plugins, tooltip: { ...BASE.plugins.tooltip, callbacks: { label: c => c.dataset.label + ': ' + c.raw + ' sec' } } } }
  });

  // Performance: Compression
  bar('chart-compress', ['File Compression'], [80], [140], 'MB/s');

  // Memory speed
  new Chart(document.getElementById('chart-memspeed'), {
    type: 'bar',
    data: {
      labels: ['Memory Read', 'Memory Write'],
      datasets: [
        { label: '32-bit', data: [8, 6],   backgroundColor: 'rgba(30,90,150,.7)',  borderColor: '#5ab4f0', borderWidth: 2, borderRadius: 7 },
        { label: '64-bit', data: [14, 12], backgroundColor: 'rgba(0,200,248,.45)', borderColor: '#00c8f8', borderWidth: 2, borderRadius: 7 }
      ]
    },
    options: { ...BASE, plugins: { ...BASE.plugins, tooltip: { ...BASE.plugins.tooltip, callbacks: { label: c => c.dataset.label + ': ' + c.raw + ' GB/s' } } } }
  });

  // Boot time
  new Chart(document.getElementById('chart-boot'), {
    type: 'bar',
    data: {
      labels: ['Boot Time'],
      datasets: [
        { label: '32-bit', data: [45], backgroundColor: 'rgba(244,63,142,.45)', borderColor: '#f43f8e', borderWidth: 2, borderRadius: 7 },
        { label: '64-bit', data: [30], backgroundColor: 'rgba(6,255,212,.35)',  borderColor: '#06ffd4', borderWidth: 2, borderRadius: 7 }
      ]
    },
    options: { ...BASE, plugins: { ...BASE.plugins, tooltip: { ...BASE.plugins.tooltip, callbacks: { label: c => c.dataset.label + ': ' + c.raw + ' sec' } } } }
  });
}

// ── MEMORY BARS ──────────────────────────────────
function initMemoryBars() {
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      document.getElementById('fill32')?.classList.add('go');
      document.getElementById('fill64')?.classList.add('go');
      obs.disconnect();
    }
  }, { threshold: .3 });
  const section = document.getElementById('slide-5');
  if (section) obs.observe(section);
}

// ── CHALLENGE PROGRESS BARS ──────────────────────
function initChallengeBars() {
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      document.querySelectorAll('.ch-fill').forEach(el => {
        const target = el.style.width;
        el.style.width = '0';
        requestAnimationFrame(() => requestAnimationFrame(() => { el.style.width = target; }));
      });
      obs.disconnect();
    }
  }, { threshold: .2 });
  const section = document.getElementById('slide-8');
  if (section) obs.observe(section);
}

// ── TABLE ROW ANIMATION ──────────────────────────
new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    document.querySelectorAll('.comp-table tbody tr').forEach((tr, i) => {
      tr.style.opacity = '0'; tr.style.transform = 'translateX(-18px)';
      tr.style.transition = `all .4s ease ${i * .07}s`;
      setTimeout(() => { tr.style.opacity = '1'; tr.style.transform = 'none'; }, 80 + i * 70);
    });
  }
}, { threshold: .25 }).observe(document.getElementById('comparison-table') || document.body);

// ── SMOOTH ANCHORS ───────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── KEYBOARD NAV ─────────────────────────────────
let cur = 0;
const slides = Array.from(document.querySelectorAll('.slide'));
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') cur = Math.min(cur + 1, slides.length - 1);
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   cur = Math.max(cur - 1, 0);
  slides[cur].scrollIntoView({ behavior: 'smooth' });
});

// ── DOTS LOADER ANIM ─────────────────────────────
(function () {
  const d = document.querySelector('.dots');
  if (!d) return;
  const f = ['.', '..', '...'];
  let i = 0;
  setInterval(() => { d.textContent = f[i++ % f.length]; }, 450);
})();

// ── THANK YOU CANVAS (reuse particle logic) ──────
window.addEventListener('load', () => {
  const tyCanvas = document.getElementById('ty-canvas');
  if (!tyCanvas) return;
  const ctx2 = tyCanvas.getContext('2d');
  let W2, H2, pts2;

  function resize2() { W2 = tyCanvas.width = tyCanvas.offsetWidth; H2 = tyCanvas.height = tyCanvas.offsetHeight; }
  resize2();
  window.addEventListener('resize', () => { resize2(); build2(); });

  function build2() {
    const n = Math.floor(W2 * H2 / 14000);
    pts2 = Array.from({ length: n }, () => ({
      x: Math.random() * W2, y: Math.random() * H2,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      r: Math.random() * 1.3 + .4, a: Math.random() * .4 + .1,
      c: ['#00c8f8','#7c3aed','#f43f8e'][Math.floor(Math.random()*3)]
    }));
  }
  build2();

  (function frame2() {
    ctx2.clearRect(0, 0, W2, H2);
    pts2.forEach((p, i) => {
      for (let j = i + 1; j < pts2.length; j++) {
        const d = Math.hypot(p.x - pts2[j].x, p.y - pts2[j].y);
        if (d < 100) { ctx2.strokeStyle = `rgba(244,63,142,${(1-d/100)*.08})`; ctx2.lineWidth = .5; ctx2.beginPath(); ctx2.moveTo(p.x,p.y); ctx2.lineTo(pts2[j].x,pts2[j].y); ctx2.stroke(); }
      }
      ctx2.beginPath(); ctx2.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx2.fillStyle = p.c; ctx2.globalAlpha = p.a; ctx2.fill(); ctx2.globalAlpha = 1;
      p.x += p.vx; p.y += p.vy; p.vx *= .992; p.vy *= .992;
      if (p.x < 0 || p.x > W2) p.vx *= -1;
      if (p.y < 0 || p.y > H2) p.vy *= -1;
    });
    requestAnimationFrame(frame2);
  })();
});