import React from 'react';
import { Typography, Icon, GlassCard, AkhaPixelPattern } from '../ui';
import { SkeletonBase } from '../skeleton/atoms';
import { AskCherryButton } from './AskCherryButton';
import { CHERRY_AVATAR_SRC, CHERRY_CARD_AVATAR_RING } from './ChatIdentityHeader';
import type { PageSectionData } from '../../hooks/useHomePageSections';

/**
 * CherryIntroCard — card intro del mondo Cherry (avatar + how-to + Ask Cherry).
 * DB-driven: riga page_sections 'universal_cherry' (page_slug 'shared') — title,
 * subtitle+description, image_asset_id (avatar via MediaImage), bullets[],
 * button_text, cherry_prompt/cherry_response. Usata su FAQ e Contact accanto
 * alla CherryInlineChat (blocco 2/5 + 3/5).
 */
export const CherryIntroCard: React.FC<{ data: PageSectionData | null; loading: boolean }> = ({ data, loading }) => {
  if (loading) {
    return <SkeletonBase className="h-full min-h-[24rem] rounded-[2rem]" />;
  }
  if (!data) return null;

  const paragraph = [data.subtitle, data.description].filter(Boolean).join('. ');

  return (
    <GlassCard
      variant="cherry"
      padding="l"
      radius="2rem"
      className="h-full"
      innerClassName="relative isolate overflow-hidden flex flex-col items-center text-center [gap:var(--space-fluid-s)]"
    >
      {/* Foto base condivisa (placeholder 15%) — stessa del prominent bottom-card */}
      <img
        src={CHERRY_AVATAR_SRC}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none absolute inset-0 -z-10 w-full h-full object-cover opacity-5"
      />

      {/* Avatar — stessa sorgente degli header/pulsanti (CHERRY_AVATAR_SRC), ring condiviso.
          NB: non più MediaImage(image_asset_id) → avatar coerente con la chat box. */}
      <div className={`size-[8.64rem] mx-auto rounded-full overflow-hidden ${CHERRY_CARD_AVATAR_RING} shadow-theme-md shrink-0`}>
        <img
          src={CHERRY_AVATAR_SRC}
          alt={data.title}
          loading="lazy"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Titolo a testo-gradiente turquoise↔cherry (adattivo via token; inline style
          per vincere su text-title del variant senza !important) */}
      <Typography
        variant="h4"
        className="font-bold"
        style={{
          backgroundImage: 'linear-gradient(120deg, var(--cherry-grad-from), var(--cherry-grad-to))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {data.title}
      </Typography>

      {/* Divider cherry — tema dedicato Cherry AI (cherry + turquoise), centrato */}
      <div className="w-full flex justify-center overflow-hidden">
        <AkhaPixelPattern variant="line_simple_medium" size={6} opacity={0.9} theme="cherry" animateInView />
      </div>

      {paragraph && (
        <Typography variant="paragraphM" color="sub" className="leading-relaxed">
          {paragraph}
        </Typography>
      )}

      {(data.bullets ?? []).length > 0 && (
        <ul className="flex flex-col [gap:var(--space-fluid-2xs)] text-left w-full">
          {data.bullets!.map((line) => (
            <li key={line} className="flex items-start [gap:var(--space-fluid-2xs)]">
              <Icon name="check_circle" size="sm" className="text-cherry-ai-teal shrink-0 mt-0.5" />
              <Typography as="span" variant="paragraphS" color="muted">{line}</Typography>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto w-full [padding-top:var(--space-fluid-s)]">
        <AskCherryButton
          variant="inline"
          tone="cherry"
          label={data.button_text}
          subtitle={data.subtitle ?? undefined}
          topic={data.cherry_prompt ?? undefined}
          data={{
            cherry_prompt: data.cherry_prompt ?? undefined,
            cherry_response: data.cherry_response ?? undefined,
          }}
          className="w-full justify-start"
        />
      </div>
    </GlassCard>
  );
};

export default CherryIntroCard;
