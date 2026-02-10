// ===== Password Gate =====
function gateInit(){
  const gate = document.getElementById('gate');
  const app = document.getElementById('app');
  const pw = document.getElementById('pw');
  const unlockBtn = document.getElementById('unlockBtn');
  const hintBtn = document.getElementById('hintBtn');
  const hint = document.getElementById('hint');
  const msg = document.getElementById('gateMsg');

  if (!gate || !app) return;

  // CHANGE THIS PASSWORD:
  const PASSWORD = "Elephant"; // example: Feb 11 = 1102? use what you want

  const unlocked = localStorage.getItem('unlocked') === '1';
  if (unlocked){
    gate.style.display = 'none';
    app.style.display = '';
    return;
  }

  function tryUnlock(){
    const entered = (pw.value || "").trim();
    if (entered === PASSWORD){
      localStorage.setItem('unlocked', '1');
      gate.style.display = 'none';
      app.style.display = '';
      msg.textContent = "";

      // Optional: start music after unlock if user had it ON
      const audio = document.getElementById('bgm');
      const musicOn = localStorage.getItem('musicOn') === '1';
      if (audio && musicOn){
        audio.play().catch(() => {});
      }
    } else {
      msg.textContent = "Wrong password 🙂 Try again.";
      pw.value = "";
      pw.focus();
    }
  }

  unlockBtn.addEventListener('click', tryUnlock);
  pw.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });
  hintBtn.addEventListener('click', () => {
    hint.style.display = (hint.style.display === 'none') ? '' : 'none';
  });
}



// ===== Utilities =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ===== Typewriter (Home title) =====
function typewriter(){
  const el = $('[data-typewriter]');
  if (!el) return;

  const text = el.textContent.trim();
  el.textContent = "";
  const span = document.createElement("span");
  span.className = "type";
  el.appendChild(span);

  let i = 0;
  const tick = () => {
    span.textContent = text.slice(0, i++);
    if (i <= text.length) requestAnimationFrame(tick);
  };
  tick();
}

// ===== Music toggle (loop + remember) =====
function musicInit(){
  const audio = $('#bgm');
  const btn = $('#musicBtn');
  if (!audio || !btn) return;

  const label = btn.querySelector('.label');

  const setUI = (on) => {
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    label.textContent = on ? 'Music: On' : 'Music: Off';
  };

  const saved = localStorage.getItem('musicOn') === '1';
  setUI(saved);

  if (saved){
    audio.volume = 0.8;
    audio.play().catch(() => { /* needs user gesture */ });
  }

  btn.addEventListener('click', async () => {
    const on = !(localStorage.getItem('musicOn') === '1');
    localStorage.setItem('musicOn', on ? '1' : '0');
    setUI(on);

    if (on){
      audio.volume = 0.8;
      try { await audio.play(); } catch (e) {}
    } else {
      audio.pause();
    }
  });
}

// ===== Dense, slow floaties (A2 mix) =====
function floatiesInit(){
  const host = $('#bg-floaties');
  if (!host) return;

  host.innerHTML = "";

  // A2 mix: petals + hearts + sparkles
  const glyphs = ["🌸","🌷","💗","💖","✨","💐","🌺","🌼","💕","✨"];
  const COUNT = 400; // denser

  const rand = (a,b) => a + Math.random()*(b-a);

  for (let i=0; i<COUNT; i++){
    const el = document.createElement('span');
    el.className = 'floaty';
    el.textContent = glyphs[Math.floor(Math.random()*glyphs.length)];

    const x = rand(0, 100).toFixed(2) + "vw";
    const dx = "0vw";
   const sway = "0px";
    const o = rand(0.35, 0.95).toFixed(2);

    // Much slower
    const dur = rand(20, 50).toFixed(2) + "s";
    const delay = rand(-55, 0).toFixed(2) + "s"; // pre-fill the screen
    const size = rand(12, 22).toFixed(0) + "px";

    el.style.setProperty('--x', x);
    el.style.setProperty('--dx', dx);
    el.style.setProperty('--sway', sway);
    el.style.setProperty('--o', o);
    el.style.fontSize = size;

    el.style.animationDuration = `${dur}, ${rand(4,10).toFixed(2)}s, ${rand(6,14).toFixed(2)}s`;
    el.style.animationDelay = `${delay}, ${rand(-10,0).toFixed(2)}s, ${rand(-14,0).toFixed(2)}s`;

    host.appendChild(el);
  }
}

// ===== Constellation background =====
function constellationInit(){
  const canvas = $('#constellation');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, points;

  const resize = () => {
    W = canvas.width = window.innerWidth * devicePixelRatio;
    H = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    const N = Math.floor((window.innerWidth * window.innerHeight) / 28000);
    points = Array.from({length: Math.max(30, N)}, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.25 * devicePixelRatio
    }));
  };

  const step = () => {
    ctx.clearRect(0,0,W,H);

    // points
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    for (const p of points){
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2 * devicePixelRatio, 0, Math.PI*2);
      ctx.fill();
    }

    // connections
    for (let i=0; i<points.length; i++){
      for (let j=i+1; j<points.length; j++){
        const a = points[i], b = points[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx*dx + dy*dy;
        const max = (160*devicePixelRatio) ** 2;
        if (d2 < max){
          const alpha = 0.18 * (1 - d2/max);
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 1 * devicePixelRatio;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  };

  window.addEventListener('resize', resize);
  resize();
  step();
}

// ===== Carousel logic (no autoplay, hide controls if 1 slide) =====
function initCarousels(){
  const carousels = $$('.carousel');

  carousels.forEach((carousel) => {
    const track = $('.carouselTrack', carousel);
    const slides = $$('.slide', carousel);
    const prev = $('[data-prev]', carousel);
    const next = $('[data-next]', carousel);
    const dotsWrap = $('.dots', carousel);
    const nav = $('.carouselNav', carousel);

    if (!track || slides.length === 0) return;

    // set blurred background per slide
    slides.forEach(slide => {
      const img = $('img', slide);
      const frame = $('.imgFrame', slide);
      if (img && frame){
        frame.style.setProperty('--bg', `url("${img.getAttribute('src')}")`);
      }
    });

    let idx = 0;
    let x0 = null;

    const renderDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.className = 'dotBtn' + (i === idx ? ' active' : '');
        b.type = 'button';
        b.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(b);
      });
    };

    const goTo = (i) => {
      idx = (i + slides.length) % slides.length;
      track.style.transform = `translateX(${-idx * 100}%)`;
      if (dotsWrap){
        [...dotsWrap.children].forEach((d, k) => d.classList.toggle('active', k === idx));
      }
    };

    const step = (dir) => goTo(idx + dir);

    if (prev) prev.addEventListener('click', () => step(-1));
    if (next) next.addEventListener('click', () => step(1));

    // swipe
    track.addEventListener('pointerdown', (e) => {
      x0 = e.clientX;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    });

    // hide controls if single slide
    if (slides.length < 2){
      if (nav) nav.style.display = 'none';
      if (dotsWrap) dotsWrap.style.display = 'none';
    } else {
      renderDots();
    }

    goTo(0);
  });
}

// allow index.html to refresh visible scene carousels
window.refreshCarousels = () => initCarousels();

// ===== Init =====
window.addEventListener('load', () => {
   gateInit();
  typewriter();
  musicInit();
  floatiesInit();
  constellationInit();
  initCarousels();
});




