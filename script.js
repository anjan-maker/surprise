(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===== Scroll reveal (storybook) =====
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("show");
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  // ===== Typewriter =====
  const tw = document.querySelectorAll("[data-typewriter]");
  tw.forEach(el => {
    const full = el.textContent.trim();
    el.textContent = "";
    const span = document.createElement("span");
    span.className = "type";
    el.appendChild(span);

    if (reduceMotion) { span.textContent = full; span.classList.remove("type"); return; }

    let i = 0;
    const tick = () => {
      i += 1;
      span.textContent = full.slice(0, i);
      if (i < full.length) setTimeout(tick, 22);
      else span.classList.remove("type");
    };
    setTimeout(tick, 250);
  });

  // ===== Floating hearts/petals =====
  const EMOJIS = ["💗","💖","💘","🌸","🌺","🌷","✨","💞","🪷"];
  const bg = document.getElementById("bg-floaties");

  if (bg && !reduceMotion) {
    const COUNT = 140;
    const rand = (a, b) => a + Math.random() * (b - a);

    for (let i = 0; i < COUNT; i++) {
      const s = document.createElement("span");
      s.className = "floaty";
      s.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

      const x = rand(0, 100);
      s.style.setProperty("--x", `${x}vw`);
      s.style.setProperty("--dx", `${rand(-10, 10)}vw`);
      s.style.setProperty("--sway", `${rand(-16, 16)}px`);
      s.style.setProperty("--o", `${rand(0.25, 0.85)}`);

      const size = rand(14, 26);
      s.style.fontSize = `${size}px`;

      const durFall = rand(9, 18);
      const durSway = rand(2.6, 6.2);
      const durSpin = rand(3.5, 9.5);

      s.style.animationDuration = `${durFall}s, ${durSway}s, ${durSpin}s`;
      s.style.animationDelay = `${rand(-durFall, 0)}s, ${rand(-durSway, 0)}s, ${rand(-durSpin, 0)}s`;

      bg.appendChild(s);
    }
  }

  // ===== Constellation background (canvas) =====
  const canvas = document.getElementById("constellation");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, pts;

    const rand = (a, b) => a + Math.random() * (b - a);
    const resize = () => {
      w = canvas.width = Math.floor(window.innerWidth * (window.devicePixelRatio || 1));
      h = canvas.height = Math.floor(window.innerHeight * (window.devicePixelRatio || 1));
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      const count = Math.floor(Math.min(140, Math.max(70, (window.innerWidth * window.innerHeight) / 14000)));
      pts = new Array(count).fill(0).map(() => ({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-0.32, 0.32) * (window.devicePixelRatio || 1),
        vy: rand(-0.32, 0.32) * (window.devicePixelRatio || 1),
        r: rand(0.8, 1.9) * (window.devicePixelRatio || 1)
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // dots
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx*dx + dy*dy;
          const max = (150 * (window.devicePixelRatio || 1));
          const max2 = max * max;
          if (d2 < max2) {
            const t = 1 - (d2 / max2);
            ctx.strokeStyle = `rgba(255,105,180,${0.12 * t})`;
            ctx.lineWidth = 1 * (window.devicePixelRatio || 1);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // move
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
  }

  // ===== Music toggle (persists) =====
  const audio = document.getElementById("bgm");
  const btn = document.getElementById("musicBtn");

  if (audio && btn) {
    // gentle defaults
    audio.loop = true;
    audio.volume = 0.30;

    const KEY = "ramya_bgm_on";
    const saved = localStorage.getItem(KEY);
    const shouldPlay = saved === "1"; // only autoplay if user previously enabled

    const setUI = (on) => {
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.querySelector(".label").textContent = on ? "Music: On" : "Music: Off";
    };

    const tryPlay = async () => {
      try {
        await audio.play();
        setUI(true);
        localStorage.setItem(KEY, "1");
      } catch {
        // autoplay blocked until a user gesture; keep UI off
        setUI(false);
        localStorage.setItem(KEY, "0");
      }
    };

    const stop = () => {
      audio.pause();
      audio.currentTime = 0;
      setUI(false);
      localStorage.setItem(KEY, "0");
    };

    btn.addEventListener("click", async () => {
      if (audio.paused) await tryPlay();
      else stop();
    });

    // restore preference
    if (shouldPlay) {
      // attempt; if blocked, user can press button
      tryPlay();
    } else {
      setUI(false);
    }
  }
})();

