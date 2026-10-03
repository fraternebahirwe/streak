// Full-screen detail view: stats, weekly goal and a 12-week heatmap you can tap to fix past days.
(function () {
  const { $, esc } = App;
  const el = $("#detail");
  let openId = null;

  function view(h) {
    const today = new Date(), k = Stats.key(today);
    const streak = Stats.currentStreak(h.days, today);
    const week = Stats.weekCount(h.days, today);
    const goalPct = Math.min(100, Math.round(week / h.target * 100));
    const cells = Stats.heatmap(h.days, today, 12).map(w => w.map(c =>
      '<button class="cell' + (c.done ? " done" : "") + (c.future ? " future" : "") + (c.key === k ? " today" : "") + '" data-date="' + c.key + '"' +
      (c.future ? " disabled" : "") + ' aria-label="' + c.key + (c.done ? " done" : "") + '"></button>').join("")).join("");
    return '<div class="bar-top"><button class="pill" id="dBack">← Back</button><button class="pill" id="dEdit">✏️ Edit</button></div>' +
      '<div class="title"><div class="big">' + esc(h.emoji) + "</div><h2>" + esc(h.name) + "</h2></div>" +
      '<div class="tiles">' +
        '<div class="tile"><b>🔥 ' + streak + "</b><span>Current streak</span></div>" +
        '<div class="tile"><b>🏆 ' + Math.max(streak, Stats.longestStreak(h.days)) + "</b><span>Best streak</span></div>" +
        '<div class="tile"><b>' + Stats.rate(h.days, today, h.created, 30) + "%</b><span>Last 30 days</span></div>" +
        '<div class="tile"><b>' + Stats.total(h.days) + "</b><span>Total check-ins</span></div></div>" +
      '<div class="panel"><div class="goal-row"><b>This week</b><span>' + week + " / " + h.target + ' days</span></div><div class="bar"><i style="width:' + goalPct + '%"></i></div>' +
        (week >= h.target ? '<p class="note">Weekly goal reached 🎯</p>' : "") + "</div>" +
      '<div class="panel" style="--c:' + esc(h.color) + '"><h4>Last 12 weeks</h4><div class="heat" style="--c:' + esc(h.color) + '">' + cells + '</div><p class="note">Tap a square to add or remove a day.</p></div>';
  }

  // numbers roll up from 0 when the detail view opens
  function countUp(node) {
    if (!el.classList.contains("fresh")) return;
    const m = node.textContent.match(/^(\D*)(\d+)(.*)$/);
    if (!m) return;
    const to = Number(m[2]), start = performance.now();
    (function step(now) {
      const t = Math.min(1, (now - start) / 600);
      node.textContent = m[1] + Math.round(to * (1 - Math.pow(1 - t, 3))) + m[3];
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }

  function paint() {
    const h = openId && Store.habit(openId);
    if (!h) { el.hidden = true; openId = null; return; }
    const scroll = el.scrollTop;
    const fresh = el.dataset.open !== h.id;
    el.dataset.open = h.id;
    el.innerHTML = view(h);
    el.scrollTop = scroll;
    el.classList.toggle("fresh", fresh);
    el.querySelectorAll(".tile b").forEach(countUp);
  }

  App.openDetail = id => { openId = id; el.hidden = false; paint(); el.scrollTop = 0; };
  App.closeDetail = () => { openId = null; el.hidden = true; el.dataset.open = ""; };
  App.refreshDetail = () => { if (openId) paint(); };

  el.addEventListener("click", e => {
    if (e.target.closest("#dBack")) return App.closeDetail();
    if (e.target.closest("#dEdit")) return App.openEditor(openId);
    const cell = e.target.closest(".cell");
    if (cell) App.toggle(openId, cell.dataset.date);
  });
  window.addEventListener("keydown", e => { if (e.key === "Escape" && openId && !document.querySelector("dialog[open]")) App.closeDetail(); });
})();
