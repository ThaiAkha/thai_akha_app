
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
      className={`px-6 py-2.5 rounded-2xl font-accent text-sm font-black uppercase tracking-widest transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1) ${active
        ? 'bg-action text-white shadow-sm shadow-action border-t border-white/50 hover:scale-[1.03]'
        : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white hover:scale-[1.03]'
        } ${className} active:scale-95`}
    >
      <div className="flex items-center gap-4">
        {active && <div className="size-2 rounded-full bg-white animate-pulse" />}
        {label}
      </div>
    </button>
  );
};

export default Chip;
