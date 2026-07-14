import { randomUUID } from 'crypto';
import type { Server, Socket } from 'socket.io';
import type {
  AnswerResult,
  ClientToServerEvents,
  GameId,
  JoinAck,
  Phase,
  Player,
  PublicRound,
  Reveal,
  RoomState,
  ServerToClientEvents,
  Settings,
  Team,
} from '../../shared/types';
import { QUESTIONS, Question } from './questions';
import { WORDS, ScrambleWord } from './words';
import { PERSONAS, PersonaPuzzle } from './personas';

type IO = Server<ClientToServerEvents, ServerToClientEvents>;
type Sock = Socket<ClientToServerEvents, ServerToClientEvents>;

const REVEAL_MS = 7000;
const ANSWER_GRACE_MS = 750;
const REACTION_WINDOW_MS = 5000;
const EMPTY_ROOM_TTL_MS = 15 * 60 * 1000;
const GAME_IDS: GameId[] = ['quiz', 'scramble', 'reaction', 'persona'];
const PERSONA_POINTS = 200;
const PERSONA_SECONDS = 90;
const CODE_WORDS = [
  'TIGER', 'EAGLE', 'COBRA', 'PANDA', 'RHINO', 'SHARK', 'WOLF', 'LION',
  'FALCON', 'BISON', 'OTTER', 'GECKO', 'MOOSE', 'PUMA', 'DINGO', 'LEMUR',
];

interface InternalPlayer extends Omit<Player, 'answered'> {
  socketId: string | null;
}

type RoundSpec =
  | { kind: 'quiz'; q: Question }
  | { kind: 'scramble'; word: string; hint: string; scrambled: string }
  | { kind: 'reaction' }
  | { kind: 'persona'; puzzle: PersonaPuzzle };

interface Attempt {
  at: number;
  optionIndex?: number;
  reactionMs?: number;
  falseStart?: boolean;
}

interface Room {
  code: string;
  phase: Phase;
  game: GameId;
  players: Map<string, InternalPlayer>;
  hostId: string;
  settings: Settings;
  teamScores: Record<Team, number>;
  order: RoundSpec[];
  qIndex: number;
  qStartedAt: number;
  qEndsAt: number;
  goAt: number;
  answers: Map<string, Attempt>;
  reveal: Reveal | null;
  winner: Team | 'tie' | null;
  timer: NodeJS.Timeout | null;
  cleanupTimer: NodeJS.Timeout | null;
}

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function scrambleLetters(word: string): string {
  let s = word;
  for (let tries = 0; tries < 10 && s === word; tries++) {
    s = shuffle([...word]).join('');
  }
  return s;
}

export class RoomManager {
  private rooms = new Map<string, Room>();

  constructor(private io: IO) {}

  attach(socket: Sock): void {
    socket.on('create_room', (name, ack) => this.createRoom(socket, name, ack));
    socket.on('join_room', (code, name, ack) => this.joinRoom(socket, code, name, ack));
    socket.on('rejoin', (code, playerId, ack) => this.rejoin(socket, code, playerId, ack));
    socket.on('switch_team', () => this.switchTeam(socket));
    socket.on('shuffle_teams', () => this.shuffleTeams(socket));
    socket.on('select_game', (game) => this.selectGame(socket, game));
    socket.on('update_settings', (s) => this.updateSettings(socket, s));
    socket.on('start_game', () => this.startGame(socket));
    socket.on('answer', (i) => this.answerQuiz(socket, i));
    socket.on('answer_text', (t) => this.answerText(socket, t));
    socket.on('tap', () => this.tap(socket));
    socket.on('play_again', () => this.playAgain(socket));
    socket.on('end_match', () => this.endMatch(socket));
    socket.on('leave_room', () => this.leave(socket));
    socket.on('disconnect', () => this.onDisconnect(socket));
  }

  // ---------- joining ----------

