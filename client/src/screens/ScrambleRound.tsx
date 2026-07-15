import { FormEvent, useState } from 'react';
import type { Player, PublicRound } from '../../../shared/types';
import { socket } from '../socket';
import { useNow } from '../hooks';
import TimerBar from './TimerBar';

interface Props {
  round: PublicRound;
  me: Player;
  /** False for non-captains in captain mode — they advise instead of typing. */
  canAnswer: boolean;
}

export default function ScrambleRound({ round, me, canAnswer }: Props) {
  const now = useNow();
  const [guess, setGuess] = useState('');

  const timeUp = now >= round.endsAt;
  const solved = me.answered;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const g = guess.trim();
    if (!g || solved || timeUp) return;
    socket.emit('answer_text', g);
    setGuess('');
  };

  return (
    <>
      <TimerBar endsAt={round.endsAt} totalMs={round.seconds * 1000} />
      <div className="card question-card">
        <span className="category-chip">Hint: {round.hint}</span>
        <div className="scramble-letters">
          {round.scrambled!.split('').map((ch, i) => (
            <span key={i} className="scramble-letter">{ch}</span>
          ))}
        </div>
        <p className="hint">Unscramble the {round.answerLength}-letter word</p>

        {solved ? (
          <p className="my-result good">✅ Got it! Waiting for the others…</p>
        ) : !canAnswer ? (
          <p className="locked-note">🧢 Your captain types the answer — tell them below.</p>
        ) : timeUp ? (
          <p className="locked-note">⏱ Time's up!</p>
        ) : (
          <form className="join-row" onSubmit={submit}>
            <input
              className="input input-code"
              placeholder="TYPE YOUR GUESS"
              maxLength={round.answerLength}
              value={guess}
              onChange={(e) => setGuess(e.target.value.toUpperCase())}
              autoFocus
            />
            <button className="btn btn-primary" type="submit">Try</button>
          </form>
        )}
      </div>
    </>
  );
}
