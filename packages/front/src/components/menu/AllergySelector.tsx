import React, { useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Icon, Toggle } from '../ui';
import { Typography } from '../ui/Typography';
import Chip from '../ui/navigation/Chip';
import Alert from '../ui/card/Alert';

interface AllergySelectorProps {
  options: string[];
  selected: string[];
  onChange: (updated: string[]) => void;
  allergyMap?: Record<string, string>;
  showInfoCards?: boolean;
  /** Controlled mode: provide open + onOpenChange to manage toggle externally */
  open?: boolean;
  onOpenChange?: (val: boolean) => void;
}

const AllergySelector: React.FC<AllergySelectorProps> = ({
  options,
  selected,
  onChange,
  allergyMap = {},
  showInfoCards = false,
  open: openProp,
  onOpenChange,
}) => {
  const [openInternal, setOpenInternal] = useState(selected.length > 0);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openInternal;

  const toggle = (allergen: string) => {
    const key = allergen.toLowerCase();
    const updated = selected.map(a => a.toLowerCase()).includes(key)
      ? selected.filter(a => a.toLowerCase() !== key)
      : [...selected, key];
    onChange(updated);
  };

  const handleSwitch = (val: boolean) => {
    if (isControlled) {
      onOpenChange?.(val);
    } else {
      setOpenInternal(val);
    }
    if (!val) onChange([]);
  };

  const allergyLabel = selected.length > 0
    ? selected.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')
    : null;

  return (
    <div className="[display:flex] [flex-direction:column] [gap:var(--space-fluid-xs)]">

      {/* ── Title ── */}
      {allergyLabel ? (
        <div className="flex items-baseline justify-center flex-wrap [gap:var(--space-fluid-2xs)]">
          <Typography variant="h4" color="title">
            Your Allergy First:
          </Typography>
          <p
            className="[font-size:var(--text-fluid-h4)] font-black font-display uppercase leading-tight text-allergy transition-colors duration-500"
          >
            {allergyLabel}
          </p>
        </div>
      ) : (
        <Typography variant="h4" color="title" className="text-center">
          Any Allergies?
        </Typography>
      )}

      {/* ── Toggle header pill — always visible ── */}
      <div className="flex justify-center [margin-bottom:var(--space-fluid-xs)]">
      <div
        className="inline-flex items-center [gap:var(--space-fluid-xs)] [padding:var(--space-fluid-2xs)_var(--space-fluid-xs)] pl-5 bg-allergy/5 border border-allergy/20 rounded-full cursor-pointer hover:bg-allergy/10 transition-colors"
        onClick={() => handleSwitch(!open)}
      >
        <div className="flex items-center [gap:var(--space-fluid-xs)]">
          <Icon
            name="health_and_safety"
            size="md"
            className={cn('text-allergy', selected.length > 0 && 'animate-pulse')}
          />
          <Typography variant="badge" className="text-title pt-0.5">
            Safety &amp; Allergies
          </Typography>
        </div>
        <div onClick={e => e.stopPropagation()}>
          <Toggle checked={open} onChange={handleSwitch} />
        </div>
      </div>
      </div>

      {/* ── Pills grid ── */}
      {open && (
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-4 [gap:var(--space-fluid-xs)] animate-in fade-in slide-in-from-top-2 duration-300">
          {options.map(allergen => {
            const isActive = selected.map(a => a.toLowerCase()).includes(allergen.toLowerCase());
            return (
              <Chip
                key={allergen}
                label={allergen}
                active={isActive}
                onClick={() => toggle(allergen)}
                icon={isActive ? 'check_circle' : 'add_circle'}
                iconMobileHidden
                className={cn(
                  'w-full justify-center',
                  isActive
                    ? '!bg-allergy/10 !border-allergy !text-allergy !shadow-none border'
                    : '!bg-surface !border-border !text-muted border hover:!bg-black/5 dark:hover:!bg-white/5'
                )}
              />
            );
          })}
        </div>
      )}

      {/* ── Info cards (passport only) ── */}
      {showInfoCards && open && selected.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 [gap:var(--space-fluid-xs)] [margin-top:var(--space-fluid-s)] animate-in fade-in slide-in-from-top-2">
          {selected.map(a => {
            const label = a.charAt(0).toUpperCase() + a.slice(1);
            const info = allergyMap[a.toLowerCase()] || 'We will exclude this ingredient safely.';
            return (
              <Alert
                key={a}
                variant="error"
                title={`${label} Protocol`}
                message={info}
                icon="health_and_safety"
              />
            );
          })}
        </div>
      )}

    </div>
  );
};

export default AllergySelector;
