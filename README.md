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
2. **Deploy (permanent):** client on Cloudflare Pages, server on Render — see below.

## Deploying

The client is a static site, but the server is a long-lived Node process: it holds
every room in memory and drives rounds with timers. That rules out putting the server
on Cloudflare Pages/Workers, so the two halves deploy to different hosts and are wired
together with `VITE_SERVER_URL`.

```
Cloudflare Pages  ──  client/dist (static React app)
        │
        │  VITE_SERVER_URL  (baked in at build time)
        ▼
Render  ───────────  server/  (Node + Socket.IO, always on)
```

### 1. Server → Render

`render.yaml` in this repo is a blueprint, so Render configures itself:

1. **New → Blueprint** on [Render](https://dashboard.render.com), pick this repo, **Apply**.
2. Copy the resulting URL, e.g. `https://quiz-clash-server.onrender.com`.

Visiting that URL should print `Quiz Clash server is running`.

> The free plan sleeps after ~15 minutes idle and takes ~30s to wake, so the first
> player to open the app may wait. Keep the server at **one instance** — room state
> lives in memory, so a second replica would strand players in the wrong game.

### 2. Client → Cloudflare Pages

**Workers & Pages → Create → Pages → Connect to Git**, pick this repo, then set:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | `npm install && npm install --prefix client && npm run build --prefix client` |
| Build output directory | `client/dist` |
| Root directory | *(leave blank — the repo root)* |

Add one **environment variable**, then deploy:

| Variable | Value |
|---|---|
| `VITE_SERVER_URL` | your Render URL, e.g. `https://quiz-clash-server.onrender.com` |

`VITE_SERVER_URL` is **required in production**. Vite inlines it at build time, so
changing it means triggering a fresh deploy — and without it the client falls back to
`<page-host>:3001`, which does not exist on Pages, and nobody can join a room.

Every push to `main` now redeploys the client automatically.

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
