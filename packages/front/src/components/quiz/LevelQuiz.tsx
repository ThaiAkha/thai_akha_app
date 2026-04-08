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
    <div
      className="flex-grow w-full min-h-full relative animate-in fade-in duration-700"
      style={{
        backgroundImage: level.image ? `url('${level.image}')` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* ── Background Overlay (scuro con riflesso rosso/primary in alto) ── */}
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/3 opacity-20 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, var(--color-primary) 0%, transparent 70%)',
        }}
      />

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
                  "relative rounded-[3rem] overflow-hidden border transition-all duration-500 group hover:scale-[1.02] shadow-2xl cursor-pointer",
                  "flex flex-col min-h-[440px]",
                  theme.border
                )}
              >
                {/* ── Background immagine modulo ── */}
                {mod.image_url && (
                  <div className="absolute inset-0">
                    <img
                      src={mod.image_url}
                      alt={mod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                )}

                {/* ── Overlay scuro + riflesso rosso in alto ── */}
                <div className="absolute inset-0 bg-black/70 transition-opacity duration-500 group-hover:bg-black/60" />
                <div
                  className="absolute top-0 right-0 w-1/2 h-1/3 opacity-30 blur-3xl pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at top right, var(--color-primary) 0%, transparent 60%)',
                  }}
                />

                {/* ── Content ── */}
                <div className="relative z-10 flex flex-col h-full [padding:var(--space-fluid-m)]">

                  {/* Top — badge perfetto/in progress */}
                  <div className="flex justify-end [margin-bottom:var(--space-fluid-m)]">
                    {isPerfect ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                        <Icon name="auto_awesome" size="xs" className="text-emerald-400" />
                        <Typography variant="microLabel" className="font-black text-emerald-400 uppercase tracking-widest">{t.quiz.mastered}</Typography>
                      </div>
                    ) : isAttempted ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <Icon name="timer" size="xs" className="text-primary" />
                        <Typography variant="microLabel" color="primary" className="font-black uppercase tracking-widest">{t.quiz.inProgress}</Typography>
                      </div>
                    ) : null}
                  </div>

                  {/* Centro — titolo + tema ── */}
                  <div className="flex-1 flex flex-col justify-center [gap:var(--space-fluid-s)]">
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
                  <div className="flex flex-col [gap:var(--space-fluid-s)] [margin-top:var(--space-fluid-s)]">
                    {/* STATS */}
                    <div className="flex items-center justify-between [padding:var(--space-fluid-s)] bg-black/40 rounded-2xl border border-white/10 backdrop-blur-sm">
                      <Typography variant="microLabel" color="muted" className="uppercase font-black tracking-widest">{t.quiz.score}</Typography>
                      <Typography
                        variant="numericStat"
                        className={cn("font-black leading-none", isPerfect ? 'text-emerald-400' : 'text-white')}
                      >
                        {percentage}%
                      </Typography>
                    </div>

                    {/* ACTION BUTTON */}
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
    </div>
  );
};

export default LevelQuiz;
