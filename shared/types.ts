// Shared types between server and client. Keep this file types-only
// (no runtime values) so both sides can `import type` from it.

export type Team = 'red' | 'blue';
export type Phase = 'lobby' | 'question' | 'reveal' | 'final';
export type GameId = 'quiz' | 'scramble' | 'reaction' | 'persona';

export interface Player {
  id: string;
  name: string;
  team: Team;
  connected: boolean;
  isHost: boolean;
  score: number;
  streak: number;
  /** Has this player finished the current round (answered / solved / tapped)? */
  answered: boolean;
}

export interface Settings {
  rounds: number;
  secondsPerQuestion: number;
}

/** Round data as clients see it — never includes the correct answer. */
export interface PublicRound {
  game: GameId;
  index: number;
  total: number;
  /** Epoch ms when the round closes. */
  endsAt: number;
  seconds: number;
  // quiz
  category?: string;
  text?: string;
  options?: string[];
  // scramble
  scrambled?: string;
  hint?: string;
  answerLength?: number;
  // reaction: epoch ms when the screen turns green
  goAt?: number;
  // persona: the "picture" — a person emoji plus clue emojis
  emojis?: string[];
}

export interface AnswerResult {
  playerId: string;
  name: string;
  team: Team;
  correct: boolean;
  points: number;
  optionIndex?: number;
  reactionMs?: number;
  falseStart?: boolean;
}

export interface Reveal {
  round: PublicRound;
  results: AnswerResult[];
  roundPoints: Record<Team, number>;
  /** Epoch ms when the next round (or final screen) starts. */
  nextAt: number;
  isLast: boolean;
  correctIndex?: number; // quiz
  correctWord?: string; // scramble & persona: the answer, shown on reveal
}

export interface RoomState {
  code: string;
  phase: Phase;
  game: GameId;
  players: Player[];
  hostId: string;
  settings: Settings;
  teamScores: Record<Team, number>;
  round: PublicRound | null;
  reveal: Reveal | null;
  winner: Team | 'tie' | null;
}

export type JoinAck =
  | { ok: true; playerId: string; code: string }
  | { ok: false; error: string };

export interface ClientToServerEvents {
  create_room: (name: string, ack: (res: JoinAck) => void) => void;
  join_room: (code: string, name: string, ack: (res: JoinAck) => void) => void;
  rejoin: (code: string, playerId: string, ack: (res: JoinAck) => void) => void;
  switch_team: () => void;
  shuffle_teams: () => void;
  select_game: (game: GameId) => void;
  update_settings: (settings: Settings) => void;
  start_game: () => void;
  answer: (optionIndex: number) => void;
  answer_text: (text: string) => void;
  tap: () => void;
  play_again: () => void;
  end_match: () => void;
  leave_room: () => void;
}

export interface ServerToClientEvents {
  room_state: (state: RoomState) => void;
  toast: (message: string) => void;
}
