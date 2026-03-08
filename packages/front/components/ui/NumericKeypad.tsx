import React from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './index';

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onConfirm: () => void;
  className?: string;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onKeyPress,
  onDelete,
  onConfirm,
  className
}) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

  return (
    <div className={cn("flex flex-col gap-4 p-6 bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] shadow-2xl border border-white/10", className)}>
      {/* --- GRID KEYS --- */}
      <div className="grid grid-cols-3 gap-3">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onKeyPress(key)}
            className="h-16 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xl font-black text-title hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all shadow-sm"
          >
            {key}
          </button>
        ))}
        
        {/* DELETE KEY */}
        <button
          type="button"
          onClick={onDelete}
          className="h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white active:scale-95 transition-all shadow-sm"
        >
          <Icon name="backspace" size="md" />
        </button>
      </div>

      {/* --- CONFIRM BUTTON --- */}
      <button
        type="button"
        onClick={onConfirm}
        className="w-full h-16 rounded-2xl bg-action text-white font-black uppercase tracking-widest text-sm shadow-action-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <Icon name="check_circle" size="sm" />
        Confirm Entry
      </button>
    </div>
  );
};

export default NumericKeypad;