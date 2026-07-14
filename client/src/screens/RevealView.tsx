import type { Player, RoomState } from '../../../shared/types';
import { useNow } from '../hooks';
import TeamBar from './TeamBar';
import GameFooter from './GameFooter';
import { OPTION_TAGS } from './QuizRound';

interface Props {
  room: RoomState;
  me: Player;
  onLeave: () => void;
}

export default function RevealView({ room, me, onLeave }: Props) {
  const reveal = room.reveal!;
  const round = reveal.round;
  const now = useNow(250);
  const nextIn = Math.max(0, Math.ceil((reveal.nextAt - now) / 1000));

  const mine = reveal.results.find((r) => r.playerId === me.id);
  const scorers = reveal.results.filter((r) => r.correct);

  let myLine: { good: boolean; text: string };
  if (round.game === 'persona') {
    const winner = reveal.results[0];
    if (mine?.correct) myLine = { good: true, text: `🏆 You got it first! +${mine.points} points for ${me.team.toUpperCase()}` };
    else if (winner) myLine = { good: false, text: `⚡ ${winner.name} (${winner.team.toUpperCase()}) got it first` };
    else myLine = { good: false, text: '🤷 Nobody cracked this one' };
  } else if (round.game === 'reaction') {
    if (mine?.correct) myLine = { good: true, text: `⚡ ${mine.reactionMs}ms — +${mine.points} points for ${me.team.toUpperCase()}` };
    else if (mine?.falseStart) myLine = { good: false, text: '😬 False start — no points this round' };
    else myLine = { good: false, text: '⏱ You missed the tap window' };
  } else if (mine) {
    myLine = mine.correct
      ? { good: true, text: `✅ Correct! +${mine.points} points for ${me.team.toUpperCase()}` }
      : { good: false, text: '❌ Wrong answer — streak reset' };
  } else {
    myLine = { good: false, text: round.game === 'scramble' ? "😅 Didn't crack it this time" : "😴 You didn't answer in time" };
  }

  return (
    <div className="game">
      <TeamBar room={room} progress={`Round ${round.index + 1}/${round.total}`} />

      <div className="card question-card">
        {round.game === 'quiz' && (
          <>
            <span className="category-chip">{round.category}</span>
            <h2 className="question-text">{round.text}</h2>
            <div className="options-grid">
              {round.options!.map((opt, i) => {
                const isCorrect = i === reveal.correctIndex;
                const isMyWrongPick = mine && !mine.correct && mine.optionIndex === i;
                return (
                  <div
                    key={i}
                    className={`option reveal ${isCorrect ? 'correct' : ''} ${isMyWrongPick ? 'wrong' : ''}`}
                  >
                    <span className="option-tag">{OPTION_TAGS[i]}</span> {opt}
                    {isCorrect && ' ✓'}
                    {isMyWrongPick && ' ✗'}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {round.game === 'scramble' && (
          <>
            <span className="category-chip">Hint: {round.hint}</span>
            <p className="hint" style={{ margin: 0 }}>The word was</p>
            <div className="scramble-letters">
              {reveal.correctWord!.split('').map((ch, i) => (
                <span key={i} className="scramble-letter solved">{ch}</span>
              ))}
            </div>
          </>
        )}

        {round.game === 'persona' && (
          <>
            <span className="category-chip">Hint: {round.hint}</span>
            <div className="persona-pic">
              {round.emojis!.map((em, i) => (
                <span key={i} className="persona-part">
                  {i > 0 && <span className="persona-plus">+</span>}
                  <span className="persona-emoji">{em}</span>
                </span>
              ))}
              <span className="persona-plus">=</span>
            </div>
            <div className="scramble-letters">
              {reveal.correctWord!.split('').map((ch, i) => (
                <span key={i} className={`scramble-letter solved ${ch === ' ' || ch === '-' ? 'gap' : ''}`}>{ch}</span>
              ))}
            </div>
          </>
        )}

        {round.game === 'reaction' && (
          <>
            <span className="category-chip">Reaction Rush</span>
            <h2 className="question-text">Fastest fingers</h2>
            <ul className="reaction-results">
              {reveal.results.map((r) => (
                <li key={r.playerId} className={`scorer ${r.team}`}>
                  {r.name}{' '}
                  {r.falseStart ? <b>false start</b> : r.correct ? <b>{r.reactionMs}ms · +{r.points}</b> : <b>—</b>}
                </li>
              ))}
              {reveal.results.length === 0 && <li className="hint">Nobody tapped 😴</li>}
            </ul>
          </>
        )}

        <div className="round-points">
          <span className="round-points-red">RED +{reveal.roundPoints.red}</span>
          <span className="round-points-blue">BLUE +{reveal.roundPoints.blue}</span>
        </div>

        <p className={`my-result ${myLine.good ? 'good' : 'bad'}`}>{myLine.text}</p>

        {round.game !== 'reaction' && scorers.length > 0 && (
          <ul className="scorers">
            {scorers.map((r) => (
              <li key={r.playerId} className={`scorer ${r.team}`}>
                {r.name} <b>+{r.points}</b>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="answer-progress">
        {reveal.isLast ? 'Final results' : 'Next round'} in {nextIn}s…
      </p>

      <GameFooter me={me} onLeave={onLeave} />
    </div>
  );
}