  private createRoom(socket: Sock, name: string, ack: (res: JoinAck) => void): void {
    const cleanName = this.cleanName(name);
    if (!cleanName) return ack({ ok: false, error: 'Please enter a name.' });

    const code = this.newCode();
    const room: Room = {
      code,
      phase: 'lobby',
      game: 'quiz',
      players: new Map(),
      hostId: '',
      settings: { rounds: 10, secondsPerQuestion: 15 },
      teamScores: { red: 0, blue: 0 },
      order: [],
      qIndex: -1,
      qStartedAt: 0,
      qEndsAt: 0,
      goAt: 0,
      answers: new Map(),
      reveal: null,
      winner: null,
      timer: null,
      cleanupTimer: null,
    };
    this.rooms.set(code, room);
    const player = this.addPlayer(room, socket, cleanName);
    room.hostId = player.id;
    ack({ ok: true, playerId: player.id, code });
    this.broadcast(room);
  }

  private joinRoom(socket: Sock, code: string, name: string, ack: (res: JoinAck) => void): void {
    const cleanName = this.cleanName(name);
    if (!cleanName) return ack({ ok: false, error: 'Please enter a name.' });
    const room = this.rooms.get(this.cleanCode(code));
    if (!room) return ack({ ok: false, error: 'Room not found. Check the code.' });
    if (room.players.size >= 16) return ack({ ok: false, error: 'Room is full (max 16).' });

    const player = this.addPlayer(room, socket, cleanName);
    ack({ ok: true, playerId: player.id, code: room.code });
    this.io.to(room.code).emit('toast', `${player.name} joined team ${player.team.toUpperCase()}`);
    this.broadcast(room);
  }

  private rejoin(socket: Sock, code: string, playerId: string, ack: (res: JoinAck) => void): void {
    const room = this.rooms.get(this.cleanCode(code));
    const player = room?.players.get(playerId);
    if (!room || !player) return ack({ ok: false, error: 'Session expired.' });

    player.socketId = socket.id;
    player.connected = true;
    socket.data.code = room.code;
    socket.data.playerId = player.id;
    socket.join(room.code);
    this.cancelCleanup(room);
    ack({ ok: true, playerId: player.id, code: room.code });
    this.broadcast(room);
  }

  private addPlayer(room: Room, socket: Sock, name: string): InternalPlayer {
    // Auto-balance: new players go to the smaller team.
    const counts = this.teamCounts(room);
    const team: Team =
      counts.red === counts.blue
        ? (Math.random() < 0.5 ? 'red' : 'blue')
        : counts.red < counts.blue ? 'red' : 'blue';

    const player: InternalPlayer = {
      id: randomUUID(),
      name,
      team,
      connected: true,
      isHost: false,
      score: 0,
      streak: 0,
      socketId: socket.id,
    };
    room.players.set(player.id, player);
    socket.data.code = room.code;
    socket.data.playerId = player.id;
    socket.join(room.code);
    this.cancelCleanup(room);
    return player;
  }

  // ---------- lobby actions ----------

  private switchTeam(socket: Sock): void {
    const ctx = this.ctx(socket);
    if (!ctx || ctx.room.phase !== 'lobby') return;
    ctx.player.team = ctx.player.team === 'red' ? 'blue' : 'red';
    this.broadcast(ctx.room);
  }

  private shuffleTeams(socket: Sock): void {
    const ctx = this.ctx(socket);
    if (!ctx || ctx.room.phase !== 'lobby' || !this.isHost(ctx)) return;
    const players = shuffle([...ctx.room.players.values()]);
    players.forEach((p, i) => { p.team = i < Math.ceil(players.length / 2) ? 'red' : 'blue'; });
    this.broadcast(ctx.room);
  }

  private selectGame(socket: Sock, game: GameId): void {
    const ctx = this.ctx(socket);
    if (!ctx || ctx.room.phase !== 'lobby' || !this.isHost(ctx)) return;
    if (!GAME_IDS.includes(game)) return;
    ctx.room.game = game;
    this.broadcast(ctx.room);
  }

