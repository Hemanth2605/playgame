import { useEffect, useRef, useState } from 'react';

/** Re-renders on a fixed tick — used for live countdowns. */
export function useNow(intervalMs = 100): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}

/** True when the player has asked their OS for less animation. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  );
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/** Animates 0 → target so the final scores tick up instead of just appearing. */
export function useCountUp(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(0);
  const frame = useRef<number>(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || durationMs <= 0) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      // Ease-out so it decelerates into the final number.
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, durationMs, reduced]);

  return value;
}
