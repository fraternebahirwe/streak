// Settings sheet: theme, reminder switch, backup export and import.
(function () {
  const { $ } = App;
  const dialog = $("#settingsDialog");

  function applyTheme() {
    const t = Store.state.settings.theme;
    if (t === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", t);
  }
  App.applyTheme = applyTheme;
  applyTheme();

  function paintReminderNote() {
    const note = $("#sRemindNote");
    if (!("Notification" in window)) note.textContent = "This browser does not support notifications.";
    else if (Notification.permission === "denied") note.textContent = "Notifications are blocked. Allow them in your browser settings to get reminders.";
    else note.textContent = "Reminders appear while Streak is open or installed and running. They list habits you have not done yet.";
  }

  $("#settingsBtn").addEventListener("click", () => {
    const s = Store.state.settings;
    $("#sTheme").value = s.theme;
    $("#sRemind").checked = !!s.reminder.on;
    $("#sTime").value = s.reminder.time;
    paintReminderNote();
    dialog.showModal();
  });
  $("#sClose").addEventListener("click", () => dialog.close());

  $("#sTheme").addEventListener("change", e => { Store.setSettings({ theme: e.target.value }); applyTheme(); });
  $("#sTime").addEventListener("change", e => { if (e.target.value) Store.setReminder({ time: e.target.value, lastSent: "" }); });
  $("#sRemind").addEventListener("change", async e => {
    if (e.target.checked) {
      if (!("Notification" in window)) { e.target.checked = false; return paintReminderNote(); }
      const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
      if (perm !== "granted") { e.target.checked = false; Store.setReminder({ on: false }); return paintReminderNote(); }
    }
    Store.setReminder({ on: e.target.checked, lastSent: "" });
    paintReminderNote();
  });

  $("#sExport").addEventListener("click", () => {
    const blob = new Blob([Store.exportJSON()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "streak-backup-" + App.todayKey() + ".json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  $("#sImport").addEventListener("click", () => $("#sFile").click());
  $("#sFile").addEventListener("change", async e => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!confirm("Replace your current habits with this backup?")) return;
    try {
      const n = Store.importJSON(await file.text());
      App.applyTheme();
      dialog.close();
      App.toast("Imported " + n + " habit" + (n === 1 ? "" : "s"));
    } catch (err) {
      App.toast("Could not import: " + err.message);
    }
  });
})();
