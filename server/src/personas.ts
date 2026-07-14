export interface PersonaPuzzle {
  /** The "picture": a person emoji plus clue emojis, shown joined with + */
  emojis: string[];
  /** Accepted answers, normalized: uppercase, letters only. */
  answers: string[];
  /** Primary answer shown on the reveal screen. */
  display: string;
  hint: string;
}

export const PERSONAS: PersonaPuzzle[] = [
  { emojis: ['👨', '🦇'], answers: ['BATMAN'], display: 'BATMAN', hint: 'Superhero' },
  { emojis: ['👦', '🕷️'], answers: ['SPIDERMAN', 'SPIDER'], display: 'SPIDER-MAN', hint: 'Superhero' },
  { emojis: ['👦', '⚡', '👓'], answers: ['HARRYPOTTER', 'HARRY'], display: 'HARRY POTTER', hint: 'Movie character' },
  { emojis: ['🧑', '🩺'], answers: ['DOCTOR'], display: 'DOCTOR', hint: 'Profession' },
  { emojis: ['🧑', '🔥', '🚒'], answers: ['FIREFIGHTER', 'FIREMAN'], display: 'FIREFIGHTER', hint: 'Profession' },
  { emojis: ['👮', '🚓'], answers: ['POLICE', 'POLICEMAN', 'POLICEOFFICER', 'COP'], display: 'POLICE OFFICER', hint: 'Profession' },
  { emojis: ['🧑', '🚀'], answers: ['ASTRONAUT'], display: 'ASTRONAUT', hint: 'Profession' },
  { emojis: ['🧑', '🍳'], answers: ['CHEF', 'COOK'], display: 'CHEF', hint: 'Profession' },
  { emojis: ['🧑', '🌾', '🚜'], answers: ['FARMER'], display: 'FARMER', hint: 'Profession' },
  { emojis: ['🧑', '🎤'], answers: ['SINGER'], display: 'SINGER', hint: 'Profession' },
  { emojis: ['🧑', '🏏'], answers: ['CRICKETER', 'BATSMAN'], display: 'CRICKETER', hint: 'Sportsperson' },
  { emojis: ['🧑', '📷'], answers: ['PHOTOGRAPHER'], display: 'PHOTOGRAPHER', hint: 'Profession' },
  { emojis: ['🧑', '✈️'], answers: ['PILOT'], display: 'PILOT', hint: 'Profession' },
  { emojis: ['🧑', '🔧', '🚗'], answers: ['MECHANIC'], display: 'MECHANIC', hint: 'Profession' },
  { emojis: ['🧑', '🏴‍☠️', '⚓'], answers: ['PIRATE'], display: 'PIRATE', hint: 'Character' },
  { emojis: ['🧑', '🎨'], answers: ['PAINTER', 'ARTIST'], display: 'PAINTER', hint: 'Profession' },
  { emojis: ['🧑', '📚', '🏫'], answers: ['TEACHER'], display: 'TEACHER', hint: 'Profession' },
  { emojis: ['🧑', '💻'], answers: ['PROGRAMMER', 'CODER', 'DEVELOPER', 'SOFTWAREENGINEER'], display: 'PROGRAMMER', hint: 'Profession' },
  { emojis: ['🧑', '🥊'], answers: ['BOXER'], display: 'BOXER', hint: 'Sportsperson' },
  { emojis: ['🧑', '🏊'], answers: ['SWIMMER'], display: 'SWIMMER', hint: 'Sportsperson' },
  { emojis: ['🧑', '💃'], answers: ['DANCER'], display: 'DANCER', hint: 'Profession' },
  { emojis: ['🧑', '🔍'], answers: ['DETECTIVE', 'SPY'], display: 'DETECTIVE', hint: 'Profession' },
  { emojis: ['👨', '👑'], answers: ['KING'], display: 'KING', hint: 'Royalty' },
  { emojis: ['👩', '👑'], answers: ['QUEEN'], display: 'QUEEN', hint: 'Royalty' },
  { emojis: ['🧑', '⚽'], answers: ['FOOTBALLER', 'FOOTBALLPLAYER'], display: 'FOOTBALLER', hint: 'Sportsperson' },
  { emojis: ['🧑', '🎸'], answers: ['GUITARIST', 'ROCKSTAR'], display: 'GUITARIST', hint: 'Profession' },
  { emojis: ['🧑', '🍞'], answers: ['BAKER'], display: 'BAKER', hint: 'Profession' },
  { emojis: ['🧑', '🎣'], answers: ['FISHERMAN'], display: 'FISHERMAN', hint: 'Profession' },
  { emojis: ['🧑', '⚖️'], answers: ['JUDGE'], display: 'JUDGE', hint: 'Profession' },
  { emojis: ['🧑', '🚴'], answers: ['CYCLIST'], display: 'CYCLIST', hint: 'Sportsperson' },
];
