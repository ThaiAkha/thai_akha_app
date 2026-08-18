import React from 'react';
import { QuizLevel } from '@thaiakha/shared';
import ButtonQuiz from './ButtonQuiz';
import QuizBackButton from './QuizBackButton';
import { cn } from '@thaiakha/shared/lib/utils';
import { Icon, Typography } from '../ui';
import { t } from '../../i18n';

// ── Configurazione Bottoni ──────────────────────────────────────────────────

const BUTTON_CONFIG = {
  START: { label: t('quiz:startQuiz'), icon: 'play_arrow', variant: 'primary' as const },
  RESUME: { label: t('quiz:resume'), icon: 'play_circle', variant: 'primary' as const },
  RETAKE: { label: t('quiz:retake'), icon: 'replay', variant: 'secondary' as const },
};

interface LevelQuizProps {
  level: QuizLevel;
  levelNumber: number;
  completedModules: string[];
  perfectModules: string[];
  bestScores: Record<string, number>;
  onStartModule: (moduleId: string) => void;
  onBack: () => void;
  categoryImage?: string;
}

const LevelQuiz: React.FC<LevelQuizProps> = ({
  level,
  completedModules,
  perfectModules,
  bestScores,
  onStartModule,
  onBack,
  categoryImage
}) => {

  const getModuleTheme = (isPerfect: boolean, idx: number) => {
    const icons = ["eco", "local_fire_department", "restaurant_menu"];
    const icon = level.modules[idx]?.icon || icons[idx % icons.length];

    if (isPerfect) {
      return {
        bg: "bg-emerald-950/40 dark:bg-emerald-900/20",
        border: "border-emerald-500/30",
        blob: "bg-emerald-500",
        iconColor: "text-emerald-400",
        icon: icon,
        badge: "text-emerald-400"
      };
    } else {
      return {
        bg: "bg-surface/5 dark:bg-black/40",
        border: "border-white/10",
        blob: "bg-primary",
        iconColor: "text-primary",
        icon: icon,
        badge: "text-primary"
      };
    }
  };

  return (
    <div className={cn(
      "flex-grow w-full max-w-[var(--container-page)] mx-auto animate-in fade-in duration-700 relative",
      "[padding:var(--space-fluid-m)] [padding-top:var(--space-fluid-2xs)]"
    )}>
      {/* ── BACKGROUND CINEMATOGRAFICO (PhotoModal Style) ── */}
      {categoryImage && (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
          <img
            src={categoryImage}
            alt="Atmosphere"
            className="w-full h-full object-cover opacity-40 transition-opacity duration-1000"
          />
          {/* Layer 2: Subtle secondary tint overlay — same as GalleryModal */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-black/20 to-black/0" />

          {/* Overlay gradiente per mantenere leggibilità in alto */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/20" />
        </div>
      )}

      {/* ── HEADER NAVIGAZIONE ── */}
      <div className="[margin-bottom:var(--space-fluid-m)] text-center lg:text-left flex flex-col items-center lg:items-start [gap:var(--space-fluid-s)]">
        <QuizBackButton
          label={t('quiz:backLevels')}
          onClick={onBack}
        />

        <div className="mt-2">
          <Typography
            variant="display2"
            color="title"
            className="uppercase italic font-black tracking-tight [margin-bottom:var(--space-fluid-2xs)]"
          >
            {level.title}
          </Typography>
          <Typography variant="paragraphM" color="muted" className="max-w-2xl font-light">
            {level.subtitle || t('quiz:noSubtitle')}
          </Typography>
        </div>
      </div>

      {/* ── GRID MODULI (Fluid Gap) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 [gap:var(--space-fluid-m)] pb-20">
        {level.modules.map((mod, idx) => {
          const isPerfect = perfectModules.includes(mod.id);
          const isAttempted = completedModules.includes(mod.id);

          const bestCount = bestScores[mod.id] || 0;
          const totalQuestions = mod.questions?.length || 0;
          const percentage = totalQuestions > 0 ? Math.round((bestCount / totalQuestions) * 100) : 0;

          const theme = getModuleTheme(isPerfect, idx);
          const currentBtnConfig = isPerfect
            ? BUTTON_CONFIG.RETAKE
            : (isAttempted ? BUTTON_CONFIG.RESUME : BUTTON_CONFIG.START);

          return (
            <div
              key={mod.id}
              onClick={() => onStartModule(mod.id)}
              className={cn(
                "relative rounded-[3rem] [padding:var(--space-fluid-m)] flex flex-col min-h-[440px] overflow-hidden border transition-all duration-500 backdrop-blur-xl group hover:scale-[1.02] shadow-2xl cursor-pointer",
                theme.bg,
                theme.border
              )}
            >
              {/* Sfondo Decorativo */}
              <div className={cn("absolute -top-20 -right-20 size-64 opacity-20 blur-[80px] transition-all duration-700 group-hover:opacity-30", theme.blob)}></div>

              <div className="relative z-10 flex flex-col h-full">

                {/* ICON & BADGE */}
                <div className="flex justify-between items-start [margin-bottom:var(--space-fluid-m)]">
                  <div className={cn("size-20 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 shadow-inner", theme.iconColor)}>
                    <Icon name={mod.icon || theme.icon} size="2xl" />
                  </div>

                  {isPerfect ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                      <Icon name="auto_awesome" size="xs" className="text-emerald-400" />
                      <Typography variant="microLabel" className="font-black text-emerald-400 uppercase tracking-widest">{t('quiz:mastered')}</Typography>
                    </div>
                  ) : isAttempted ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                      <Icon name="timer" size="xs" className="text-primary" />
                      <Typography variant="microLabel" color="primary" className="font-black uppercase tracking-widest">{t('quiz:inProgress')}</Typography>
                    </div>
                  ) : null}
                </div>

                {/* TITOLO */}
                <Typography
                  variant="h3"
                  color="title"
                  className="uppercase tracking-tight leading-tight [margin-bottom:var(--space-fluid-2xs)] line-clamp-2"
                >
                  {mod.title}
                </Typography>

                {/* THEME LABEL */}
                <Typography variant="microLabel" color="muted" className="font-bold uppercase tracking-widest mb-auto">
                  {mod.theme || t('quiz:noTheme')}
                </Typography>

                {/* STATS BAR (Fluid Spacing) */}
                <div className="flex items-center justify-between [padding:var(--space-fluid-s)] bg-black/20 rounded-2xl [margin-bottom:var(--space-fluid-m)] border border-white/5">
                  <Typography variant="microLabel" color="muted" className="uppercase font-black tracking-widest">{t('quiz:score')}</Typography>
                  <Typography
                    variant="numericStat"
                    className={cn("font-black leading-none", isPerfect ? 'text-emerald-400' : 'text-color-inverse')}
                  >
                    {percentage}%
                  </Typography>
                </div>

                {/* ACTION BUTTON */}
                <div className="mt-auto">
                  <ButtonQuiz
                    fullWidth
                    config={currentBtnConfig}
                    className={cn(
                      isPerfect ? "bg-white/10 hover:bg-white/20 border-white/10" : ""
                    )}
                  />
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LevelQuiz;