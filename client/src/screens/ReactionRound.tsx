import { useState } from 'react';
import type { Player, PublicRound } from '../../../shared/types';
import { socket } from '../socket';
import { useNow } from '../hooks';

type TapState = 'none' | 'early' | 'tapped';

export default function ReactionRound({ round, me }: { round: PublicRound; me: Player }) {
  const now = useNow(50);
  const [tap, setTap] = useState<TapState>('none');
  const [tappedAt, setTappedAt] = useState(0);

  const isGo = now >= round.goAt!;
  const timeUp = now >= round.endsAt;
  const done = tap !== 'none' || me.answered || timeUp;

  const onTap = () => {
    if (done) return;
    setTap(isGo ? 'tapped' : 'early');
    setTappedAt(Date.now());
    socket.emit('tap');
  };

  let cls = 'reaction-pad waiting';
  let label = 'Wait for green…';
  if (tap === 'early') {
    cls = 'reaction-pad early';
    label = '😬 Too early! False start.';
  } else if (tap === 'tapped') {
    cls = 'reaction-pad done';
    label = `⚡ ~${Math.max(0, tappedAt - round.goAt!)}ms — waiting for the others…`;
  } else if (timeUp) {
    cls = 'reaction-pad early';
    label = '⏱ Missed it!';
  } else if (isGo) {
    cls = 'reaction-pad go';
    label = 'TAP NOW!';
  }

  return (
    <div className="card question-card">
      <span className="category-chip">Reaction Rush</span>
      <button className={cls} onClick={onTap} disabled={done}>
        {label}
      </button>
      <p className="hint">Tap the panel the instant it turns green. Tapping early scores nothing!</p>
    </div>
  );
}
