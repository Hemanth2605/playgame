import type { GameId } from '../../shared/types';

export interface GameInfo {
  id: GameId;
  emoji: string;
  name: string;
  description: string;
}

export const GAMES: GameInfo[] = [
  {
    id: 'quiz',
    emoji: '🧠',
    name: 'Quiz Battle',
    description: 'Timed trivia — everyone answers, speed and streaks earn bonus points.',
  },
  {
    id: 'scramble',
    emoji: '🔤',
    name: 'Word Scramble',
    description: 'Unscramble the word and type it before the timer runs out. Keep guessing!',
  },
  {
    id: 'reaction',
    emoji: '⚡',
    name: 'Reaction Rush',
    description: 'Wait for green… then TAP! Fastest fingers score. Tap early and you get nothing.',
  },
  {
    id: 'persona',
    emoji: '🕵️',
    name: 'Persona Pics',
    description: 'A person + a clue = who is it? First correct answer grabs all the points!',
  },
];

export function gameInfo(id: GameId): GameInfo {
  return GAMES.find((g) => g.id === id) ?? GAMES[0];
}
