// Slowly drifting "molecule" network behind the intro: atoms joined by bonds when close.
(() => {
  const canvas = document.querySelector('.bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const BOND = 120;
  let atoms = [], w = 0, h = 0, color = '', visible = true, frame = 0;

  function readColor() {
    color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#2f5d73';
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, Math.max(28, (w * h) / 14000)));
    atoms = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: 1.5 + Math.random() * 2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    for (let i = 0; i < atoms.length; i++) {
      const a = atoms[i];
      for (let j = i + 1; j < atoms.length; j++) {
        const b = atoms[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < BOND) {
          ctx.globalAlpha = 0.28 * (1 - d / BOND);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 0.45;
    for (const a of atoms) {
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function step() {
    for (const a of atoms) {
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < 0 || a.x > w) a.vx *= -1;
      if (a.y < 0 || a.y > h) a.vy *= -1;
    }
    draw();
    frame = visible && !reduceMotion.matches ? requestAnimationFrame(step) : 0;
  }

  function start() {
    cancelAnimationFrame(frame);
    if (reduceMotion.matches) draw();
    else frame = requestAnimationFrame(step);
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && !document.hidden;
    if (visible && !frame) start();
  }).observe(canvas);

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible && !frame) start();
  });

  dark.addEventListener('change', () => { readColor(); draw(); });
  reduceMotion.addEventListener('change', start);
  addEventListener('resize', () => { resize(); draw(); });

  readColor();
  resize();
  start();
})();
