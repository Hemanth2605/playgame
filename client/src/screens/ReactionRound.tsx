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
  // The server flips every teammate to `answered` once one of them taps, so this
  // means a teammate used the team's single tap before we did.
  const teammateTapped = me.answered && tap === 'none';
  const done = tap !== 'none' || teammateTapped || timeUp;

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
    label = '😬 Too early! Your team is out this round.';
  } else if (tap === 'tapped') {
    cls = 'reaction-pad done';
    label = `⚡ ~${Math.max(0, tappedAt - round.goAt!)}ms — you tapped for the team!`;
  } else if (teammateTapped) {
    cls = 'reaction-pad done';
    label = '🔒 A teammate already tapped for your team.';
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
      <p className="hint">
        <b>Fastest tap in the room wins the round</b> — the other team gets nothing.
        One tap per team, so a false start burns your team's turn!
      </p>
    </div>
  );
}
