
import React from 'react';

export interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

const Chip: React.FC<ChipProps> = ({
  label,
  active = false,
  onClick,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-2xl font-accent text-[11px] font-black uppercase tracking-widest transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1) ${
        active
          ? 'bg-action text-white shadow-lg shadow-action/30 border-t border-white/20 scale-105'
          : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white hover:scale-[1.03]'
      } ${className} active:scale-95`}
    >
      <div className="flex items-center gap-2">
        {active && <div className="size-1.5 rounded-full bg-white animate-pulse" />}
        {label}
      </div>
    </button>
  );
};

export default Chip;
