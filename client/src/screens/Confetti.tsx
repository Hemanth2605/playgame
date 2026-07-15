import { useMemo } from 'react';
import type { Team } from '../../../shared/types';
import { usePrefersReducedMotion } from '../hooks';

const PIECES = 80;

// The winning team's colours, plus gold so it reads as a celebration and not
// just a wall of one hue.
const PALETTES: Record<Team | 'tie', string[]> = {
  red: ['#ff4d5e', '#ff7a45', '#ffd166', '#ffffff'],
  blue: ['#4d8dff', '#6a5cff', '#ffd166', '#ffffff'],
  tie: ['#ff4d5e', '#4d8dff', '#ffd166', '#ffffff'],
};

export default function Confetti({ winner }: { winner: Team | 'tie' }) {
  const reduced = usePrefersReducedMotion();

  // Fixed per mount: re-rolling on every render would make the confetti twitch.
  const pieces = useMemo(() => {
    const palette = PALETTES[winner];
    return Array.from({ length: PIECES }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: palette[i % palette.length],
      delay: Math.random() * 2.5,
      duration: 2.6 + Math.random() * 2.4,
      drift: (Math.random() - 0.5) * 140,
      spin: 360 + Math.random() * 720,
      size: 6 + Math.random() * 8,
      round: Math.random() < 0.3,
    }));
  }, [winner]);

  // Falling debris is exactly what reduced-motion users are asking to opt out of.
  if (reduced) return null;

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={`confetti-piece ${p.round ? 'round' : ''}`}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * (p.round ? 1 : 1.6)}px`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            // Consumed by the keyframes so each piece drifts and spins its own way.
            ['--drift' as string]: `${p.drift}px`,
            ['--spin' as string]: `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}
