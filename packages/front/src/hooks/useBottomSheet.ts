/**
 * useBottomSheet — sheet mobile trascinabile con snap states.
 * Pattern canonico della skill mobile-ux (references/patterns.md).
 *
 * Il consumer applica `liveHeightPx` come altezza (via CSS var + classe
 * `h-[var(--sheet-h)] lg:h-auto` così il desktop resta sidebar) e spalma
 * `handleProps` sulla saponetta di drag.
 */

import { useRef, useState, useCallback } from 'react';

export type SnapState = 'collapsed' | 'half' | 'full';

export interface SnapHeights {
  collapsed: number;
  half: number;
  full: number;
}

/** Altezze in % di dvh — default tarate su PickUpPage. */
const DEFAULT_HEIGHTS: SnapHeights = {
  collapsed: 14, // saponetta + titolo
  half: 55,      // ricerca hotel + zone card, mappa protagonista
  full: 92,      // form completo
};

/** Se il drag supera questa % dello schermo, snappa allo stato successivo. */
const DRAG_THRESHOLD = 8;

const SNAP_ORDER: SnapState[] = ['collapsed', 'half', 'full'];

export function useBottomSheet(
  initial: SnapState = 'half',
  heights: SnapHeights = DEFAULT_HEIGHTS,
) {
  const [snap, setSnap] = useState<SnapState>(initial);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0); // px, positivo = trascinato giù

  const startY = useRef(0);
  const currentY = useRef(0);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    startY.current = e.clientY;
    currentY.current = e.clientY;
    setDragging(true);
    setDragOffset(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const delta = e.clientY - startY.current;
    currentY.current = e.clientY;
    setDragOffset(delta);
  }, [dragging]);

  const onPointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);

    const delta = currentY.current - startY.current;
    const thresholdPx = (DRAG_THRESHOLD / 100) * window.innerHeight;
    const currentIdx = SNAP_ORDER.indexOf(snap);

    if (delta < -thresholdPx && currentIdx < SNAP_ORDER.length - 1) {
      setSnap(SNAP_ORDER[currentIdx + 1]); // su → più aperto
    } else if (delta > thresholdPx && currentIdx > 0) {
      setSnap(SNAP_ORDER[currentIdx - 1]); // giù → più chiuso
    }
    setDragOffset(0); // altrimenti: spring back
  }, [dragging, snap]);

  const height = heights[snap];
  const liveHeightPx = dragging
    ? `calc(${height}dvh - ${dragOffset}px)`
    : `${height}dvh`;

  return {
    snap,
    setSnap,
    dragging,
    liveHeightPx,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      style: { touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' } as React.CSSProperties,
    },
  };
}
