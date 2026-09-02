import React from 'react';
import { Typography } from '../ui/Typography';
import { Icon, MediaImage } from '../ui';
import type { SpicinessLevel } from '@thaiakha/shared/types';

/**
 * Fallback di EMERGENZA — usato solo se il fetch di `spiciness_levels` fallisce.
 * ⚠️ Non è una seconda fonte: titoli e `color_code` sono allineati alla riga DB
 * (verificato 2026-08-04, task #70). Prima divergevano su tutti e 5 i colori
 * (#22C55E/#84CC16/#F59E0B/#EF4444/#DC2626) e sul titolo del livello 1.
 * Se cambi i colori nel DB, cambia anche qui — o il selettore mente quando il DB è giù.
 */
const FALLBACK_LEVELS: SpicinessLevel[] = [
  { id: 1, title: 'The Farang',   description: '', icon: '', color_code: '#81C784' },
  { id: 2, title: 'Thai Smile',   description: '', icon: '', color_code: '#FFD54F' },
  { id: 3, title: 'Respect!',     description: '', icon: '', color_code: '#FF9800' },
  { id: 4, title: 'Thai Spicy',   description: '', icon: '', color_code: '#E53935' },
  { id: 5, title: 'Akha Warrior', description: '', icon: '', color_code: '#880E4F' },
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

          {/* Level photo - resolved from media_assets via photo_asset_id; url from the
              service embed shows it instantly, the asset fetch enriches alt/caption */}
          {hasSelection && current?.photo_asset_id && (
            <MediaImage
              key={current.photo_asset_id}
              assetId={current.photo_asset_id}
              url={current.photo?.image_url}
              fallbackAlt={current.title}
              className="[margin-bottom:var(--space-fluid-s)]"
              imgClassName="aspect-video rounded-2xl"
            />
          )}

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
                  className="flex flex-col items-center justify-center [gap:var(--space-fluid-xs)] [padding:var(--space-fluid-xs)] pointer-coarse:min-h-11 rounded-2xl border transition-all duration-300 hover:scale-[1.03] active:scale-95 !bg-surface !border-border"
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
