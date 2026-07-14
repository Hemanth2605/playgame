import { useState } from 'react';
import type { Player, RoomState, Team } from '../../../shared/types';
import { socket } from '../socket';
import { GAMES, gameInfo } from '../games';

interface Props {
  room: RoomState;
  me: Player;
  onLeave: () => void;
}

function TeamColumn({ team, players, meId }: { team: Team; players: Player[]; meId: string }) {
  return (
    <div className={`team-col team-${team}`}>
      <h3 className="team-title">{team === 'red' ? 'RED' : 'BLUE'} <span className="team-count">({players.length})</span></h3>
      <ul className="player-list">
        {players.map((p) => (
          <li key={p.id} className={`player-chip ${p.connected ? '' : 'offline'} ${p.id === meId ? 'is-me' : ''}`}>
            {p.isHost && <span title="Host">👑 </span>}
            {p.name}
            {p.id === meId && <span className="me-tag"> (you)</span>}
          </li>
        ))}
        {players.length === 0 && <li className="player-chip empty">nobody yet</li>}
      </ul>
    </div>
  );
}

export default function Lobby({ room, me, onLeave }: Props) {
  const [copied, setCopied] = useState(false);
  const isHost = me.isHost;
  const red = room.players.filter((p) => p.team === 'red');
  const blue = room.players.filter((p) => p.team === 'blue');
  const selected = gameInfo(room.game);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard needs a secure context; the big code on screen is the fallback.
    }
  };

  const setSettings = (patch: Partial<RoomState['settings']>) => {
    socket.emit('update_settings', { ...room.settings, ...patch });
  };

  return (
    <div className="lobby">
      <div className="room-code-box">
        <span className="room-code-label">ROOM CODE</span>
        <button className="room-code" onClick={copyCode} title="Copy to clipboard">
          {room.code} {copied ? '✓' : '⧉'}
        </button>
        <span className="room-code-hint">share this with your friends</span>
      </div>

      <div className="teams-grid">
        <TeamColumn team="red" players={red} meId={me.id} />
        <div className="vs-badge">VS</div>
        <TeamColumn team="blue" players={blue} meId={me.id} />
      </div>

      <div className="lobby-actions">
        <button className="btn btn-ghost" onClick={() => socket.emit('switch_team')}>
          Switch to {me.team === 'red' ? 'Blue' : 'Red'}
        </button>
        {isHost && (
          <button className="btn btn-ghost" onClick={() => socket.emit('shuffle_teams')}>
            🔀 Shuffle teams
          </button>
        )}
      </div>

      <h3 className="section-title">{isHost ? 'Pick a game' : 'Game'}</h3>
      <div className="game-list">
        {GAMES.map((g) => {
          const isSelected = g.id === room.game;
          if (!isHost && !isSelected) return null;
          return (
            <button
              key={g.id}
              className={`game-card ${isSelected ? 'selected' : ''}`}
              onClick={() => isHost && socket.emit('select_game', g.id)}
              disabled={!isHost}
            >
              <span className="game-emoji">{g.emoji}</span>
              <span className="game-name">{g.name} {isSelected && '✓'}</span>
              <span className="game-desc">{g.description}</span>
            </button>
          );
        })}
      </div>

      {isHost ? (
        <div className="card host-panel">
          <div className="settings-row">
            <label>
              Rounds
              <select
                className="select"
                value={room.settings.rounds}
                onChange={(e) => setSettings({ rounds: Number(e.target.value) })}
              >
                {[5, 8, 10, 12, 15].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            {room.game === 'persona' && (
              <span className="hint" style={{ alignSelf: 'center' }}>⏱ 90s per round</span>
            )}
            {room.game !== 'reaction' && room.game !== 'persona' && (
              <label>
                Time per round
                <select
                  className="select"
                  value={room.settings.secondsPerQuestion}
                  onChange={(e) => setSettings({ secondsPerQuestion: Number(e.target.value) })}
                >
                  {[10, 15, 20, 25, 30].map((n) => <option key={n} value={n}>{n}s</option>)}
                </select>
              </label>
            )}
          </div>
          <button className="btn btn-primary btn-big" onClick={() => socket.emit('start_game')}>
            ▶ Start {selected.name}
          </button>
        </div>
      ) : (
        <p className="hint">Waiting for the host to start {selected.emoji} {selected.name}…</p>
      )}

      <button className="btn btn-link" onClick={onLeave}>Leave room</button>
    </div>
  );
}
