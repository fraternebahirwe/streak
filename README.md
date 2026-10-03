# Streak 🔥

A daily habit tracker. Check habits off each day, build streaks, and watch your heatmap fill up.
Everything is stored on your device. No account, no server.

## Features
- Add habits with an icon, colour and a weekly goal (1–7 days)
- One-tap check-off, plus a Mon–Sun row where you can fix earlier days
- Current streak, best streak, 30-day rate and total check-ins
- 12-week heatmap per habit (tap a square to add or remove a day)
- Weekly goal progress bar
- Confetti for finishing everything and for 3/7/14/30/50/100/200/365-day streaks
- Delete with Undo
- Light, dark, or match-my-device theme
- Daily reminder at a time you choose (lists unfinished habits)
- Export and import a JSON backup
- Installable on your phone or desktop, works offline

## Run
    python3 -m http.server 8002

Open http://localhost:8002. To install on a phone, host it over https (for example on Vercel), open it in the
browser and choose "Add to Home Screen".

## Test
    npm test

Covers the streak, longest streak, week, 30-day rate and heatmap maths.

## Notes
- Reminders use browser notifications, so they fire while Streak is open or installed and running. True background
  push would need a server.
- Data lives in this browser's localStorage. Use Export to back it up or move it to another device.
