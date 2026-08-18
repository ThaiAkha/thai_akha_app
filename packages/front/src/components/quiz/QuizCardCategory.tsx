import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography } from '../ui/index';
import { ContentCategoryDB } from '@thaiakha/shared/types';
import { t } from '../../i18n';
import { useMediaAsset } from '../../hooks/useMediaAsset';

interface QuizCardCategoryProps {
  category: ContentCategoryDB;
  onClick?: (id: string) => void;
  variant?: 'default' | 'compact';
  hidePlayButton?: boolean;
  progress?: { completed: number; total: number; percentage: number };
  isStatic?: boolean;
}

const QuizCardCategory: React.FC<QuizCardCategoryProps> = ({
  category,
  onClick,
  variant = 'default',
  hidePlayButton = false,
  progress,
  isStatic = false
}) => {
  const colorVar = `var(--color-${category.color_theme ?? 'quiz-p'})`;
  // Resolve cover + avatar from media_assets via asset_id
  const { asset: coverAsset } = useMediaAsset({ assetId: category.cover_asset_id ?? undefined });
  const { asset: avatarAsset } = useMediaAsset({ assetId: category.avatar_asset_id ?? undefined });

  return (
    <button
      type="button"
      onClick={() => !isStatic && onClick?.(category.id)}
      disabled={isStatic}
      className={cn(
        "relative w-full text-left overflow-hidden rounded-[2.5rem] group transition-all duration-500",
        !isStatic ? "brand-btn-animation cursor-pointer" : "cursor-default"
      )}
      style={{ '--category-color': colorVar } as React.CSSProperties}
    >
      {/* ── Cover photo — resolved from cover_asset_id via media_assets ── */}
      {coverAsset?.image_url && (
        <div className="absolute inset-0">
          <img
            src={coverAsset.image_url}
            alt={coverAsset.alt_text ?? category.title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-700",
              !isStatic && "group-hover:scale-105"
            )}
          />
        </div>
      )}

      {/* ── Overlay ── */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `linear-gradient(
            105deg,
            color-mix(in srgb, ${colorVar} 80%, black 30%) 0%,
            color-mix(in srgb, ${colorVar} 40%, black 70%) 40%,
            rgba(0,0,0,0.85) 100%
          )`,
        }}
      />
      {!isStatic && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(
              105deg,
              color-mix(in srgb, ${colorVar} 80%, black 20%) 0%,
              color-mix(in srgb, ${colorVar} 20%, black 60%) 70%,
              rgba(0,0,0,0.80) 100%
            )`,
          }}
        />
      )}

      {/* ── Border glow ── */}
      <div
        className={cn(
          "absolute inset-0 rounded-[2.5rem] pointer-events-none border transition-all duration-500 opacity-40",
          !isStatic && "group-hover:opacity-100"
        )}
        style={{ borderColor: colorVar }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex items-stretch [gap:var(--space-fluid-m)] [padding:var(--space-fluid-m)]">

        {/* Left — avatar + Play button (compact only) */}
        <div className={cn("shrink-0 flex items-center", variant === 'compact' && "flex-col [gap:var(--space-fluid-s)]")}>
          <div
            className={cn(
              "rounded-2xl overflow-hidden border-2 shadow-lg transition-transform duration-500 group-hover:scale-105",
              variant === 'compact' ? 'size-12 md:size-24' : 'size-24 md:size-44'
            )}
            style={{
              borderColor: colorVar,
              boxShadow: `0 0 20px color-mix(in srgb, ${colorVar} 40%, transparent)`,
            }}
          >
            {avatarAsset?.image_url ? (
              <img
                src={avatarAsset.image_url}
                alt={avatarAsset.alt_text ?? category.title}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: `color-mix(in srgb, ${colorVar} 20%, black)` }}
              />
            )}
          </div>

          {/* CTA below avatar (compact only) */}
          {variant === 'compact' && !hidePlayButton && (
            <div className="w-full flex justify-center">
              <div className="w-full inline-flex items-center justify-center gap-1.5 [padding-block:var(--space-fluid-2xs)] rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest transition-all duration-300 group-hover:bg-primary/90">
                <span>Play</span>
                <span className="material-symbols-outlined text-[14px] leading-none">play_arrow</span>
              </div>
            </div>
          )}
        </div>

        {/* Right — text */}
        <div className="flex-1 min-w-0 flex flex-col justify-between [gap:var(--space-fluid-xs)]">

          {/* Top — title block */}
          <div className="flex flex-col [gap:var(--space-fluid-3xs)]">
            {category.subtitle && (
              <Typography
                variant="microLabel"
                className="uppercase tracking-[0.25em] font-black"
                style={{ color: colorVar }}
              >
                {category.subtitle}
              </Typography>
            )}

            <Typography
              variant={variant === 'compact' ? 'h4' : 'h3'}
              className="text-white italic uppercase leading-tight"
            >
              {category.title}
            </Typography>

            {category.description && (
              <Typography
                variant="paragraphS"
                className="text-white/70 line-clamp-2 leading-snug"
              >
                {category.description}
              </Typography>
            )}
          </div>

          {/* Progress Bar */}
          {progress && progress.total > 0 && (
            <div className="flex flex-col [gap:var(--space-fluid-3xs)] [margin-top:var(--space-fluid-xs)]">
              <div className="flex justify-between items-end">
                <Typography variant="microLabel" className="text-white/60 tracking-wider">
                  {progress.completed === progress.total ? t('quiz:mastered') || 'Mastered' : t('quiz:progress') || 'Progress'}
                </Typography>
                <Typography variant="microLabel" style={{ color: colorVar }} className="font-bold">
                  {progress.completed} / {progress.total} Modules
                </Typography>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${progress.percentage}%`,
                    backgroundColor: colorVar,
                    boxShadow: progress.percentage === 100 ? `0 0 10px ${colorVar}` : 'none'
                  }}
                />
              </div>
            </div>
          )}

          {/* Bottom — CTA (default only) */}
          {variant !== 'compact' && !hidePlayButton && (
            <div className="flex justify-end [margin-top:var(--space-fluid-2xs)]">
              <div className="inline-flex items-center gap-1.5 [padding-inline:var(--space-fluid-s)] [padding-block:var(--space-fluid-2xs)] rounded-full bg-primary text-white text-xs font-black uppercase tracking-widest transition-all duration-300 group-hover:bg-primary/90">
                <span>{progress?.percentage === 100 ? t('quiz:playAgain') || 'Play Again' : t('quiz:startQuiz') || 'Start Quiz'}</span>
                <span className="material-symbols-outlined text-base leading-none">arrow_forward</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </button>
  );
};

export default QuizCardCategory;
