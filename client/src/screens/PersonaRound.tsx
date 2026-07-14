import { FormEvent, useState } from 'react';
import type { Player, PublicRound } from '../../../shared/types';
import { socket } from '../socket';
import { useNow } from '../hooks';
import TimerBar from './TimerBar';

export default function PersonaRound({ round, me }: { round: PublicRound; me: Player }) {
  const now = useNow();
  const [guess, setGuess] = useState('');

  const timeUp = now >= round.endsAt;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const g = guess.trim();
    if (!g || timeUp) return;
    socket.emit('answer_text', g);
    setGuess('');
  };

  return (
    <>
      <TimerBar endsAt={round.endsAt} totalMs={round.seconds * 1000} />
      <div className="card question-card">
        <span className="category-chip">Hint: {round.hint}</span>
        <div className="persona-pic">
          {round.emojis!.map((em, i) => (
            <span key={i} className="persona-part">
              {i > 0 && <span className="persona-plus">+</span>}
              <span className="persona-emoji">{em}</span>
            </span>
          ))}
        </div>
        <p className="hint">Who is this? <b>First correct answer wins the round!</b></p>

        {timeUp ? (
          <p className="locked-note">⏱ Time's up!</p>
        ) : (
          <form className="join-row" onSubmit={submit}>
            <input
              className="input input-code"
              placeholder="TYPE YOUR ANSWER"
              value={guess}
              onChange={(e) => setGuess(e.target.value.toUpperCase())}
              autoFocus
            />
            <button className="btn btn-primary" type="submit">Go!</button>
          </form>
        )}
      </div>
    </>
  );
}
