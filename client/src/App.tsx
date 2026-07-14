import { useEffect, useRef, useState } from 'react';
import type { JoinAck, RoomState } from '../../shared/types';
import { socket } from './socket';
import Landing from './screens/Landing';
import Lobby from './screens/Lobby';
import RoundView from './screens/RoundView';
import RevealView from './screens/RevealView';
import FinalView from './screens/FinalView';

const SESSION_KEY = 'quizclash-session';

function saveSession(code: string, playerId: string) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ code, playerId }));
}
function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export default function App() {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [connected, setConnected] = useState(socket.connected);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onState = (s: RoomState) => setRoom(s);
    const onToast = (m: string) => {
      setToast(m);
      window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(null), 3000);
    };
    const onConnect = () => {
      setConnected(true);
      // Survive a page refresh or a dropped connection mid-game.
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { code: string; playerId: string };
      socket.emit('rejoin', saved.code, saved.playerId, (res: JoinAck) => {
        if (res.ok) {
          setPlayerId(res.playerId);
        } else {
          clearSession();
          setRoom(null);
          setPlayerId(null);
        }
      });
    };
    const onDisconnect = () => setConnected(false);

    socket.on('room_state', onState);
    socket.on('toast', onToast);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    if (socket.connected) onConnect();
    return () => {
      socket.off('room_state', onState);
      socket.off('toast', onToast);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleJoined = (res: Extract<JoinAck, { ok: true }>) => {
    setPlayerId(res.playerId);
    saveSession(res.code, res.playerId);
  };

  const handleLeave = () => {
    socket.emit('leave_room');
    clearSession();
    setRoom(null);
    setPlayerId(null);
  };

  const me = room && playerId ? room.players.find((p) => p.id === playerId) : undefined;

  let screen;
  if (!room || !me) {
    screen = <Landing onJoined={handleJoined} />;
  } else if (room.phase === 'lobby') {
    screen = <Lobby room={room} me={me} onLeave={handleLeave} />;
  } else if (room.phase === 'question' && room.round) {
    screen = <RoundView key={`${room.game}-${room.round.index}`} room={room} me={me} onLeave={handleLeave} />;
  } else if (room.phase === 'reveal' && room.reveal) {
    screen = <RevealView room={room} me={me} onLeave={handleLeave} />;
  } else if (room.phase === 'final') {
    screen = <FinalView room={room} me={me} onLeave={handleLeave} />;
  } else {
    screen = <Landing onJoined={handleJoined} />;
  }

  return (
    <div className="app">
      {!connected && <div className="banner-offline">Reconnecting to server…</div>}
      {screen}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
