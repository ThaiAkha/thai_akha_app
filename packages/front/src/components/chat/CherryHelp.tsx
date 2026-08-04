import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Typography } from '../ui/Typography';
import { getDashboardHelp, type CherryHelpItem, type HelpLocale } from '@thaiakha/shared/data';
import { CherryPill } from './AskCherryButton';

interface CherryHelpProps {
  /** page_slug della dashboard (es. 'user-passport'). Vedi CHERRY_DASHBOARD_HELP. */
  pageSlug: string;
  /** Titoletto opzionale sopra le voci. Default: "Need help? Ask Cherry 🙏". */
  title?: string;
  /** Lingua (default 'en'; TH oggi vuoto → fallback EN). */
  locale?: HelpLocale;
  className?: string;
}

/**
 * CherryHelp — cluster di how-to "Ask Cherry" per le pagine della user dashboard
 * (login-gated, escluse dal mount standard FaqBottomPage/CherryEntryCard).
 *
 * Ogni voce è un PRESET statico (zero-DB, zero-AI): al click dispatcha
 * 'trigger-chat-topic' con presetResponse + presetBlocks → ChatBox inietta subito
 * testo ricco (CherryFormatter) e foto/audio in coda (CherryRichBlocks).
 * Render per-voce: 'button' (CherryPill) o 'text' (link sobrio inline).
 */
export const CherryHelp: React.FC<CherryHelpProps> = ({
  pageSlug,
  title = 'Need help? Ask Cherry 🙏',
  locale = 'en',
  className,
}) => {
  const items = getDashboardHelp(pageSlug, locale);
  if (!items || items.length === 0) return null;

  const trigger = (item: CherryHelpItem) => {
    window.dispatchEvent(
      new CustomEvent('trigger-chat-topic', {
        detail: {
          topic: item.prompt,
          presetResponse: item.response,
          presetBlocks: item.blocks ?? undefined,
        },
      }),
    );
  };

  const buttons = items.filter(i => (i.render ?? 'button') === 'button');
  const texts = items.filter(i => i.render === 'text');

  return (
    <div
      className={cn(
        'w-full flex flex-col [gap:var(--space-fluid-s)] [margin-bottom:var(--space-fluid-l)]',
        className,
      )}
    >
      <Typography variant="microLabel" color="muted" className="uppercase tracking-widest font-black opacity-80">
        {title}
      </Typography>

      {/* Voci a pulsante (pill) */}
      {buttons.length > 0 && (
        <div className="flex flex-wrap [gap:var(--space-fluid-2xs)]">
          {buttons.map(item => (
            <CherryPill
              key={item.id}
              label={item.shortLabel ?? item.prompt}
              subtitle="Tap to ask kha"
              size="sm"
              tone="cherry"
              onClick={() => trigger(item)}
            />
          ))}
        </div>
      )}

      {/* Voci a testo (link sobrio inline) */}
      {texts.length > 0 && (
        <div className="flex flex-col [gap:2px]">
          {texts.map(item => (
            <button
              key={item.id}
              onClick={() => trigger(item)}
              className="group inline-flex items-center gap-1.5 text-left w-fit"
            >
              <span className="material-symbols-outlined text-base text-cherry-ai-info shrink-0">help</span>
              <Typography
                as="span"
                variant="paragraphS"
                className="text-desc group-hover:text-cherry-ai-info underline decoration-dotted underline-offset-4 transition-colors"
              >
                {item.shortLabel ?? item.prompt}
              </Typography>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CherryHelp;
