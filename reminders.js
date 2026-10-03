// Daily reminder: checks each 30 s and notifies once per day, only if habits are still unfinished.
(function () {
  function notify(title, body) {
    const opts = { body, icon: "icon-192.png", tag: "streak-daily" };
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(reg => reg.showNotification(title, opts)).catch(() => new Notification(title, opts));
    } else new Notification(title, opts);
  }

  function check() {
    const r = Store.state.settings.reminder;
    if (!r.on || !("Notification" in window) || Notification.permission !== "granted") return;
    const now = new Date(), k = App.todayKey();
    const hm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    if (hm < r.time || r.lastSent === k) return;
    Store.setReminder({ lastSent: k });
    const pending = Store.state.habits.filter(h => !h.days[k]);
    if (!pending.length) return;
    notify("Keep your streak alive 🔥", pending.slice(0, 3).map(h => h.emoji + " " + h.name).join(", ") + (pending.length > 3 ? " and " + (pending.length - 3) + " more" : ""));
  }

  setInterval(check, 30000);
  check();
})();
