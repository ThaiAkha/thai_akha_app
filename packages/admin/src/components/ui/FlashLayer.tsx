import React from 'react';
import type { FlashPoint } from '../../hooks/useFlash';

interface FlashLayerProps {
  flashes: FlashPoint[];
  /** Render the soft hover glow (follows --flash-x/--flash-y). Default true. */
  glow?: boolean;
}

/**
 * Renders the flash overlay (hover glow + click ripples) for any container that
 * is `relative overflow-hidden isolate`. Pair with the useFlash() hook.
 */
export const FlashLayer: React.FC<FlashLayerProps> = ({ flashes, glow = true }) => (
  <>
    {glow && <span className="btn-flash-glow pointer-events-none" aria-hidden="true" />}
    {flashes.map(f => (
      <span
        key={f.id}
        className="btn-flash-ripple pointer-events-none"
        style={{ top: f.y, left: f.x } as React.CSSProperties}
        aria-hidden="true"
      />
    ))}
  </>
);

export default FlashLayer;
