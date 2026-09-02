import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import type { LegalDocument } from '@thaiakha/shared/types';
import { SectionBlock } from './LegalDocumentViewer';
import LegalMetaBanner from './LegalMetaBanner';
import LegalFooterCard from './LegalFooterCard';

interface LegalDocumentStaticViewerProps {
  document: LegalDocument;
  /** Accento per mondo: 'brand' (default) | 'ocean' (pagine info a tema FAQ). */
  accent?: 'brand' | 'ocean';
  /** Mostra la barra meta (versione/date). false = la mostra la pagina full-width. */
  showMeta?: boolean;
  className?: string;
}

const LegalDocumentStaticViewer: React.FC<LegalDocumentStaticViewerProps> = ({
  document: doc,
  accent = 'brand',
  showMeta = true,
  className,
}) => {
  return (
    <div className={cn('flex flex-col w-full', className)}>

      {/* Meta Banner (opzionale: le pagine possono renderlo full-width sopra la TOC) */}
      {showMeta && (
        <LegalMetaBanner
          version={doc.version}
          effectiveDate={doc.effectiveDate}
          lastUpdated={doc.lastUpdated}
          accent={accent}
          className="[margin-bottom:var(--space-fluid-m)]"
        />
      )}

      {/* Content */}
      {/* Content — riempie la colonna della griglia; cap 4xl (standard lettura app) evita righe troppo lunghe su tablet landscape */}
      <div className="flex flex-col [gap:var(--space-fluid-l)] max-w-4xl">
        {doc.sections.map((section, i) => (
          <SectionBlock key={i} section={section} index={i} accent={accent} />
        ))}
      </div>

      {/* Footer — entità legale dentro card coerente con la MetaBanner */}
      <LegalFooterCard accent={accent} className="[margin-top:var(--space-fluid-l)]" />
    </div>
  );
};

export default LegalDocumentStaticViewer;
