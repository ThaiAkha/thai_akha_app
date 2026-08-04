import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

/**
 * renderInline — parser markdown inline minimale, SICURO (no HTML injection) e
 * RICORSIVO. Unica fonte condivisa (LegalDocumentViewer, PageEssentials, …).
 *   `**bold**` → <strong>,  `*italic*` → <em>,  `[label](href)` → <a> bold nel
 *   colore del mondo (ocean su FAQ/info, primary su brand). Annidamento supportato
 *   (es. `**[link](url)**`). NB: bold (`**`) è tentato PRIMA dell'italic (`*`).
 */
const INLINE_RE = /\*\*([\s\S]+?)\*\*|\[([^\]]+)\]\(([^)]+)\)|\*([\s\S]+?)\*/;

/**
 * InlineLink — renders a markdown link with the right navigation behavior:
 *  - external (http/https): opens in a new tab, rel="noopener noreferrer".
 *  - internal path ("/..."): SPA navigation via the app's custom pushState router
 *    (App.tsx listens to popstate) — no full page reload. Modified/middle clicks
 *    fall through to the browser so cmd/ctrl-click still opens a new tab.
 *  - anything else (mailto:, tel:, #anchor): default browser behavior.
 */
const InlineLink: React.FC<{ href: string; className?: string; children: React.ReactNode }> = ({
  href,
  className,
  children,
}) => {
  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  if (href.startsWith('/')) {
    return (
      <a
        href={href}
        className={className}
        onClick={(e) => {
          // Let the browser handle new-tab / modified / non-left clicks natively.
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          window.history.pushState({}, '', href);
          window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
        }}
      >
        {children}
      </a>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
};

export const renderInline = (text: string, accent: 'brand' | 'ocean' = 'brand', kp = 'i'): React.ReactNode => {
  const linkClass = cn(
    'font-bold no-underline hover:opacity-75 transition-opacity',
    accent === 'ocean' ? 'text-ocean-blue' : 'text-primary',
  );
  const nodes: React.ReactNode[] = [];
  const re = new RegExp(INLINE_RE.source, 'g'); // fresh per call → lastIndex safe in ricorsione
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(<React.Fragment key={`${kp}-t${k}`}>{text.slice(last, m.index)}</React.Fragment>);
    if (m[1] !== undefined) {
      nodes.push(
        <strong key={`${kp}-b${k}`} className="font-semibold text-title">
          {renderInline(m[1], accent, `${kp}-b${k}`)}
        </strong>,
      );
    } else if (m[2] !== undefined) {
      nodes.push(
        <InlineLink key={`${kp}-l${k}`} href={m[3]} className={linkClass}>
          {m[2]}
        </InlineLink>,
      );
    } else if (m[4] !== undefined) {
      nodes.push(
        <em key={`${kp}-e${k}`} className="italic">
          {renderInline(m[4], accent, `${kp}-e${k}`)}
        </em>,
      );
    }
    last = m.index + m[0].length;
    k++;
  }
  if (last < text.length) nodes.push(<React.Fragment key={`${kp}-t${k}`}>{text.slice(last)}</React.Fragment>);
  return nodes.length ? nodes : text;
};

export default renderInline;
