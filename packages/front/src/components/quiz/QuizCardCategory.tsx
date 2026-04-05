import React from 'react';
import { Typography, Icon, Badge } from '../ui/index';
import { QuizCategoryDB } from '@thaiakha/shared/types';

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
      {/* ── Cover photo ─────────────────────────────────────────────────────── */}
      {category.cover_image_url && (
        <div className="absolute inset-0">
          <img
            src={category.cover_image_url}
            alt={category.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}

      {/* ── Overlay — dark base + category color glow on the left ─────────── */}
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

      {/* ── Border glow ──────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none border transition-all duration-500 group-hover:opacity-100 opacity-40"
        style={{ borderColor: colorVar }}
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center [gap:var(--space-fluid-m)] [padding:var(--space-fluid-m)]">

        {/* Left — avatar */}
        <div className="shrink-0 flex flex-col items-center [gap:var(--space-fluid-xs)]">
          <div
            className="size-20 md:size-24 rounded-2xl overflow-hidden border-2 shadow-lg transition-transform duration-500 group-hover:scale-105"
            style={{ borderColor: colorVar, boxShadow: `0 0 20px color-mix(in srgb, ${colorVar} 40%, transparent)` }}
          >
            {category.avatar_url ? (
              <img
                src={category.avatar_url}
                alt={category.title}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: `color-mix(in srgb, ${colorVar} 20%, black)` }}
              >
                <Icon name={category.icon_name ?? 'quiz'} size="lg" className="text-white" />
              </div>
            )}
          </div>

          {/* Icon badge below avatar */}
          <div
            className="size-8 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: colorVar }}
          >
            <Icon name={category.icon_name ?? 'quiz'} size="sm" className="text-black" />
          </div>
        </div>

        {/* Right — text */}
        <div className="flex-1 min-w-0 flex flex-col [gap:var(--space-fluid-xs)]">
          {category.subtitle && (
            <div>
              <Badge
                variant="outline"
                style={{ borderColor: colorVar, color: colorVar } as React.CSSProperties}
                className="uppercase tracking-widest"
              >
                {category.subtitle}
              </Badge>
            </div>
          )}

          <Typography
            variant="h3"
            className="text-white italic uppercase leading-tight truncate"
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

          {/* CTA row */}
          <div
            className="flex items-center [gap:var(--space-fluid-2xs)] [margin-top:var(--space-fluid-xs)]"
            style={{ color: colorVar }}
          >
            <Typography variant="microLabel" className="font-black uppercase tracking-widest" style={{ color: colorVar }}>
              Start Quiz
            </Typography>
            <Icon
              name="arrow_forward"
              size="sm"
              className="transition-transform duration-300 group-hover:translate-x-1"
              style={{ color: colorVar } as React.CSSProperties}
            />
          </div>
        </div>

      </div>
    </button>
  );
};

export default QuizCardCategory;
