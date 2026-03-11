import React from 'react';
import { cn } from '../../lib/utils'; // Assicurati che utils esista

// Definizione Locale per slegarlo dal vecchio file
export interface QuizButtonConfig {
  label: string;
  icon: string;
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
}

interface ButtonQuizProps {
  config: QuizButtonConfig;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const ButtonQuiz: React.FC<ButtonQuizProps> = ({ config, onClick, disabled, className = "", fullWidth = false }) => {
  
  const baseStyles = "flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold uppercase tracking-wider text-xs transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-white text-black hover:bg-quiz hover:scale-105 shadow-lg shadow-white/10",
    secondary: "bg-white/10 text-white border border-white/10 hover:bg-white/20",
    outline: "bg-transparent text-white border border-white/20 hover:border-white hover:text-white",
    ghost: "bg-transparent text-white/40 hover:text-white hover:bg-white/5",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variants[config.variant], fullWidth && 'w-full', className)}
    >
      <span className="material-symbols-outlined text-lg">{config.icon}</span>
      {config.label}
    </button>
  );
};

export default ButtonQuiz;