  private updateSettings(socket: Sock, s: Settings): void {
    const ctx = this.ctx(socket);
    if (!ctx || ctx.room.phase !== 'lobby' || !this.isHost(ctx)) return;
    ctx.room.settings = {
      rounds: clamp(s.rounds, 3, 20),
      secondsPerQuestion: clamp(s.secondsPerQuestion, 10, 30),
    };
    this.broadcast(ctx.room);
  }

  private startGame(socket: Sock): void {
    const ctx = this.ctx(socket);
    if (!ctx || ctx.room.phase !== 'lobby' || !this.isHost(ctx)) return;
    const room = ctx.room;
    const connected = [...room.players.values()].filter((p) => p.connected);
    if (connected.length < 2) {
      return this.toastTo(socket, 'Need at least 2 players to start.');
    }
    if (!connected.some((p) => p.team === 'red') || !connected.some((p) => p.team === 'blue')) {
      return this.toastTo(socket, 'Both teams need at least one player.');
    }
    room.order = this.buildRounds(room.game, room.settings.rounds);
    room.qIndex = -1;
    room.teamScores = { red: 0, blue: 0 };
    room.winner = null;
    for (const p of room.players.values()) { p.score = 0; p.streak = 0; }
    this.nextRound(room);
  }

  private buildRounds(game: GameId, rounds: number): RoundSpec[] {
    switch (game) {
      case 'quiz':
        return shuffle(QUESTIONS)
          .slice(0, Math.min(rounds, QUESTIONS.length))
          .map((q) => ({ kind: 'quiz' as const, q }));
      case 'scramble':
        return shuffle(WORDS)
          .slice(0, Math.min(rounds, WORDS.length))
          .map((w: ScrambleWord) => ({
            kind: 'scramble' as const,
            word: w.word,
            hint: w.hint,
            scrambled: scrambleLetters(w.word),
          }));
      case 'reaction':
        return Array.from({ length: rounds }, () => ({ kind: 'reaction' as const }));
      case 'persona':
        return shuffle(PERSONAS)
          .slice(0, Math.min(rounds, PERSONAS.length))
          .map((puzzle) => ({ kind: 'persona' as const, puzzle }));
    }
  }

  private playAgain(socket: Sock): void {
    const ctx = this.ctx(socket);
    if (!ctx || ctx.room.phase !== 'final' || !this.isHost(ctx)) return;
    const room = ctx.room;
    room.phase = 'lobby';
    room.reveal = null;
    room.winner = null;
    room.teamScores = { red: 0, blue: 0 };
    for (const p of room.players.values()) { p.score = 0; p.streak = 0; }
    // Drop players who never came back.
    for (const [id, p] of room.players) {
      if (!p.connected) room.players.delete(id);
    }
    this.ensureHost(room);
    this.broadcast(room);
  }

  private endMatch(socket: Sock): void {
    const ctx = this.ctx(socket);
    if (!ctx || !this.isHost(ctx)) return;
    const room = ctx.room;
    if (room.phase !== 'question' && room.phase !== 'reveal') return;
    this.clearTimer(room);
    room.phase = 'lobby';
    room.reveal = null;
    room.winner = null;
    room.answers.clear();
    room.teamScores = { red: 0, blue: 0 };
    for (const p of room.players.values()) { p.score = 0; p.streak = 0; }
    this.io.to(room.code).emit('toast', '⏹ Host ended the match — back to the lobby');
    this.broadcast(room);
  }

  // ---------- game flow ----------

  private nextRound(room: Room): void {
    this.clearTimer(room);
    room.qIndex++;
    if (room.qIndex >= room.order.length) return this.finish(room);

    const spec = room.order[room.qIndex];
    room.phase = 'question';
    room.answers.clear();
    room.reveal = null;
    room.qStartedAt = Date.now();
    if (spec.kind === 'reaction') {
      // Random suspense delay, then a fixed tap window.
      room.goAt = room.qStartedAt + 2000 + Math.floor(Math.random() * 3000);
      room.qEndsAt = room.goAt + REACTION_WINDOW_MS;
    } else if (spec.kind === 'persona') {
      // Persona rounds get a fixed 1½ minutes — guessing takes longer than picking.
      room.goAt = 0;
      room.qEndsAt = room.qStartedAt + PERSONA_SECONDS * 1000;
    } else {
      room.goAt = 0;
      room.qEndsAt = room.qStartedAt + room.settings.secondsPerQuestion * 1000;
    }
    room.timer = setTimeout(
      () => this.endRound(room),
      room.qEndsAt - room.qStartedAt + ANSWER_GRACE_MS,
    );
    this.broadcast(room);
  }

