// A small hand-written confetti effect: colored paper pieces fall for about 2 seconds.

window.confetti = function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.className = "confetti";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const colors = ["#b3261e", "#e0a526", "#2e7d32", "#1e5bb3", "#22201c"];

  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.5,
    w: 6 + Math.random() * 6,
    h: 8 + Math.random() * 8,
    speed: 3 + Math.random() * 4,
    drift: -1.5 + Math.random() * 3,
    spin: Math.random() * Math.PI,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  const start = performance.now();
  function frame(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      p.y += p.speed;
      p.x += p.drift;
      p.spin += 0.1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.cos(p.spin));
      ctx.restore();
    }
    if (now - start < 2000) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
};
