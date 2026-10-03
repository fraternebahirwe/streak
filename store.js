// Habit data, saved in localStorage on this device.
const Store = (() => {
  const KEY = "streak.v1";
  const DEFAULTS = () => ({ habits: [], settings: { theme: "auto", reminder: { on: false, time: "20:00", lastSent: "" } } });

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && Array.isArray(s.habits)) {
        const d = DEFAULTS();
        return { habits: s.habits, settings: { ...d.settings, ...s.settings, reminder: { ...d.settings.reminder, ...(s.settings || {}).reminder } } };
      }
    } catch (e) { /* first run or storage blocked */ }
    return DEFAULTS();
  }

  let state = load();
  const listeners = [];

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked: keep running in memory */ }
    listeners.forEach(f => f());
  }
  const uid = () => Math.random().toString(36).slice(2, 10);
  const find = id => state.habits.find(h => h.id === id);

  return {
    get state() { return state; },
    onChange(f) { listeners.push(f); },
    habit: find,

    addHabit({ name, emoji, color, target }) {
      const h = { id: uid(), name, emoji, color, target, created: Stats.key(new Date()), days: {} };
      state.habits.push(h);
      save();
      return h;
    },
    updateHabit(id, patch) { const h = find(id); if (h) { Object.assign(h, patch); save(); } },
    removeHabit(id) {
      const i = state.habits.findIndex(h => h.id === id);
      if (i < 0) return null;
      const [h] = state.habits.splice(i, 1);
      save();
      return { habit: h, index: i };
    },
    restoreHabit({ habit, index }) { state.habits.splice(Math.min(index, state.habits.length), 0, habit); save(); },

    // returns true if the day is now done
    toggleDay(id, k) {
      const h = find(id);
      if (!h) return false;
      if (h.days[k]) delete h.days[k]; else h.days[k] = true;
      save();
      return !!h.days[k];
    },
    setSettings(patch) { state.settings = { ...state.settings, ...patch }; save(); },
    setReminder(patch) { state.settings.reminder = { ...state.settings.reminder, ...patch }; save(); },

    exportJSON() { return JSON.stringify({ app: "streak", version: 1, ...state }, null, 2); },
    importJSON(text) {
      const s = JSON.parse(text);
      if (!s || !Array.isArray(s.habits)) throw new Error("This file is not a Streak backup.");
      const clean = s.habits.filter(h => h && typeof h.name === "string" && h.days && typeof h.days === "object")
        .map(h => ({ id: String(h.id || uid()), name: h.name.slice(0, 60), emoji: h.emoji || "⭐", color: h.color || "#54a0ff",
                     target: Math.min(7, Math.max(1, Number(h.target) || 7)), created: h.created || Stats.key(new Date()), days: h.days }));
      state = { habits: clean, settings: { ...DEFAULTS().settings, ...(s.settings || {}) } };
      save();
      return clean.length;
    }
  };
})();
