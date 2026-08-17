import React from 'react';
import { QuizLevel } from '@thaiakha/shared';
import { cn } from '@thaiakha/shared/lib/utils';
import { Icon, Typography } from '../ui';
import { Badge } from '../ui';
import { t } from '../../i18n';

interface QuizCardLevelProps {
  level: QuizLevel;
  levelNumber: number; // Added to show 1, 2, 3...
  isLocked: boolean;
  isCurrent: boolean;
  completedCount: number;
  onClick: () => void;
}

const QuizCardLevel: React.FC<QuizCardLevelProps> = ({
  level,
  levelNumber,
  isLocked,
  isCurrent,
  completedCount,
  onClick,
}) => {
  const totalCount = level.modules.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const colorVar = 'var(--color-quiz-p)';

  return (
    <button
      disabled={isLocked}
      onClick={onClick}
      className={cn(
        'relative w-full text-left p-1 rounded-[2.5rem] border-2 transition-all duration-500 group overflow-hidden brand-btn-animation',
        isLocked
          ? 'border-white/5 bg-white/5 opacity-50 grayscale cursor-not-allowed'
          : 'border-white/10 bg-surface-elevated hover:border-quiz/50 hover:shadow-2xl cursor-pointer',
      )}
    >
      {/* BG image + gradient overlay */}
      <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity">
        {level.image && (
          <img src={level.image} className="w-full h-full object-cover" alt={level.title} />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </div>

      {/* Locked overlay icon */}
      {isLocked && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="size-20 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-110">
            <Icon name="lock" size="xl" className="text-white/80" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 [padding:var(--space-fluid-m)] flex items-center justify-between">

        {/* Left — badge + title + subtitle */}
        <div className="flex flex-col [gap:var(--space-fluid-s)]">
          <div className="flex items-center [gap:var(--space-fluid-xs)]">
            <Badge
              variant={isLocked ? 'outline' : 'mineral'}
              color={!isLocked ? 'quiz-p' : 'action'}
              size="sm"
            >
              {`${t('quiz:levelPrefix')} ${levelNumber}`}
            </Badge>
            {isCurrent && (
              <span className="flex items-center gap-1">
                <Icon name="radio_button_checked" size="xs" className="text-quiz animate-pulse" />
                <Typography variant="microLabel" className="font-black uppercase tracking-widest text-quiz">
                  {t('quiz:currentMission')}
                </Typography>
              </span>
            )}
          </div>

          <Typography variant="h3" color="title" className="italic uppercase font-black leading-none tracking-tight">
            {level.title}
          </Typography>

          {level.subtitle && (
            <Typography variant="paragraphS" color="muted">
              {level.subtitle}
            </Typography>
          )}

          {/* Progress Bar (Visible on all sizes) */}
          <div className="flex flex-col [gap:var(--space-fluid-3xs)] [margin-top:var(--space-fluid-2xs)] w-full max-w-sm">
            <div className="flex justify-between items-end">
              <Typography variant="microLabel" className="text-white/60 tracking-wider">
                {percentage === 100 ? t('quiz:mastered') || 'Mastered' : t('quiz:progress') || 'Progress'}
              </Typography>
              <Typography variant="microLabel" className="font-bold text-quiz">
                {percentage}%
              </Typography>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: colorVar,
                  boxShadow: percentage === 100 ? `0 0 10px ${colorVar}` : 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Right — percentage count (hidden on mobile) */}
        <div className="text-right hidden sm:flex flex-col items-end [gap:var(--space-fluid-2xs)] shrink-0 [padding-left:var(--space-fluid-m)]">
          <Typography variant="numericStat" color="title" className="leading-none text-quiz">
            {percentage}%
          </Typography>
          <Typography variant="microLabel" color="muted">
            {t('quiz:completed') || 'COMPLETED'}
          </Typography>
        </div>

      </div>
    </button>
  );
};

export default QuizCardLevel;
