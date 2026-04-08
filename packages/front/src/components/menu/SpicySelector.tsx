import React from 'react';
import { Typography } from '../ui/Typography';
import { Icon } from '../ui';
import type { SpicinessLevel } from '@thaiakha/shared/types';

const FALLBACK_LEVELS: SpicinessLevel[] = [
  { id: 1, title: 'Farang', description: '', icon: '', color_code: '#22C55E' },
  { id: 2, title: 'Thai Smile', description: '', icon: '', color_code: '#84CC16' },
  { id: 3, title: 'Respect!', description: '', icon: '', color_code: '#F59E0B' },
  { id: 4, title: 'Thai Spicy', description: '', icon: '', color_code: '#EF4444' },
  { id: 5, title: 'Akha Warrior', description: '', icon: '', color_code: '#DC2626' },
];

interface SpicySelectorProps {
  options?: SpicinessLevel[];
  selected: number;
  onChange: (id: number) => void;
}

const SpicySelector: React.FC<SpicySelectorProps> = ({ options, selected, onChange }) => {
  const levels = (options && options.length > 0) ? options : FALLBACK_LEVELS;
  const current = levels.find(l => l.id === selected) ?? null;
  const color = current?.color_code ?? '#E31F33';
  const hasSelection = current !== null && selected !== 0;

  return (
    <div className="[display:flex] [flex-direction:column] [gap:var(--space-fluid-xs)]">

      {/* Title — placeholder or selected level */}
      {hasSelection ? (
        <div className="flex items-baseline justify-center flex-wrap [gap:var(--space-fluid-2xs)]">
          <Typography variant="h4" color="title">
            Your Spicy Level:
          </Typography>
          <p
            className="[font-size:var(--text-fluid-h4)] font-black font-display uppercase leading-tight transition-colors duration-500"
            style={{ color }}
          >
            {current!.title}
          </p>
        </div>
      ) : (
        <Typography variant="h4" color="title" className="text-center">
          Select your Spicy Level
        </Typography>
      )}

      {/* Card */}
      <div
        className="rounded-3xl border overflow-hidden transition-all duration-500"
        style={{ borderColor: `${color}60`, backgroundColor: `${color}0D` }}
      >
        <div className="[padding:var(--space-fluid-m)]">

          {/* 5-chip grid — 3 cols on mobile, 5 on sm+ */}
          <div className="grid grid-cols-3 lg:grid-cols-5 [gap:var(--space-fluid-xs)]">
            {levels.map(lvl => {
              const isActive = lvl.id === selected;
              const lvlColor = lvl.color_code ?? '#E31F33';
              const mobileLabel = lvl.title.split(' ')[0];
              return (
                <button
                  key={lvl.id}
                  onClick={() => onChange(lvl.id)}
                  className="flex flex-col items-center justify-center [gap:var(--space-fluid-xs)] [padding:var(--space-fluid-xs)] rounded-2xl border transition-all duration-300 hover:scale-[1.03] active:scale-95 !bg-surface !border-border"
                  style={isActive ? {
                    backgroundColor: `${lvlColor}12`,
                    borderColor: `${lvlColor}80`,
                  } : undefined}
                >
                  <Icon
                    name={isActive ? 'check_circle' : 'radio_button_unchecked'}
                    size="md"
                    style={{ color: isActive ? lvlColor : undefined }}
                    className={isActive ? '' : 'text-muted'}
                  />
                  <span
                    className="[font-size:var(--text-fluid-chip)] font-accent font-black uppercase tracking-widest leading-none text-center"
                    style={{ color: isActive ? lvlColor : undefined }}
                  >
                    <span className="hidden sm:inline">{lvl.title}</span>
                    <span className="sm:hidden">{mobileLabel}</span>
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SpicySelector;
