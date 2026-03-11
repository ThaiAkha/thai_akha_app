import React from 'react';
import { Icon } from './Icon';
import { cn } from '../../lib/utils';

// --- TIPI ---
export type SessionType = 'morning_class' | 'evening_class' | 'all';

interface ClassPickerProps {
  date: string;
  onDateChange: (date: string) => void;
  session: SessionType;
  onSessionChange: (session: SessionType) => void;
  className?: string;
}

const SESSIONS: { id: SessionType; label: string; icon: string }[] = [
  { id: 'morning_class', label: 'Morning', icon: 'wb_sunny' },
  { id: 'evening_class', label: 'Evening', icon: 'dark_mode' },
  { id: 'all', label: 'All Day', icon: 'view_agenda' }
];

const ClassPicker: React.FC<ClassPickerProps> = ({
  date,
  onDateChange,
  session,
  onSessionChange,
  className
}) => {
  return (
    <div className={cn(
      // CONTAINER: Glass Action più intenso e grande
      "flex flex-col md:flex-row items-center gap-3 bg-action/20 p-3 rounded-[1.5rem] border border-action/30 shadow-lg shadow-action/5 backdrop-blur-xl",
      className
    )}>
        
        {/* A. DATE PICKER (Pillola Grande) */}
        <div className="relative group w-full md:w-auto">
            <input 
                type="date" 
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                // 🔒 BLOCCO SCRITTURA MANUALE (Mantenuto)
                onKeyDown={(e) => e.preventDefault()} 
                onClick={(e) => e.currentTarget.showPicker()} 
                
                className={cn(
                    // 👇 MODIFICA QUI: 
                    // 1. md:w-auto invece di w-56 per adattarsi al contenuto
                    // 2. md:min-w-[300px] per garantire spazio sufficiente per il font grosso
                    "w-full md:w-auto md:min-w-[200] pl-16 pr-6 py-4 rounded-2xl cursor-pointer text-center appearance-none outline-none transition-all duration-300",
                    "bg-white/80 dark:bg-black/40 border-2 border-transparent",
                    "text-lg font-mono font-black uppercase tracking-widest text-title",
                    "hover:bg-white hover:border-action/50 hover:shadow-md",
                    "focus:border-action focus:bg-white focus:ring-4 focus:ring-action/20"
                )}
            />
        </div>

        {/* DIVISORE VERTICALE (Solo Desktop) */}
        <div className="h-10 w-px bg-action/30 hidden md:block mx-2"></div>

        {/* B. SESSION SWITCH */}
        <div className="flex w-full md:w-auto bg-black/5 dark:bg-black/40 p-1.5 rounded-2xl border border-white/5 overflow-hidden">
            {SESSIONS.map((s) => {
                const isActive = session === s.id;
                return (
                    <button 
                        key={s.id}
                        onClick={() => onSessionChange(s.id)}
                        className={cn(
                            "flex-1 md:flex-none flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 select-none",
                            isActive 
                                ? "bg-action text-white shadow-action-glow scale-[1.02] font-black" 
                                : "text-desc/60 hover:text-title hover:bg-white/10 font-bold"
                        )}
                    >
                        <Icon name={s.icon} size="md" className={isActive ? "text-white" : ""} />
                        
                        <span className="text-sm uppercase tracking-wider hidden md:inline">
                            {s.label}
                        </span>
                        
                        <span className="md:hidden text-sm font-black uppercase">
                            {s.label === 'All Day' ? 'All' : s.label.slice(0,1)}
                        </span>
                    </button>
                )
            })}
        </div>

    </div>
  );
};

export default ClassPicker;