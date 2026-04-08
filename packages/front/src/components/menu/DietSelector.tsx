import React from 'react';
import { Typography } from '../ui/Typography';
import Chip from '../ui/navigation/Chip';

export interface DietOption {
  id: string;
  name: string;
  icon: string;
  type: 'lifestyle' | 'religious';
}

interface DietSelectorProps {
  options: DietOption[];
  selected: string;
  onChange: (id: string) => void;
}

/** Strip " Diet" suffix (case-insensitive) from label */
const stripDiet = (str: string) => str.replace(/\s*diet\s*/gi, '').trim();

/** First word only — used as mobile label */
const firstWord = (str: string) => str.split(' ')[0];

const DietSelector: React.FC<DietSelectorProps> = ({ options, selected, onChange }) => {
  const lifestyle = options.filter(o => o.type === 'lifestyle');
  const religious = options.filter(o => o.type === 'religious');
  const current = options.find(o => o.id === selected);
  const isLifestyleSelected = current?.type === 'lifestyle';
  const selectedColor = isLifestyleSelected ? 'var(--color-action)' : 'var(--color-diet-cultural)';

  const renderRow = (items: DietOption[], isLifestyle: boolean) => {
    const chipClass = (isActive: boolean) => [
      'w-full [font-size:var(--text-fluid-chip-lg)] border ![padding:var(--space-fluid-xs)]',
      isLifestyle
        ? isActive
          ? '!bg-action/10 !border-action !text-action !shadow-none'
          : '!bg-surface !border-border !text-action hover:!bg-action/5 hover:!border-action/40'
        : isActive
          ? '!bg-secondary/10 !border-secondary ![color:var(--color-diet-cultural)] !shadow-none'
          : '!bg-surface !border-border ![color:var(--color-diet-cultural)] hover:!bg-secondary/5 hover:!border-secondary/40',
    ].join(' ');

    return (
      <div className="grid grid-cols-3 lg:grid-cols-5 [gap:var(--space-fluid-xs)]">
        {items.map(opt => {
          const isActive = selected === opt.id;
          const label = firstWord(stripDiet(opt.name));
          return (
            <Chip
              key={opt.id}
              label={label}
              active={isActive}
              onClick={() => onChange(opt.id)}
              icon={isActive ? 'check_circle' : 'radio_button_unchecked'}
              vertical
              className={chipClass(isActive)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="[display:flex] [flex-direction:column] [gap:var(--space-fluid-xs)]">
      {/* Title — placeholder or selected diet */}
      {current ? (
        <div className="flex items-baseline justify-center flex-wrap [gap:var(--space-fluid-2xs)]">
          <Typography variant="h4" color="title">
            Your Dietary Style:
          </Typography>
          <p
            className="[font-size:var(--text-fluid-h4)] font-black font-display uppercase leading-tight transition-colors duration-500"
            style={{ color: selectedColor }}
          >
            {stripDiet(current.name)}
          </p>
        </div>
      ) : (
        <Typography variant="h4" color="title" className="text-center">
          Select your Dietary Style
        </Typography>
      )}

      {/* Card */}
      <div className="rounded-3xl border border-border overflow-hidden">
        <div className="[padding:var(--space-fluid-m)] [display:flex] [flex-direction:column] [gap:var(--space-fluid-s)]">
          {renderRow(lifestyle, true)}
          {renderRow(religious, false)}
        </div>
      </div>
    </div>
  );
};

export default DietSelector;
