import { FormEvent, useState } from 'react';
import type { JoinAck } from '../../../shared/types';
import { socket } from '../socket';

const NAME_KEY = 'quizclash-name';

interface Props {
  onJoined: (res: Extract<JoinAck, { ok: true }>) => void;
}

export default function Landing({ onJoined }: Props) {
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) ?? '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const withAck = (res: JoinAck) => {
    setBusy(false);
    if (res.ok) onJoined(res);
    else setError(res.error);
  };

  const validateName = () => {
    const n = name.trim();
    if (!n) { setError('Enter your name first.'); return null; }
    localStorage.setItem(NAME_KEY, n);
    return n;
  };

  const create = () => {
    const n = validateName();
    if (!n) return;
    setError('');
    setBusy(true);
    socket.emit('create_room', n, withAck);
  };

  const join = (e: FormEvent) => {
    e.preventDefault();
    const n = validateName();
    if (!n) return;
    if (!code.trim()) { setError('Enter the room code you were given.'); return; }
    setError('');
    setBusy(true);
    socket.emit('join_room', code.trim().toUpperCase(), n, withAck);
  };

  return (
    <div className="landing">
      <h1 className="logo">
        <span className="logo-red">QUIZ</span> <span className="logo-blue">CLASH</span>
      </h1>
      <p className="tagline">Red vs Blue — pick a game, battle live: 🧠 Quiz · 🔤 Scramble · ⚡ Reaction · 🕵️ Persona</p>

      <div className="card">
        <label className="field-label" htmlFor="name">Your name</label>
        <input
          id="name"
          className="input"
          maxLength={16}
          placeholder="e.g. Hemanth"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button className="btn btn-primary" onClick={create} disabled={busy}>
          Create a room
        </button>

        <div className="divider"><span>or join your team</span></div>

        <form className="join-row" onSubmit={join}>
          <input
            className="input input-code"
            placeholder="ROOM CODE"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <button className="btn btn-secondary" type="submit" disabled={busy}>
            Join
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </div>

      <p className="hint">One person creates the room, shares the code, everyone else joins. Works for 2–16 players.</p>
    </div>
  );
}
