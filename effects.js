// Confetti burst for milestones and finishing every habit.
(function () {
  const canvas = App.$("#confetti");
  const ctx = canvas.getContext("2d");
  const COLORS = ["#ff6b6b", "#ff9f43", "#feca57", "#1dd1a1", "#48dbfb", "#a55eea", "#ff78c4"];
  const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pieces = [], running = false;

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.vy += 0.18; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40));
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    });
    pieces = pieces.filter(p => p.life > 0 && p.y < canvas.height + 20);
    if (pieces.length) requestAnimationFrame(frame);
    else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  App.confetti = function () {
    if (reduced) return;
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    const s = devicePixelRatio;
    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: canvas.width / 2, y: canvas.height * 0.62,
        vx: (Math.random() - 0.5) * 14 * s, vy: (-Math.random() * 13 - 5) * s,
        size: (6 + Math.random() * 8) * s, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        color: COLORS[i % COLORS.length], life: 90 + Math.random() * 60
      });
    }
    if (!running) { running = true; requestAnimationFrame(frame); }
  };
})();
