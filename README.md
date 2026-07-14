# Quiz Clash 🔴🔵

Real-time **Red vs Blue team game arcade** for 2–16 players (built for groups of 6–10).
Everyone joins a room with a code from their own browser, gets auto-split into two
balanced teams, and the host picks a game from the list — all scored server-side:

- 🧠 **Quiz Battle** — timed trivia; correct = 100 pts + speed bonus + streak bonus
- 🔤 **Word Scramble** — unscramble and type the word; retry until the timer ends
- ⚡ **Reaction Rush** — tap the instant it turns green; early tap = false start
- 🕵️ **Persona Pics** — a person + clue emojis (👨+🦇 = BATMAN); **first** correct answer takes the round

**Stack:** React + TypeScript + Vite (client) · Node + Socket.IO + TypeScript (server)

## Run it

```bash
npm run setup    # installs root, server, and client dependencies (first time only)
npm run dev      # starts server (:3001) and client (:5173) together
```

Open http://localhost:5173, enter a name, and **Create a room**. Others join with the room code.

### Playing with friends on the same Wi-Fi (LAN)

The Vite dev server listens on your network. Find your PC's IP (`ipconfig` → IPv4 address)
and have friends open `http://<your-ip>:5173`. The client automatically connects to the
game server on the same host, port 3001. Allow Node through Windows Firewall if prompted.

### Playing over the internet

Two easy options:

1. **Quick tunnel (no deployment):** expose both ports with a tunnel tool, e.g.
   `ngrok http 5173` and `ngrok http 3001`, then create `client/.env` with
   `VITE_SERVER_URL=<your-3001-tunnel-url>` and restart the client.
2. **Deploy (permanent):**
   - Server → Render / Railway / Fly.io: build with `npm install && npm run build`
     inside `server/`, start with `npm start`. It respects the `PORT` env var.
   - Client → Vercel / Netlify: project root `client/`, build `npm run build`,
     output `dist/`, and set the env var `VITE_SERVER_URL` to your server's URL.

## How the game works

| Phase | What happens |
|---|---|
| Lobby | Players join via code, auto-balanced into Red/Blue. Switch or shuffle teams. Host picks rounds (5–15) and time per question (10–30s). |
| Question | Everyone answers the same multiple-choice question before the timer ends. Round ends early once all players lock in. |
| Reveal | Correct answer shown, points per team for the round, who scored what. Auto-advances after 7s. |
| Final | Winning team celebration, score bars, top-3 MVPs, and Play Again. |

**Scoring:** correct = 100 base + up to 100 speed bonus (proportional to time left)
+ 25 × streak bonus (capped at +100 for a 4+ streak). Wrong or no answer resets your streak.

Refreshing the page mid-game reconnects you to your seat automatically. If the host
drops, hosting passes to the next connected player.

## Project layout

```
shared/types.ts      Types shared by client & server (socket events, room state)
server/src/index.ts  HTTP + Socket.IO bootstrap
server/src/rooms.ts  All game logic: rooms, teams, timers, scoring
server/src/questions.ts  Question bank (48 questions — add your own here!)
client/src/          React app: Landing → Lobby → Question → Reveal → Final
```

To add questions, append to `server/src/questions.ts` — `answer` is the index of the
correct option. Each game randomly draws the configured number of rounds from the bank.
