import type { Player, RoomState } from '../../../shared/types';
import { socket } from '../socket';
import { useCountUp } from '../hooks';
import { GAMES, gameInfo } from '../games';
import Confetti from './Confetti';

interface Props {
  room: RoomState;
  me: Player;
  onLeave: () => void;
}

/** Podium order: 2nd on the left, 1st in the middle and tallest, 3rd on the right. */
const PODIUM_ORDER = [1, 0, 2];
const MEDALS = ['🥇', '🥈', '🥉'];
const PLACE_CLASS = ['first', 'second', 'third'];

export default function FinalView({ room, me, onLeave }: Props) {
  const { red, blue } = room.teamScores;
  const winner = room.winner;
  const iWon = winner !== 'tie' && winner === me.team;

  const max = Math.max(red, blue, 1);
  const redShown = useCountUp(red);
  const blueShown = useCountUp(blue);

  // The podium belongs to the winners — only their players are celebrated here.
  // A tie has no winning side, so fall back to the whole room.
  const eligible =
    winner && winner !== 'tie' ? room.players.filter((p) => p.team === winner) : room.players;
  const podium = [...eligible].sort((a, b) => b.score - a.score).slice(0, 3);
  const champion = podium[0];
  const podiumTitle =
    winner && winner !== 'tie' ? `${winner.toUpperCase()} team podium` : 'Podium';

  return (
    <div className={`final winner-${winner ?? 'none'}`}>
      {winner && <Confetti winner={winner} />}

      <div className="final-hero">
        {winner !== 'tie' && <div className="trophy">🏆</div>}
        <h1 className={`winner-banner ${winner ?? ''}`}>
          {winner === 'tie' ? "IT'S A TIE!" : `${winner?.toUpperCase()} TEAM WINS!`}
        </h1>
        {winner !== 'tie' && (
          <p className="winner-sub">
            {iWon ? '🎉 Your team takes the crown!' : 'So close — get them next time.'}
          </p>
        )}
        {winner === 'tie' && <p className="winner-sub">🤝 Dead even. Nobody blinked.</p>}
      </div>

      <div className="card final-card">
        <div className="final-bars">
          <div className="final-bar-row">
            <span className="final-bar-label red">RED</span>
            <div className="final-bar-track">
              <div className={`final-bar red ${winner === 'red' ? 'is-winner' : ''}`} style={{ width: `${(red / max) * 100}%` }} />
            </div>
            <span className="final-bar-score">{redShown}</span>
          </div>
          <div className="final-bar-row">
            <span className="final-bar-label blue">BLUE</span>
            <div className="final-bar-track">
              <div className={`final-bar blue ${winner === 'blue' ? 'is-winner' : ''}`} style={{ width: `${(blue / max) * 100}%` }} />
            </div>
            <span className="final-bar-score">{blueShown}</span>
          </div>
        </div>

        {champion && (
          <>
            <h3 className="mvp-title">{podiumTitle}</h3>
            <div className="podium">
              {PODIUM_ORDER.map((place) => {
                const p = podium[place];
                if (!p) return null;
                return (
                  <div key={p.id} className={`podium-col ${PLACE_CLASS[place]}`}>
                    <span className="podium-medal">{MEDALS[place]}</span>
                    <span className={`podium-name ${p.team}`}>
                      {p.name}
                      {p.id === me.id && <span className="me-tag"> (you)</span>}
                    </span>
                    <span className="podium-score">{p.score}</span>
                    <div className={`podium-block ${p.team}`} />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="card next-game">
        <h3 className="mvp-title">Play again — same room, same teams</h3>
        <p className="next-game-code">
          Room <b>{room.code}</b> stays open. Nobody needs to rejoin.
        </p>

        {me.isHost ? (
          <>
            <button className="btn btn-primary btn-big" onClick={() => socket.emit('play_again', room.game)}>
              🔁 Rematch — {gameInfo(room.game).emoji} {gameInfo(room.game).name}
            </button>
            <p className="next-game-or">or pick a different game</p>
            <div className="game-list">
              {GAMES.filter((g) => g.id !== room.game).map((g) => (
                <button
                  key={g.id}
                  className="game-card"
                  onClick={() => socket.emit('play_again', g.id)}
                >
                  <span className="game-emoji">{g.emoji}</span>
                  <span className="game-name">{g.name}</span>
                  <span className="game-desc">{g.description}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="hint">Waiting for the host to pick the next game…</p>
            <div className="game-list">
              {GAMES.map((g) => (
                <div key={g.id} className={`game-card ${g.id === room.game ? 'selected' : ''}`}>
                  <span className="game-emoji">{g.emoji}</span>
                  <span className="game-name">{g.name}</span>
                  <span className="game-desc">{g.description}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <button className="btn btn-link" onClick={onLeave}>Leave room</button>
    </div>
  );
}
