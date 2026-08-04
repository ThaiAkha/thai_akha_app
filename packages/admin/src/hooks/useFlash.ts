import { useCallback, useRef, useState } from 'react';

export interface FlashPoint {
  id: number;
  x: number;
  y: number;
}

/**
 * Shared "luminous flash" interaction used by clickable cards/links across the
 * admin app. Mirrors the front RippleLink behavior and reuses the existing
 * `.btn-flash-ripple` / `.btn-flash-glow` CSS (styles/utilities.css).
 *
 * Does NOT call preventDefault — native anchor behavior (incl. cmd/ctrl+click
 * → new tab) is preserved; the flash only renders an overlay on click.
 */
export function useFlash(enabled = true) {
  const [flashes, setFlashes] = useState<FlashPoint[]>([]);
  const idRef = useRef(0);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!enabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--flash-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    e.currentTarget.style.setProperty('--flash-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }, [enabled]);

  const onClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!enabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = ++idRef.current;
    setFlashes(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setFlashes(prev => prev.filter(f => f.id !== id)), 600);
  }, [enabled]);

  return { flashes, onMouseMove, onClick };
}
