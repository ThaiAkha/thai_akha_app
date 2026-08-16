
import React from 'react';
import { Icon } from '../Icon';

export interface ChipProps {
  label: string;
  /** Shorter label shown on mobile (< sm). Falls back to label if not provided. */
  labelMobile?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  /** Optional Material Symbol icon name shown on the left */
  icon?: string;
  /** Hide icon on mobile (sm:block) — default false */
  iconMobileHidden?: boolean;
  /** Stack icon above label (vertical card layout) */
  vertical?: boolean;
}

const Chip: React.FC<ChipProps> = ({
  label,
  labelMobile,
  active = false,
  onClick,
  className = '',
  icon,
  iconMobileHidden = false,
  vertical = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-2xl font-accent [font-size:var(--text-fluid-chip)] font-black uppercase tracking-widest transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1) ${active
        ? 'bg-action text-white shadow-sm shadow-action border-t border-white/50 hover:scale-[1.03]'
        : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white hover:scale-[1.03]'
        } ${className} active:scale-95`}
    >
      {vertical ? (
        <div className="flex flex-col items-center justify-center [gap:var(--space-fluid-xs)]">
          {icon && <Icon name={icon} size="md" className={iconMobileHidden ? 'hidden sm:block' : undefined} />}
          <span className="leading-none text-center">{label}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center sm:justify-start gap-3">
          {icon && (
            <Icon
              name={icon}
              size="sm"
              className={iconMobileHidden ? 'hidden sm:block' : undefined}
            />
          )}
          {!icon && active && <div className="size-2 rounded-full bg-white animate-pulse" />}
          {labelMobile ? (
            <>
              <span className="sm:hidden">{labelMobile}</span>
              <span className="hidden sm:inline">{label}</span>
            </>
          ) : label}
        </div>
      )}
    </button>
  );
};

export default Chip;
