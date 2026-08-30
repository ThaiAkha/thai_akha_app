/* eslint-disable react-refresh/only-export-components -- il file esporta il componente + i suoi render helper (renderInline/renderLegalContent/renderLegalSection), stesso pattern di front inlineMarkdown */
import React from 'react';
import { Heading, Paragraph } from '../typography';
import type { LegalDocument, LegalDocumentSection } from '@thaiakha/shared/types';

/**
 * LegalDocumentBody — renderer condiviso dei documenti legali lato admin.
 * Usato dal modale di registrazione (LegalModal) e dalle pagine agency-terms /
 * agency-privacy, cosi' il testo appare identico ovunque.
 *
 * Il testo arriva VERBATIM dal DB (file generati in shared/data/legal), quindi contiene
 * markdown inline: **bold**, *italic*, [label](/percorso), e bullet "• " a inizio riga.
 * Senza questo renderer si vedrebbero gli asterischi letterali.
 */

const INLINE_RE = /\*\*([\s\S]+?)\*\*|\[([^\]]+)\]\(([^)]+)\)|\*([\s\S]+?)\*/;

/**
 * Un elemento e' una voce di elenco solo se inizia con "• ": nel DB i paragrafi di prosa
 * e i bullet convivono nello stesso array (intro + elenco), quindi renderli tutti come
 * <li> trasformerebbe le frasi introduttive in punti elenco.
 * NB: solo "•", non "-": un futuro "-5% commission" non deve perdere il segno meno.
 */
const isBulletItem = (s: string): boolean => s.trimStart().startsWith('•');

/** L'elenco puntato lo disegna il <ul>: il "• " nel testo raddoppierebbe il marker. */
export const stripBullet = (s: string): string => s.replace(/^\s*•\s*/, '');

export const renderInline = (text: string, kp = 'i'): React.ReactNode => {
  const nodes: React.ReactNode[] = [];
  const re = new RegExp(INLINE_RE.source, 'g');
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(<React.Fragment key={`${kp}-t${k}`}>{text.slice(last, m.index)}</React.Fragment>);
    if (m[1] !== undefined) {
      nodes.push(
        <strong key={`${kp}-b${k}`} className="font-semibold text-title">
          {renderInline(m[1], `${kp}-b${k}`)}
        </strong>,
      );
    } else if (m[2] !== undefined) {
      const href = m[3];
      const isExternal = /^https?:\/\//i.test(href);
      nodes.push(
        <a
          key={`${kp}-l${k}`}
          href={href}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="font-semibold text-primary-500 hover:underline"
        >
          {m[2]}
        </a>,
      );
    } else if (m[4] !== undefined) {
      nodes.push(
        <em key={`${kp}-e${k}`} className="italic">
          {renderInline(m[4], `${kp}-e${k}`)}
        </em>,
      );
    }
    last = m.index + m[0].length;
    k++;
  }
  if (last < text.length) nodes.push(<React.Fragment key={`${kp}-t${k}`}>{text.slice(last)}</React.Fragment>);
  return nodes.length ? nodes : text;
};

export const renderLegalContent = (content: string | string[] | undefined): React.ReactNode => {
  if (!content) return null;
  if (typeof content === 'string') {
    return <Paragraph className="mb-4 text-body">{renderInline(content)}</Paragraph>;
  }

  // Prosa e bullet convivono nello stesso array: si raggruppano i bullet consecutivi in
  // un <ul> e si rende ogni altro elemento come <p>. Stessa logica del renderer front
  // (LegalDocumentViewer), cosi' il documento appare identico su front e admin.
  const out: React.ReactNode[] = [];
  let bucket: string[] = [];

  const flush = (key: string) => {
    if (bucket.length === 0) return;
    out.push(
      <ul key={`ul-${key}`} className="list-disc list-inside space-y-2 mb-4 text-body">
        {bucket.map((item, i) => (
          <li key={i} className="leading-relaxed">{renderInline(stripBullet(item), `li-${key}-${i}`)}</li>
        ))}
      </ul>,
    );
    bucket = [];
  };

  content.forEach((item, idx) => {
    if (isBulletItem(item)) {
      bucket.push(item);
      return;
    }
    flush(`b${idx}`);
    out.push(
      <Paragraph className="mb-4 text-body" key={`p-${idx}`}>
        {renderInline(item, `p-${idx}`)}
      </Paragraph>,
    );
  });
  flush('end');

  return <>{out}</>;
};

export const renderLegalSection = (section: LegalDocumentSection, index: number): React.ReactNode => {
  // Marcatore discreto sulle sezioni che ricadono sull'originale mentre si sta
  // mostrando una traduzione: il lettore deve sapere QUALI parti non sono tradotte.
  const untranslated = (section as { renderedLang?: string }).renderedLang === 'source';
  return (
  <div key={section.anchor ?? `${section.title}-${index}`} id={section.anchor ?? undefined} className="mb-8 scroll-mt-24">
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4 pt-4">
      <Heading level="h4" className="text-body">{section.title}</Heading>
      {untranslated && (
        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-warning border border-amber-300/60 dark:border-amber-500/30 rounded-full px-2 py-0.5">
          English
        </span>
      )}
    </div>
    {renderLegalContent(section.content)}
    {section.subsections?.map((sub, i) => (
      <div key={`${sub.title}-${i}`} className="ml-4 mb-6">
        <Heading level="h4" className="mb-3 text-body">{sub.title}</Heading>
        {renderLegalContent(sub.content)}
      </div>
    ))}
    {section.notes?.map((note, i) => (
      <Paragraph size="sm" color="secondary" className="italic mb-3" key={`note-${i}`}>
        {renderInline(note)}
      </Paragraph>
    ))}
  </div>
  );
};

interface LegalDocumentBodyProps {
  /** Accetta anche un MergedLegalDocument: le sezioni portano renderedLang. */
  document: LegalDocument;
}

const LegalDocumentBody: React.FC<LegalDocumentBodyProps> = ({ document: doc }) => (
  <div className="max-w-none prose prose-sm dark:prose-invert">
    {doc.sections.map((section, i) => renderLegalSection(section, i))}
  </div>
);

export default LegalDocumentBody;
