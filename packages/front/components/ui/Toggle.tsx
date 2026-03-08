import React from 'react';
import { cn } from '../../lib/utils'; // [Source 81]

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  className = '',
}) => {
  
  const handleToggle = () => {
    if (disabled) return;
    onChange(!checked);
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          // 1. BASE LAYOUT & SIZE (Ottimizzato per touch)
          "relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-action/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          
          // 2. COLORS & STATES
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          
          // 3. ACTIVE STATE (Action Green + Glow [Source 106])
          checked 
            ? "bg-action shadow-action-glow" 
            : "bg-slate-200 dark:bg-white/10 border border-black/5 dark:border-white/10" // Inactive Glass Style
        )}
      >
        <span className="sr-only">{label || 'Toggle'}</span>
        
        {/* THUMB (Il pallino) */}
        <span
          className={cn(
            "inline-block size-6 rounded-full bg-white shadow-sm transition-transform duration-300 ease-cinematic", // [Source 89]
            checked ? "translate-x-7" : "translate-x-1"
          )}
        />
      </button>

      {/* LABEL OPZIONALE (Typography Semantica) */}
      {label && (
        <span className="font-accent text-sm font-bold tracking-wider text-desc select-none cursor-pointer" onClick={handleToggle}>
          {label}
        </span>
      )}
    </div>
  );
};

export default Toggle;