  private answerQuiz(socket: Sock, optionIndex: number): void {
    const ctx = this.roundCtx(socket, 'quiz');
    if (!ctx) return;
    const { room, player, spec } = ctx;
    if (spec.kind !== 'quiz') return;
    if (room.answers.has(player.id)) return;
    if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= spec.q.options.length) return;

    room.answers.set(player.id, { at: Math.min(Date.now(), room.qEndsAt), optionIndex });
    this.afterAttempt(room);
  }

  private answerText(socket: Sock, text: string): void {
    const ctx = this.ctx(socket);
    if (!ctx || ctx.room.phase !== 'question') return;
    const { room, player } = ctx;
    if (Date.now() > room.qEndsAt + ANSWER_GRACE_MS) return;
    const spec = room.order[room.qIndex];
    if (!spec || (spec.kind !== 'scramble' && spec.kind !== 'persona')) return;
    if (room.answers.has(player.id)) return;
    const guess = typeof text === 'string' ? text.trim().toUpperCase() : '';
    if (!guess) return;

    if (spec.kind === 'scramble') {
      if (guess === spec.word) {
        room.answers.set(player.id, { at: Math.min(Date.now(), room.qEndsAt) });
        this.afterAttempt(room);
      } else {
        // Wrong guesses don't lock you out — keep trying until the timer runs out.
        this.toastTo(socket, '❌ Not it — try again!');
      }
    } else {
      const normalized = guess.replace(/[^A-Z]/g, '');
      if (spec.puzzle.answers.includes(normalized)) {
        // First correct answer takes the round for their team.
        room.answers.set(player.id, { at: Math.min(Date.now(), room.qEndsAt) });
        this.endRound(room);
      } else {
        this.toastTo(socket, '❌ Not it — keep guessing!');
      }
    }
  }

  private tap(socket: Sock): void {
    const ctx = this.roundCtx(socket, 'reaction');
    if (!ctx) return;
    const { room, player, spec } = ctx;
    if (spec.kind !== 'reaction') return;
    if (room.answers.has(player.id)) return;

    const now = Math.min(Date.now(), room.qEndsAt);
    if (now < room.goAt) {
      room.answers.set(player.id, { at: now, falseStart: true });
    } else {
      room.answers.set(player.id, { at: now, reactionMs: now - room.goAt });
    }
    this.afterAttempt(room);
  }

  private afterAttempt(room: Room): void {
    // End early once every connected player has locked in.
    const connected = [...room.players.values()].filter((p) => p.connected);
    if (connected.length > 0 && connected.every((p) => room.answers.has(p.id))) {
      this.endRound(room);
    } else {
      this.broadcast(room);
    }
  }

  private endRound(room: Room): void {
    if (room.phase !== 'question') return;
    this.clearTimer(room);
    const spec = room.order[room.qIndex];
    const round = this.publicRound(room);
    const duration = room.settings.secondsPerQuestion * 1000;
    const results: AnswerResult[] = [];
    const roundPoints: Record<Team, number> = { red: 0, blue: 0 };

    for (const p of room.players.values()) {
      const a = room.answers.get(p.id);
      if (!a) { p.streak = 0; continue; }

      let correct = false;
      let points = 0;
      const result: AnswerResult = {
        playerId: p.id, name: p.name, team: p.team,
        correct: false, points: 0,
      };

      if (spec.kind === 'quiz') {
        result.optionIndex = a.optionIndex;
        correct = a.optionIndex === spec.q.answer;
        if (correct) points = this.speedPoints(room, a.at, duration, p.streak);
      } else if (spec.kind === 'scramble') {
        // Only correct solves are recorded for scramble.
        correct = true;
        points = this.speedPoints(room, a.at, duration, p.streak);
      } else if (spec.kind === 'persona') {
        // Only the round winner has an entry — flat prize plus streak bonus.
        correct = true;
        points = PERSONA_POINTS + 25 * Math.min(p.streak, 4);
      } else {
        result.falseStart = a.falseStart;
        result.reactionMs = a.reactionMs;
        if (!a.falseStart && a.reactionMs !== undefined) {
          correct = true;
          points = Math.max(10, 200 - Math.round(a.reactionMs / 10));
        }
      }

      if (correct) {
        p.streak++;
        p.score += points;
        room.teamScores[p.team] += points;
        roundPoints[p.team] += points;
      } else {
        p.streak = 0;
      }
      result.correct = correct;
      result.points = points;
      results.push(result);
    }

    results.sort((a, b) => b.points - a.points);
    room.phase = 'reveal';
    room.reveal = {
      round,
      results,
      roundPoints,
      nextAt: Date.now() + REVEAL_MS,
      isLast: room.qIndex >= room.order.length - 1,
      correctIndex: spec.kind === 'quiz' ? spec.q.answer : undefined,
      correctWord:
        spec.kind === 'scramble' ? spec.word
        : spec.kind === 'persona' ? spec.puzzle.display
        : undefined,
    };
    room.timer = setTimeout(() => this.nextRound(room), REVEAL_MS);
    this.broadcast(room);
  }

  private speedPoints(room: Room, answeredAt: number, duration: number, streak: number): number {
    const speedBonus = Math.round(100 * Math.max(0, room.qEndsAt - answeredAt) / duration);
    const streakBonus = 25 * Math.min(streak, 4);
    return 100 + speedBonus + streakBonus;
  }

  private finish(room: Room): void {
    this.clearTimer(room);
    room.phase = 'final';
    room.reveal = null;
    room.winner =
      room.teamScores.red === room.teamScores.blue
        ? 'tie'
        : room.teamScores.red > room.teamScores.blue ? 'red' : 'blue';
    this.broadcast(room);
  }

  // ---------- leaving / disconnects ----------

  private leave(socket: Sock): void {
    const ctx = this.ctx(socket);
    if (!ctx) return;
    ctx.room.players.delete(ctx.player.id);
    socket.leave(ctx.room.code);
    socket.data.code = undefined;
    socket.data.playerId = undefined;
    this.afterPlayerLoss(ctx.room, ctx.player.name);
  }

  private onDisconnect(socket: Sock): void {
    const ctx = this.ctx(socket);
    if (!ctx) return;
    const { room, player } = ctx;
    if (player.socketId !== socket.id) return; // an older socket for a rejoined player
    player.connected = false;
    player.socketId = null;
    if (room.phase === 'lobby') {
      // No game in progress — no reason to hold their seat.
      room.players.delete(player.id);
    }
    this.afterPlayerLoss(room, player.name);
  }

  private afterPlayerLoss(room: Room, name: string): void {
    const connected = [...room.players.values()].filter((p) => p.connected);
    if (connected.length === 0) {
      this.scheduleCleanup(room);
    } else {
      this.ensureHost(room);
      this.io.to(room.code).emit('toast', `${name} left`);
      // If the last holdout disconnects mid-round, don't stall it.
      if (room.phase === 'question' && connected.every((p) => room.answers.has(p.id))) {
        this.endRound(room);
        return;
      }
    }
    this.broadcast(room);
  }

  private ensureHost(room: Room): void {
    const current = room.players.get(room.hostId);
    if (current?.connected) return;
    const next = [...room.players.values()].find((p) => p.connected);
    if (next) room.hostId = next.id;
  }

  private scheduleCleanup(room: Room): void {
    this.cancelCleanup(room);
    room.cleanupTimer = setTimeout(() => {
      this.clearTimer(room);
      this.rooms.delete(room.code);
    }, EMPTY_ROOM_TTL_MS);
  }

  private cancelCleanup(room: Room): void {
    if (room.cleanupTimer) { clearTimeout(room.cleanupTimer); room.cleanupTimer = null; }
  }

  // ---------- helpers ----------

  private ctx(socket: Sock): { room: Room; player: InternalPlayer } | null {
    const code = socket.data.code as string | undefined;
    const playerId = socket.data.playerId as string | undefined;
    if (!code || !playerId) return null;
    const room = this.rooms.get(code);
    const player = room?.players.get(playerId);
    return room && player ? { room, player } : null;
  }

  /** Context for an in-round action; validates phase, timing, and game kind. */
  private roundCtx(socket: Sock, kind: RoundSpec['kind']):
    { room: Room; player: InternalPlayer; spec: RoundSpec } | null {
    const ctx = this.ctx(socket);
    if (!ctx || ctx.room.phase !== 'question') return null;
    if (Date.now() > ctx.room.qEndsAt + ANSWER_GRACE_MS) return null;
    const spec = ctx.room.order[ctx.room.qIndex];
    if (!spec || spec.kind !== kind) return null;
    return { ...ctx, spec };
  }

  private isHost(ctx: { room: Room; player: InternalPlayer }): boolean {
    return ctx.room.hostId === ctx.player.id;
  }

  private teamCounts(room: Room): Record<Team, number> {
    const counts: Record<Team, number> = { red: 0, blue: 0 };
    for (const p of room.players.values()) counts[p.team]++;
    return counts;
  }

  private cleanName(name: unknown): string {
    return typeof name === 'string' ? name.trim().slice(0, 16) : '';
  }

  private cleanCode(code: unknown): string {
    return typeof code === 'string' ? code.trim().toUpperCase() : '';
  }

  private newCode(): string {
    for (;;) {
      const word = CODE_WORDS[Math.floor(Math.random() * CODE_WORDS.length)];
      const num = 10 + Math.floor(Math.random() * 90);
      const code = `${word}-${num}`;
      if (!this.rooms.has(code)) return code;
    }
  }

  private toastTo(socket: Sock, message: string): void {
    socket.emit('toast', message);
  }

  private publicRound(room: Room): PublicRound {
    const spec = room.order[room.qIndex];
    const base: PublicRound = {
      game: room.game,
      index: room.qIndex,
      total: room.order.length,
      endsAt: room.qEndsAt,
      // Actual round length — persona and reaction don't follow the lobby setting.
      seconds: Math.round((room.qEndsAt - room.qStartedAt) / 1000),
    };
    if (spec.kind === 'quiz') {
      return { ...base, category: spec.q.category, text: spec.q.text, options: spec.q.options };
    }
    if (spec.kind === 'scramble') {
      return { ...base, scrambled: spec.scrambled, hint: spec.hint, answerLength: spec.word.length };
    }
    if (spec.kind === 'persona') {
      return { ...base, emojis: spec.puzzle.emojis, hint: spec.puzzle.hint };
    }
    return { ...base, goAt: room.goAt };
  }

  private toPublic(room: Room): RoomState {
    const players: Player[] = [...room.players.values()]
      .map((p) => ({
        id: p.id,
        name: p.name,
        team: p.team,
        connected: p.connected,
        isHost: p.id === room.hostId,
        score: p.score,
        streak: p.streak,
        answered: room.answers.has(p.id),
      }))
      .sort((a, b) => (a.team === b.team ? b.score - a.score : a.team === 'red' ? -1 : 1));

    return {
      code: room.code,
      phase: room.phase,
      game: room.game,
      players,
      hostId: room.hostId,
      settings: room.settings,
      teamScores: room.teamScores,
      round: room.phase === 'question' ? this.publicRound(room) : null,
      reveal: room.phase === 'reveal' ? room.reveal : null,
      winner: room.winner,
    };
  }

  private broadcast(room: Room): void {
    this.io.to(room.code).emit('room_state', this.toPublic(room));
  }

  private clearTimer(room: Room): void {
    if (room.timer) { clearTimeout(room.timer); room.timer = null; }
  }
}
