import type { Player, RoomState } from '../../../shared/types';
import { socket } from '../socket';

interface Props {
  room: RoomState;
  me: Player;
  onLeave: () => void;
}

export default function FinalView({ room, me, onLeave }: Props) {
  const { red, blue } = room.teamScores;
  const max = Math.max(red, blue, 1);
  const winner = room.winner;
  const iWon = winner !== 'tie' && winner === me.team;

  const mvps = [...room.players].sort((a, b) => b.score - a.score).slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="final">
      <h1 className={`winner-banner ${winner ?? ''}`}>
        {winner === 'tie'
          ? "🤝 IT'S A TIE!"
          : `🏆 ${winner?.toUpperCase()} TEAM WINS!`}
      </h1>
      {winner !== 'tie' && (
        <p className="winner-sub">{iWon ? 'Your team takes the crown! 🎉' : 'Better luck next round…'}</p>
      )}

      <div className="card">
        <div className="final-bars">
          <div className="final-bar-row">
            <span className="final-bar-label red">RED</span>
            <div className="final-bar-track">
              <div className="final-bar red" style={{ width: `${(red / max) * 100}%` }} />
            </div>
            <span className="final-bar-score">{red}</span>
          </div>
          <div className="final-bar-row">
            <span className="final-bar-label blue">BLUE</span>
            <div className="final-bar-track">
              <div className="final-bar blue" style={{ width: `${(blue / max) * 100}%` }} />
            </div>
            <span className="final-bar-score">{blue}</span>
          </div>
        </div>

        <h3 className="mvp-title">Top players</h3>
        <ul className="mvp-list">
          {mvps.map((p, i) => (
            <li key={p.id} className={`mvp ${p.team}`}>
              {medals[i]} {p.name} <b>{p.score}</b>
            </li>
          ))}
        </ul>
      </div>

      {me.isHost ? (
        <button className="btn btn-primary btn-big" onClick={() => socket.emit('play_again')}>
          🔁 Play again
        </button>
      ) : (
        <p className="hint">Waiting for the host to start a rematch…</p>
      )}
      <button className="btn btn-link" onClick={onLeave}>Leave room</button>
    </div>
  );
}
