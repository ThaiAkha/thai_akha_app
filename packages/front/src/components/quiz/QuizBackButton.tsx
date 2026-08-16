import React from 'react';
import { Icon, Typography } from '../ui';
import { cn } from '@thaiakha/shared/lib/utils';

interface QuizBackButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

/**
 * QuizBackButton — bottone "back" unificato per tutto il flusso quiz.
 * Design: glass pill con freccia sinistra e micro-animazione hover.
 * Da usare in: HOME (back to categories), LEVEL_SELECT (back to levels), PLAYING (abort).
 */
const QuizBackButton: React.FC<QuizBackButtonProps> = ({ label, onClick, className }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-fit group relative flex items-center [gap:var(--space-fluid-2xs)]',
        '[padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-2xs)]',
        'rounded-full border border-white/10',
        'bg-white/5 hover:bg-white/10 backdrop-blur-md',
        'text-white/60 hover:text-white',
        'transition-all duration-300',
        className
      )}
    >
      <Icon
        name="arrow_back"
        size="sm"
        className="transition-transform duration-300 group-hover:-translate-x-1"
      />
      <Typography
        variant="microLabel"
        className="font-black uppercase tracking-[0.2em] text-inherit"
      >
        {label}
      </Typography>
    </button>
  );
};

export default QuizBackButton;
