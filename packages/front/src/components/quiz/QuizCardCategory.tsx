import React from 'react';
import { Typography, Button } from '../ui/index';
import { QuizCategoryDB } from '@thaiakha/shared/types';
import { t } from '@thaiakha/shared/lib/ui-strings';

interface QuizCardCategoryProps {
  category: QuizCategoryDB;
  onClick: (id: string) => void;
}

const QuizCardCategory: React.FC<QuizCardCategoryProps> = ({ category, onClick }) => {
  const colorVar = `var(--color-${category.color_theme})`;

  return (
    <button
      type="button"
      onClick={() => onClick(category.id)}
      className="relative w-full text-left overflow-hidden rounded-3xl group brand-btn-animation"
      style={{ '--category-color': colorVar } as React.CSSProperties}
    >
      {/* ── Cover photo ── */}
      {category.cover_image_url && (
        <div className="absolute inset-0">
          <img
            src={category.cover_image_url}
            alt={category.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}

      {/* ── Overlay ── */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `linear-gradient(
            105deg,
            color-mix(in srgb, ${colorVar} 70%, black 30%) 0%,
            color-mix(in srgb, ${colorVar} 30%, black 70%) 40%,
            rgba(0,0,0,0.85) 100%
          )`,
        }}
      />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(
            105deg,
            color-mix(in srgb, ${colorVar} 80%, black 20%) 0%,
            color-mix(in srgb, ${colorVar} 40%, black 60%) 40%,
            rgba(0,0,0,0.80) 100%
          )`,
        }}
      />

      {/* ── Border glow ── */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none border transition-all duration-500 group-hover:opacity-100 opacity-40"
        style={{ borderColor: colorVar }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex items-stretch [gap:var(--space-fluid-m)] [padding:var(--space-fluid-m)]">

        {/* Left — avatar */}
        <div className="shrink-0 flex items-center">
          <div
            className="size-24 md:size-44 rounded-2xl overflow-hidden border-2 shadow-lg transition-transform duration-500 group-hover:scale-105"
            style={{
              borderColor: colorVar,
              boxShadow: `0 0 20px color-mix(in srgb, ${colorVar} 40%, transparent)`,
            }}
          >
            {category.avatar_url ? (
              <img
                src={category.avatar_url}
                alt={category.title}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: `color-mix(in srgb, ${colorVar} 20%, black)` }}
              />
            )}
          </div>
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
              variant="h3"
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

          {/* Bottom — CTA */}
          <div className="flex justify-end [margin-top:var(--space-fluid-2xs)]">
            <Button
              variant="primary"
              size="xs"
              icon="arrow_forward"
            >
              {t.quiz.startQuiz || 'Start Quiz'}
            </Button>
          </div>

        </div>
      </div>
    </button>
  );
};

export default QuizCardCategory;
