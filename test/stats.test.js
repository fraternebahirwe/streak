const test = require("node:test");
const assert = require("node:assert");
const S = require("../stats.js");

const d = (y, m, day) => new Date(y, m - 1, day);
const days = (...keys) => Object.fromEntries(keys.map(k => [k, true]));

test("key and parse round-trip", () => {
  assert.strictEqual(S.key(d(2026, 3, 5)), "2026-03-05");
  assert.strictEqual(S.key(S.parse("2026-12-31")), "2026-12-31");
});

test("addDays crosses month and year", () => {
  assert.strictEqual(S.key(S.addDays(d(2026, 12, 31), 1)), "2027-01-01");
  assert.strictEqual(S.key(S.addDays(d(2026, 3, 1), -1)), "2026-02-28");
});

test("currentStreak counts back from today", () => {
  const h = days("2026-10-01", "2026-10-02", "2026-10-03");
  assert.strictEqual(S.currentStreak(h, d(2026, 10, 3)), 3);
});

test("currentStreak stays alive when today is not done yet", () => {
  const h = days("2026-10-01", "2026-10-02");
  assert.strictEqual(S.currentStreak(h, d(2026, 10, 3)), 2);
});

test("currentStreak is broken after a missed day", () => {
  const h = days("2026-10-01");
  assert.strictEqual(S.currentStreak(h, d(2026, 10, 3)), 0);
});

test("longestStreak finds the best run", () => {
  const h = days("2026-09-01", "2026-09-02", "2026-09-04", "2026-09-05", "2026-09-06", "2026-09-07");
  assert.strictEqual(S.longestStreak(h), 4);
  assert.strictEqual(S.longestStreak({}), 0);
});

test("longestStreak ignores days set to false", () => {
  assert.strictEqual(S.longestStreak({ "2026-09-01": true, "2026-09-02": false, "2026-09-03": true }), 1);
});

test("weeks start on Monday", () => {
  assert.strictEqual(S.key(S.weekStart(d(2026, 10, 4))), "2026-09-28"); // Sunday
  assert.strictEqual(S.key(S.weekStart(d(2026, 10, 5))), "2026-10-05"); // Monday
});

test("weekCount only counts this week", () => {
  const h = days("2026-10-04", "2026-10-05", "2026-10-06"); // Sun (last week), Mon, Tue
  assert.strictEqual(S.weekCount(h, d(2026, 10, 7)), 2);
});

test("rate uses the habit's age when it is newer than the window", () => {
  const h = days("2026-10-02", "2026-10-03");
  assert.strictEqual(S.rate(h, d(2026, 10, 3), "2026-10-02"), 100);
  assert.strictEqual(S.rate(h, d(2026, 10, 4), "2026-10-02"), 67);
});

test("heatmap has the right shape and marks the future", () => {
  const map = S.heatmap(days("2026-10-03"), d(2026, 10, 3), 12); // a Saturday
  assert.strictEqual(map.length, 12);
  assert.ok(map.every(w => w.length === 7));
  const last = map[11];
  assert.strictEqual(last[5].key, "2026-10-03");
  assert.ok(last[5].done);
  assert.ok(last[6].future);
  assert.ok(!last[0].future);
});
