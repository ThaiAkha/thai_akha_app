import React from 'react';
import { GlassCard, Avatar, Typography, Icon } from '../ui/index';
import AkhaPixelPattern from '../divider/AkhaPixelPattern';
import { cn } from '@thaiakha/shared/lib/utils';

export interface AuthorData {
  name: string;
  title?: string | null;
  description?: string | null;
  avatar_url?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface AuthorBlockProps {
  author: AuthorData | null | undefined;
  /** ISO date string — shows "Cultural Authenticity Verified" signal when present */
  auditDate?: string | null;
  /** Accent border color theme */
  theme?: 'history' | 'kitchen' | 'news' | 'ingredients';
  className?: string;
}

const THEME_BORDER: Record<string, string> = {
  history: 'border-l-action/40',
  kitchen: 'border-l-primary/40',
  news:    'border-l-btn-s/40',
  ingredients: 'border-l-pantry-4/40',
};

// Concentric outer ring — theme-accented border + subtle bg
const THEME_RING: Record<string, string> = {
  history: 'border-action/30 bg-action/5',
  kitchen: 'border-primary/30 bg-primary/5',
  news:    'border-btn-s/30 bg-btn-s/5',
  ingredients: 'border-pantry-4/30 bg-pantry-4/5',
};

const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  history: 'Dedicated to preserving and sharing the rich heritage of the Akha people through authentic storytelling and culinary expertise.',
  kitchen: 'Passionate about bringing the authentic flavours and traditions of Northern Thailand to every cooking class at Thai Akha Kitchen.',
  news:    'Expert contributor to the Thai Akha Kitchen newsroom, specialising in cultural documentation and mountain community insights.',
  ingredients: 'Sharing the ingredients at the heart of Akha and Northern Thai cooking — where each herb, spice and root comes from, and how it is used in the kitchen.',
};

const AuthorBlock: React.FC<AuthorBlockProps> = ({
  author,
  auditDate,
  theme = 'history',
  className,
}) => {
  if (!author) return null;

  const borderClass = THEME_BORDER[theme] ?? THEME_BORDER.history;
  const ringClass   = THEME_RING[theme]   ?? THEME_RING.history;
  const fallbackDesc = DEFAULT_DESCRIPTIONS[theme] ?? DEFAULT_DESCRIPTIONS.history;

  return (
    <div className={cn('animate-in fade-in slide-in-from-bottom-4 duration-1000', className)}>
      <GlassCard variant="subtle" padding="m" className={cn('flex flex-col gap-6 border-l-4', borderClass)}>

        {/* Avatar + Name + Bio */}
        <div className="flex flex-col md:flex-row [gap:var(--space-fluid-m)] items-center md:items-start">

          {/* Concentric avatar — 3 anelli: outer (theme) → middle (neutral) → image */}
          <div className="relative shrink-0 flex items-center justify-center size-40">
            {/* Outer ring — accento tema, raggio parent (160px) */}
            <div className={cn('absolute inset-0 rounded-full border-2', ringClass)} />
            {/* Middle ring — separatore neutro, raggio parent - 8px (144px) */}
            <div className="absolute size-36 rounded-full border border-white/10 bg-white/5" />
            {/* Avatar — immagine, raggio parent - 16px (128px = 2xl) */}
            <Avatar
              src={author.avatar_url || undefined}
              alt={author.name}
              size="2xl"
              bordered
            />
          </div>

          {/* Content column — mobile: centrato | desktop: allineato sinistra */}
          <div className="flex flex-col [gap:var(--space-fluid-2xs)] items-center md:items-start text-center md:text-left w-full">

            <div className="flex flex-col items-center md:items-start">
              <Typography variant="h4" as="p" color="title" className="font-black italic uppercase leading-tight">
                {author.name}
              </Typography>
              {author.title && (
                <Typography variant="paragraphS" color="sub" className="font-medium opacity-80 uppercase tracking-widest text-[11px]">
                  {author.title}
                </Typography>
              )}
            </div>

            <AkhaPixelPattern variant="line_simple_medium" theme="akha" size={6} opacity={0.6} className="self-center md:self-start" />

            <Typography variant="paragraphM" color="muted" className="italic-light line-clamp-3">
              {author.description || fallbackDesc}
            </Typography>

            {/* Contact links */}
            {(author.email || author.phone) && (
              <div className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start">
                {author.email && (
                  <div className="flex items-center gap-2 text-muted hover:text-primary transition-colors cursor-pointer">
                    <Icon name="mail" size="xs" />
                    <Typography variant="microLabel">{author.email}</Typography>
                  </div>
                )}
                {author.phone && (
                  <div className="flex items-center gap-2 text-muted hover:text-primary transition-colors cursor-pointer">
                    <Icon name="phone" size="xs" />
                    <Typography variant="microLabel">{author.phone}</Typography>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Verification signal — shown only when auditDate is present */}
        {auditDate && (
          <div className="pt-6 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-action/10 text-action">
                <Icon name="verified" size="sm" />
              </div>
              <Typography variant="microLabel" className="font-bold text-title uppercase tracking-tighter">
                Cultural Authenticity Verified
              </Typography>
            </div>
            <Typography variant="microLabel" color="muted">
              Last structural audit:{' '}
              {new Date(auditDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Typography>
          </div>
        )}

      </GlassCard>
    </div>
  );
};

export default AuthorBlock;
