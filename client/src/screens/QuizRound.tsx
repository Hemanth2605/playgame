import { useState } from 'react';
import type { Player, PublicRound } from '../../../shared/types';
import { socket } from '../socket';
import { useNow } from '../hooks';
import TimerBar from './TimerBar';

export const OPTION_TAGS = ['A', 'B', 'C', 'D'];

export default function QuizRound({ round, me }: { round: PublicRound; me: Player }) {
  const now = useNow();
  const [picked, setPicked] = useState<number | null>(null);

  const timeUp = now >= round.endsAt;
  // The server marks the whole team answered once any teammate locks in, so
  // `me.answered` without a local pick means a teammate answered for us.
  const teammateAnswered = me.answered && picked === null;
  const locked = picked !== null || teammateAnswered || timeUp;

  const pick = (i: number) => {
    if (locked) return;
    setPicked(i);
    socket.emit('answer', i);
  };

  return (
    <>
      <TimerBar endsAt={round.endsAt} totalMs={round.seconds * 1000} />
      <div className="card question-card">
        <span className="category-chip">{round.category}</span>
        <h2 className="question-text">{round.text}</h2>
        <div className="options-grid">
          {round.options!.map((opt, i) => (
            <button
              key={i}
              className={`option ${picked === i ? 'picked' : ''} ${locked && picked !== i ? 'dimmed' : ''}`}
              onClick={() => pick(i)}
              disabled={locked}
            >
              <span className="option-tag">{OPTION_TAGS[i]}</span> {opt}
            </button>
          ))}
        </div>
        {picked !== null && <p className="locked-note">🔒 Locked in — waiting for the others…</p>}
        {teammateAnswered && !timeUp && (
          <p className="locked-note">🔒 A teammate answered for your team this round.</p>
        )}
        {picked === null && !teammateAnswered && timeUp && (
          <p className="locked-note">⏱ Too slow this round!</p>
        )}
      </div>
    </>
  );
}
