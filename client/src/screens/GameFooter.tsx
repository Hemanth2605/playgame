import { useEffect, useRef, useState } from 'react';
import type { Player } from '../../../shared/types';
import { socket } from '../socket';

interface Props {
  me: Player;
  onLeave: () => void;
}

/** Exit controls shown during a match: leave for yourself, end for everyone (host).
 *  Both need a second tap so nobody quits by accident mid-round. */
export default function GameFooter({ me, onLeave }: Props) {
  const [confirming, setConfirming] = useState<'leave' | 'end' | null>(null);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const arm = (which: 'leave' | 'end') => {
    setConfirming(which);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setConfirming(null), 3000);
  };

  const clickLeave = () => {
    if (confirming === 'leave') onLeave();
    else arm('leave');
  };

  const clickEnd = () => {
    if (confirming === 'end') {
      socket.emit('end_match');
      setConfirming(null);
    } else {
      arm('end');
    }
  };

  return (
    <div className="game-footer">
      <button className={`btn btn-small ${confirming === 'leave' ? 'danger' : ''}`} onClick={clickLeave}>
        {confirming === 'leave' ? 'Tap again to exit' : '🚪 Exit game'}
      </button>
      {me.isHost && (
        <button className={`btn btn-small ${confirming === 'end' ? 'danger' : ''}`} onClick={clickEnd}>
          {confirming === 'end' ? 'Tap again to end for all' : '⏹ End match for all'}
        </button>
      )}
    </div>
  );
}
