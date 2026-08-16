import React, { useEffect, useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { t } from '@thaiakha/shared/lib/ui-strings';
import { Typography, Icon } from '../ui/index';
import { getPageDates } from '../../services/infoPages.service';

interface PageMetaProps {
  /** Slug site_metadata da cui leggere date_published + date_modified. */
  pageSlug: string;
  /** Accento per mondo: 'brand' (default) | 'ocean'. */
  accent?: 'brand' | 'ocean';
  className?: string;
}

// "Jan 1, 2026" — stesso formato delle date già mostrate nelle essentials.
const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

/**
 * PageMeta — riga meta "Published · Updated" generalizzata, per QUALSIASI pagina
 * con una riga site_metadata. Fonte unica di visualizzazione delle date (le date
 * non stanno più nei Key Facts né in info_pages). Se entrambe le date mancano
 * non renderizza nulla. Stessa veste della LegalMetaBanner (che resta per i casi
 * con versione documento).
 */
export const PageMeta: React.FC<PageMetaProps> = ({
  pageSlug,
  accent = 'brand',
  className,
}) => {
  const [dates, setDates] = useState<{ published: string | null; modified: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPageDates(pageSlug).then(d => {
      if (!cancelled) setDates(d);
    });
    return () => { cancelled = true; };
  }, [pageSlug]);

  if (!dates || (!dates.published && !dates.modified)) return null;

  const isOcean = accent === 'ocean';
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between [gap:var(--space-fluid-xs)] [padding-block:var(--space-fluid-s)] [padding-inline:var(--space-fluid-m)] rounded-2xl border',
        isOcean
          ? 'bg-ocean-blue/5 border-ocean-blue/10'
          : 'bg-primary/5 border-primary/10',
        className
      )}
    >
      {dates.published && (
        <div className="flex items-center [gap:var(--space-fluid-2xs)]">
          <Icon name="calendar_today" size="xs" className={isOcean ? 'text-ocean-blue/60' : 'text-primary/60'} />
          <Typography variant="caption" color="muted">
            {t.components.essentials.published}: {fmt(dates.published)}
          </Typography>
        </div>
      )}
      {dates.modified && (
        <div className="flex items-center [gap:var(--space-fluid-2xs)]">
          <Icon name="update" size="xs" className="text-action" />
          <Typography variant="caption" color="muted">
            {t.components.essentials.updated}: {fmt(dates.modified)}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default PageMeta;
