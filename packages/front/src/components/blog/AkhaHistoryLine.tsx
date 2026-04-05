import React from 'react';
import AkhaPixelPattern from '../ui/AkhaPixelPattern';
import { cn } from '@thaiakha/shared/lib/utils';

// ─── Pattern & Colors ────────────────────────────────────────────────────────

// Riga singola 20 celle — codici 5-8 (non collidono con la palette default 0-4)
const HISTORY_LINE_DATA = [
  5, 6, 7, 8, 5, 6, 7, 8, 5, 6,
  7, 8, 5, 6, 7, 8, 5, 6, 7, 8, 5, 6, 7, 8, 5, 6, 7, 8,
];
const HISTORY_LINE_COLS = 28;

const HISTORY_COLOR_MAP: Record<number, string> = {
  0: 'bg-transparent',
  5: 'bg-[#9A0050] shadow-[0_0_2px_#9A0050]', // quiz-p — Deep Magenta
  6: 'bg-[#3B227A] shadow-[0_0_2px_#3B227A]', // quiz-s — Deep Purple
  7: 'bg-[#FF6D00] shadow-[0_0_2px_#FF6D00]', // btn-p  — Orange
  8: 'bg-white shadow-[0_0_2px_white]',
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface AkhaHistoryLineProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

const AkhaHistoryLine: React.FC<AkhaHistoryLineProps> = ({
  className,
  size = 10,
  animate = true,
}) => (
  <div className={cn(
    'flex justify-center items-center [gap:var(--space-fluid-s)] py-12 overflow-hidden w-full',
    className
  )}>
    {/* Linea sinistra (specchiata) */}
    <div className="flex-1 flex justify-end overflow-hidden">
      <AkhaPixelPattern
        data={HISTORY_LINE_DATA}
        columns={HISTORY_LINE_COLS}
        size={size}
        expandFromCenter
        animateInView={animate}
        colorMap={HISTORY_COLOR_MAP}
        className="scale-x-[-1]"
      />
    </div>

    {/* Fiore centrale */}
    <AkhaPixelPattern
      variant="flower"
      size={size}
      animateInView={animate}
    />

    {/* Linea destra */}
    <div className="flex-1 overflow-hidden">
      <AkhaPixelPattern
        data={HISTORY_LINE_DATA}
        columns={HISTORY_LINE_COLS}
        size={size}
        expandFromCenter
        animateInView={animate}
        colorMap={HISTORY_COLOR_MAP}
      />
    </div>
  </div>
);

export default AkhaHistoryLine;
