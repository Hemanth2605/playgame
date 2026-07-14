import { useNow } from '../hooks';

export default function TimerBar({ endsAt, totalMs }: { endsAt: number; totalMs: number }) {
  const now = useNow();
  const remainingMs = Math.max(0, endsAt - now);
  const remainingSec = Math.ceil(remainingMs / 1000);
  const pct = Math.min(100, (remainingMs / totalMs) * 100);

  return (
    <>
      <div className="timer-track">
        <div
          className={`timer-fill ${remainingSec <= 5 ? 'urgent' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="timer-label">{remainingMs <= 0 ? "Time's up!" : `${remainingSec}s`}</div>
    </>
  );
}
