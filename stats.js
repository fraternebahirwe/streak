// Pure date and streak maths. Works in the browser (window.Stats) and in Node (tests).
(function (root) {
  const pad = n => String(n).padStart(2, "0");

  function key(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(k) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function weekStart(d) { return addDays(d, -((d.getDay() + 6) % 7)); } // Monday

  // Consecutive done days ending today. If today is not done yet the streak is still alive (ends yesterday).
  function currentStreak(days, today) {
    let d = today;
    if (!days[key(d)]) d = addDays(d, -1);
    let n = 0;
    while (days[key(d)]) { n++; d = addDays(d, -1); }
    return n;
  }

  function longestStreak(days) {
    const keys = Object.keys(days).filter(k => days[k]).sort();
    let best = 0, run = 0, prev = null;
    for (const k of keys) {
      run = prev && key(addDays(prev, 1)) === k ? run + 1 : 1;
      best = Math.max(best, run);
      prev = parse(k);
    }
    return best;
  }

  function weekDays(today) { const s = weekStart(today); return Array.from({ length: 7 }, (_, i) => addDays(s, i)); }
  function weekCount(days, today) { return weekDays(today).filter(d => days[key(d)]).length; }
  function total(days) { return Object.values(days).filter(Boolean).length; }

  // Percent of days done over the last `span` days (or since the habit was created, if newer).
  function rate(days, today, created, span) {
    span = span || 30;
    const windowStart = addDays(today, -(span - 1));
    const start = parse(created) > windowStart ? parse(created) : windowStart;
    let count = 0, done = 0;
    for (let d = start; d <= today; d = addDays(d, 1)) { count++; if (days[key(d)]) done++; }
    return count ? Math.round(done / count * 100) : 0;
  }

  // Columns of 7 cells (Mon..Sun), oldest week first, ending with the current week.
  function heatmap(days, today, weeks) {
    weeks = weeks || 12;
    const first = addDays(weekStart(today), -7 * (weeks - 1));
    return Array.from({ length: weeks }, (_, w) =>
      Array.from({ length: 7 }, (_, i) => {
        const d = addDays(first, w * 7 + i);
        return { key: key(d), done: !!days[key(d)], future: d > today, date: d };
      }));
  }

  const api = { key, parse, addDays, weekStart, weekDays, currentStreak, longestStreak, weekCount, total, rate, heatmap };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Stats = api;
})(typeof window !== "undefined" ? window : globalThis);
