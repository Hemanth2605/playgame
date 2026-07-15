import { FormEvent, useEffect, useRef, useState } from 'react';
import type { ChatMessage, Player } from '../../../shared/types';
import { socket } from '../socket';

interface Props {
  me: Player;
  messages: ChatMessage[];
  /** Shown above the input — e.g. telling non-captains to brief their captain. */
  note?: string;
}

export default function TeamChat({ me, messages, note }: Props) {
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as the discussion moves.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    socket.emit('chat', t);
    setText('');
  };

  return (
    <div className={`card team-chat team-${me.team}`}>
      <div className="team-chat-head">
        <span className="team-chat-title">
          {me.team === 'red' ? '🔴 RED' : '🔵 BLUE'} team chat
        </span>
        <span className="team-chat-privacy">only your team can see this</span>
      </div>

      <div className="team-chat-log">
        {messages.length === 0 && (
          <p className="team-chat-empty">No messages yet — talk it through!</p>
        )}
        {messages.map((m) => (
          <p key={m.id} className={`team-chat-msg ${m.playerId === me.id ? 'mine' : ''}`}>
            <span className="team-chat-name">{m.name}</span> {m.text}
          </p>
        ))}
        <div ref={endRef} />
      </div>

      {note && <p className="team-chat-note">{note}</p>}

      <form className="team-chat-row" onSubmit={send}>
        <input
          className="input"
          placeholder="Message your team…"
          maxLength={200}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-ghost" type="submit">Send</button>
      </form>
    </div>
  );
}
