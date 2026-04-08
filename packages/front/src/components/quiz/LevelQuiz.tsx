import React, { useEffect } from 'react';
import { QuizLevel, QuizModule } from '@thaiakha/shared';
import ButtonQuiz from './ButtonQuiz';
import { cn } from '@thaiakha/shared/lib/utils';
import { Icon, Typography } from '../ui';
import { t } from '@thaiakha/shared/lib/ui-strings';

// ── Configurazione Bottoni ──────────────────────────────────────────────────

const BUTTON_CONFIG = {
  START: { label: t.quiz.startQuiz, icon: 'play_arrow', variant: 'primary' as const },
  RESUME: { label: t.quiz.resume, icon: 'play_circle', variant: 'primary' as const },
  RETAKE: { label: t.quiz.retake, icon: 'replay', variant: 'secondary' as const },
};

interface LevelQuizProps {
  level: QuizLevel;
  completedModules: string[];
  perfectModules: string[];
  bestScores: Record<string, number>;
  onStartModule: (moduleId: string) => void;
  onBack: () => void;
}

const LevelQuiz: React.FC<LevelQuizProps> = ({
  level,
  completedModules,
  perfectModules,
  bestScores,
  onStartModule,
  onBack
}) => {
  // Debug: log level data
  useEffect(() => {
    console.log('🎯 LevelQuiz loaded:', {
      levelId: level.id,
      levelImage: level.image,
      modulesCount: level.modules.length,
      modules: level.modules.map(m => ({ id: m.id, title: m.title, imageUrl: m.image_url }))
    });
  }, [level]);

  const getModuleTheme = (isPerfect: boolean, idx: number) => {
    const icons = ["eco", "local_fire_department", "restaurant_menu"];
    const icon = level.modules[idx]?.icon || icons[idx % icons.length];

    if (isPerfect) {
      return {
        border: "border-emerald-500/50",
        badge: "text-emerald-400"
      };
    } else {
      return {
        border: "border-white/20",
        badge: "text-primary"
      };
    }
  };

  return (
    <div className="flex-grow w-full min-h-full relative animate-in fade-in duration-700">
      {/* ── ATMOSPHERIC BACKGROUND (PhotoModal style) ── */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
        {level.image && (
          <img
            src={level.image}
            alt="Level background"
            className="w-full h-full object-cover opacity-80 mix-blend-multiply"
          />
        )}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex-grow w-full max-w-[85rem] mx-auto [padding:var(--space-fluid-m)] [padding-top:var(--space-fluid-2xs)]">

        {/* ── HEADER NAVIGAZIONE ── */}
        <div className="[margin-bottom:var(--space-fluid-m)] text-center lg:text-left flex flex-col items-center lg:items-start [gap:var(--space-fluid-s)]">
          <button
            onClick={onBack}
            className={cn(
              "group relative flex items-center gap-2 px-6 py-2.5 rounded-full",
              "bg-white/5 hover:bg-white/10 border border-white/10 text-color-inverse",
              "transition-all duration-300"
            )}
          >
            <Icon name="arrow_back" className="text-sm group-hover:-translate-x-1 transition-transform" />
            <Typography variant="badge" className="font-black uppercase tracking-[0.2em]">
              {t.quiz.backLevels}
            </Typography>
          </button>

          <div className="mt-2">
            <Typography
              variant="display2"
              color="title"
              className="uppercase italic font-black tracking-tight [margin-bottom:var(--space-fluid-2xs)]"
            >
              {level.title}
            </Typography>
            <Typography variant="paragraphM" color="muted" className="max-w-2xl font-light">
              {level.subtitle || t.quiz.noSubtitle}
            </Typography>
          </div>
        </div>

        {/* ── GRID MODULI ── */}
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
                  "relative rounded-[3rem] overflow-hidden border transition-all duration-500 group hover:scale-[1.02] shadow-2xl cursor-pointer bg-black",
                  "flex flex-col md:flex-row md:items-center",
                  theme.border
                )}
              >
                {/* ── BG Image + Overlay (PhotoModal style) ── */}
                {mod.image_url && (
                  <div className="absolute inset-0 pointer-events-none">
                    <img
                      src={mod.image_url}
                      alt=""
                      className="w-full h-full object-cover opacity-80 mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}

                {/* ── MOBILE: Horizontal Layout ── */}
                <div className="md:hidden relative z-10 flex items-center [gap:var(--space-fluid-m)] [padding:var(--space-fluid-m)] w-full">

                  {/* Avatar quadrato */}
                  {mod.image_url && (
                    <div className="shrink-0 size-20 rounded-2xl overflow-hidden border border-white/20 shadow-lg">
                      <img
                        src={mod.image_url}
                        alt={mod.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Testo + bottom row */}
                  <div className="flex-1 min-w-0 flex flex-col [gap:var(--space-fluid-xs)]">

                    {/* Status badge (top) */}
                    <div className="flex justify-between items-center">
                      <Typography variant="microLabel" color="muted" className="font-bold uppercase tracking-widest truncate">
                        {mod.theme || t.quiz.noTheme}
                      </Typography>
                      {isPerfect ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 shrink-0">
                          <Icon name="auto_awesome" size="xs" className="text-emerald-400" />
                          <Typography variant="microLabel" className="font-black text-emerald-400 uppercase tracking-[0.15em]">{t.quiz.mastered}</Typography>
                        </div>
                      ) : isAttempted ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 shrink-0">
                          <Icon name="timer" size="xs" className="text-primary" />
                          <Typography variant="microLabel" color="primary" className="font-black uppercase tracking-[0.15em]">{t.quiz.inProgress}</Typography>
                        </div>
                      ) : null}
                    </div>

                    {/* Titolo */}
                    <Typography
                      variant="h4"
                      color="title"
                      className="uppercase italic tracking-tight leading-tight line-clamp-2"
                    >
                      {mod.title}
                    </Typography>

                    {/* Score + Button */}
                    <div className="flex items-center justify-between [margin-top:var(--space-fluid-2xs)]">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 backdrop-blur-sm">
                        <Icon name="stars" size="xs" className={isPerfect ? 'text-emerald-400' : 'text-primary'} />
                        <Typography
                          variant="numericRegular"
                          className={cn("font-black leading-none", isPerfect ? 'text-emerald-400' : 'text-white')}
                        >
                          {percentage}%
                        </Typography>
                      </div>

                      <ButtonQuiz
                        config={currentBtnConfig}
                        className={cn(isPerfect ? "border-emerald-500/30" : "")}
                      />
                    </div>

                  </div>
                </div>

                {/* ── TABLET/DESKTOP: Vertical Layout (compatto) ── */}
                <div className="hidden md:flex md:flex-col md:h-full relative z-10 w-full [padding:var(--space-fluid-m)]">

                  {/* Top — badge perfetto/in progress */}
                  <div className="flex justify-end [margin-bottom:var(--space-fluid-s)]">
                    {isPerfect ? (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                        <Icon name="auto_awesome" size="xs" className="text-emerald-400" />
                        <Typography variant="microLabel" className="font-black text-emerald-400 uppercase tracking-[0.15em]">{t.quiz.mastered}</Typography>
                      </div>
                    ) : isAttempted ? (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                        <Icon name="timer" size="xs" className="text-primary" />
                        <Typography variant="microLabel" color="primary" className="font-black uppercase tracking-[0.15em]">{t.quiz.inProgress}</Typography>
                      </div>
                    ) : null}
                  </div>

                  {/* Centro — titolo + tema ── */}
                  <div className="flex-1 flex flex-col justify-center [gap:var(--space-fluid-2xs)] [margin-bottom:var(--space-fluid-s)]">
                    <Typography
                      variant="h3"
                      color="title"
                      className="uppercase tracking-tight leading-tight line-clamp-2"
                    >
                      {mod.title}
                    </Typography>

                    <Typography variant="microLabel" color="muted" className="font-bold uppercase tracking-widest">
                      {mod.theme || t.quiz.noTheme}
                    </Typography>
                  </div>

                  {/* Bottom — score + button ── */}
                  <div className="flex items-center justify-between [gap:var(--space-fluid-s)]">
                    {/* STATS */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 backdrop-blur-sm">
                      <Icon name="stars" size="xs" className={isPerfect ? 'text-emerald-400' : 'text-primary'} />
                      <Typography
                        variant="numericRegular"
                        className={cn("font-black leading-none", isPerfect ? 'text-emerald-400' : 'text-white')}
                      >
                        {percentage}%
                      </Typography>
                    </div>

                    {/* ACTION BUTTON */}
                    <ButtonQuiz
                      config={currentBtnConfig}
                      className={cn(
                        isPerfect ? "border-emerald-500/30" : ""
                      )}
                    />
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelQuiz;
