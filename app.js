// Core UI: habit list, today's summary, toggling days. Other files add features onto App.
const App = (() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MILESTONES = [3, 7, 14, 30, 50, 100, 200, 365];
  const LETTERS = ["M", "T", "W", "T", "F", "S", "S"];
  const SUGGESTIONS = [
    { name: "Drink water", emoji: "💧", color: "#48dbfb" },
    { name: "Read 10 minutes", emoji: "📖", color: "#a55eea" },
    { name: "Move your body", emoji: "🏃", color: "#1dd1a1" },
    { name: "Sleep before 11", emoji: "😴", color: "#54a0ff" }
  ];

  const App = { $, esc, EMOJIS: [], COLORS: ["#ff6b6b", "#ff9f43", "#feca57", "#1dd1a1", "#48dbfb", "#54a0ff", "#a55eea", "#ff78c4"] };
  App.EMOJIS = ["💧", "📖", "🏃", "🧘", "🥗", "😴", "💪", "🎨", "🎸", "✍️", "🧹", "💊", "🦷", "🙏", "🌱", "💻",
                "🧠", "🚴", "🏊", "📵", "☕", "🍎", "🐕", "🎯", "📝", "🌞", "🧴", "🛏️", "💰", "📞", "🗣️", "⭐"];

  const todayKey = () => Stats.key(new Date());
  App.todayKey = todayKey;

  // ---------- toast ----------
  let toastTimer = null;
  App.toast = function (text, actionLabel, onAction, ms) {
    $("#toastText").textContent = text;
    const b = $("#toastAction");
    b.hidden = !actionLabel;
    b.textContent = actionLabel || "";
    b.onclick = () => { if (onAction) onAction(); $("#toast").hidden = true; };
    $("#toast").hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $("#toast").hidden = true; }, ms || 3500);
  };

  // ---------- rendering ----------
  function greeting() {
    const h = new Date().getHours();
    return (h < 5 ? "Still up" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening") + " 🔥";
  }

  function renderSummary(habits, k) {
    const el = $("#summary");
    if (!habits.length) { el.hidden = true; return; }
    el.hidden = false;
    const done = habits.filter(h => h.days[k]).length;
    const pct = Math.round(done / habits.length * 100);
    const msg = done === habits.length ? "All done today! 🎉" : done + " of " + habits.length + " done today";
    el.innerHTML = '<div class="line"><span>' + msg + "</span><span>" + pct + '%</span></div><div class="bar"><i style="width:' + pct + '%"></i></div>';
  }

  function habitCard(h, today, k) {
    const streak = Stats.currentStreak(h.days, today);
    const dots = Stats.weekDays(today).map((d, i) => {
      const dk = Stats.key(d);
      const future = d > today;
      return '<button class="dot' + (h.days[dk] ? " done" : "") + (dk === k ? " today" : "") + '" data-date="' + dk + '"' +
             (future ? " disabled" : "") + ' aria-label="' + dk + '">' + LETTERS[i] + "</button>";
    }).join("");
    return '<article class="habit' + (h.days[k] ? " done" : "") + '" data-id="' + h.id + '" style="--c:' + esc(h.color) + '">' +
      '<button class="check" aria-label="Mark ' + esc(h.name) + ' done today">✓</button>' +
      '<div class="info"><h3 role="button" tabindex="0">' + esc(h.emoji) + " " + esc(h.name) + '</h3><div class="week">' + dots + "</div></div>" +
      '<div class="streak">' + (streak ? "🔥 " + streak : "–") + "<small>" + (streak === 1 ? "day" : "days") + "</small></div></article>";
  }

  App.render = function () {
    const today = new Date(), k = Stats.key(today);
    const habits = Store.state.habits;
    $("#date").textContent = today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    $("#greeting").textContent = greeting();
    renderSummary(habits, k);
    const list = $("#list");
    if (!habits.length) {
      list.innerHTML = '<div class="empty-state"><div class="big">🌱</div><p>No habits yet. Start with one small thing.</p><div class="suggest">' +
        SUGGESTIONS.map((s, i) => '<button data-suggest="' + i + '">' + s.emoji + " " + s.name + "</button>").join("") + "</div></div>";
    } else {
      list.innerHTML = habits.map(h => habitCard(h, today, k)).join("");
    }
    if (App.refreshDetail) App.refreshDetail();
  };

  // ---------- actions ----------
  App.toggle = function (id, k) {
    const habits = Store.state.habits;
    const wasAllDone = habits.length > 0 && habits.every(h => h.days[todayKey()]);
    const done = Store.toggleDay(id, k);
    const h = Store.habit(id);
    if (!done || !h) return;
    if (k !== todayKey()) return;
    const streak = Stats.currentStreak(h.days, new Date());
    const allDone = habits.every(x => x.days[todayKey()]);
    if (allDone && !wasAllDone) { App.toast("All done today! 🎉"); if (App.confetti) App.confetti(); }
    else if (MILESTONES.includes(streak)) { App.toast(streak + "-day streak on " + h.name + "! 🔥"); if (App.confetti) App.confetti(); }
    else if (navigator.vibrate) navigator.vibrate(15);
  };

  $("#list").addEventListener("click", e => {
    const sug = e.target.closest("[data-suggest]");
    if (sug) { const s = SUGGESTIONS[sug.dataset.suggest]; Store.addHabit({ ...s, target: 7 }); return; }
    const card = e.target.closest(".habit");
    if (!card) return;
    const id = card.dataset.id;
    const dot = e.target.closest(".dot");
    if (dot) App.toggle(id, dot.dataset.date);
    else if (e.target.closest(".check")) App.toggle(id, todayKey());
    else if (e.target.closest(".info") && App.openDetail) App.openDetail(id);
  });
  $("#list").addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.matches("h3")) { const c = e.target.closest(".habit"); if (c && App.openDetail) App.openDetail(c.dataset.id); }
  });
  $("#addBtn").addEventListener("click", () => App.openEditor && App.openEditor());

  Store.onChange(() => App.render());

  // keep "today" correct after midnight or when the app returns to the foreground
  let shownDay = todayKey();
  function checkDay() { if (todayKey() !== shownDay) { shownDay = todayKey(); App.render(); } }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) { checkDay(); App.render(); } });
  setInterval(checkDay, 60000);

  return App;
})();
