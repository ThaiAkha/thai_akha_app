// ─────────────────────────────────────────────────────────────────────────────
// CherryFormatter — rich text renderer for Cherry chat messages
//
// Supported block types (detected from message text):
//   • bullets    → lines that ALL start with "- "
//   • info-rows  → 2+ consecutive lines that start with a known info emoji
//                  and contain no **bold** markers (e.g. ⏰ time · 💰 price)
//   • heading    → line(s) starting with "### "
//   • divider    → line containing only "---"
//   • paragraph  → everything else (default)
//
// Inline parsing (applied inside every block):
//   • **text** → <strong>
//
// Streaming, due modalità:
//   A) fullText noto (flussi statici CHAT_FLOW / inject):
//      la struttura HTML finale viene calcolata SUBITO da `fullText`; il testo
//      viene rivelato progressivamente (budget di caratteri ∝ text.length).
//      Ogni pezzo appare già nella sua forma definitiva → niente salto a fine
//      trascrizione, solo l'effetto macchina-da-scrivere fluido.
//   B) fullText assente (streaming AI reale): testo piatto durante lo stream,
//      poi parse a fine stream (comportamento storico, evita DOM thrashing).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Typography } from '../ui';
import { cn } from '@thaiakha/shared/lib/utils';

// ── Props ──────────────────────────────────────────────────────────────────

interface CherryFormatterProps {
  text: string;
  /** Testo completo definitivo — se presente abilita il reveal già-formattato. */
  fullText?: string;
  isStreaming?: boolean;
  className?: string;
}

// ── Block types ─────────────────────────────────────────────────────────────

type Block =
  | { kind: 'heading';   text: string }
  | { kind: 'divider' }
  | { kind: 'bullets';   items: string[] }
  | { kind: 'info-rows'; rows: string[] }
  | { kind: 'paragraph'; text: string };

// ── Inline bold parser (testo completo, niente reveal) ───────────────────────

function parseBold(text: string): React.ReactNode {
  // Fast path: no bold markers
  if (!text.includes('**')) return text;

  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="font-bold text-title">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ── Dissolvenza in entrata morbida (per-parola) ──────────────────────────────
// Ogni parola è un <span> con `animate-in fade-in`: quando il typewriter rivela
// una nuova parola, lo span monta e gioca la dissolvenza UNA volta. Le parole
// già visibili mantengono la stessa key → nessuna ri-animazione (effetto stabile).
// Solo opacity → inline va bene (niente transform che richiederebbe inline-block).
const FADE_WORD_CLASS = 'animate-in fade-in duration-500';

function fadeWords(text: string, keyBase: string): React.ReactNode[] {
  // Token = parola + spazio finale, oppure blocco di soli spazi.
  const tokens = text.match(/\S+\s*|\s+/g) ?? [text];
  return tokens.map((tok, i) => (
    <span key={`${keyBase}-${i}`} className={FADE_WORD_CLASS}>
      {tok}
    </span>
  ));
}

// ── Inline bold parser CON reveal ────────────────────────────────────────────
// Renderizza `text` (bold-aware, asterischi rimossi) mostrando solo i primi
// `budget` caratteri VISIBILI. Ritorna i nodi e quanti caratteri ha consumato.
// `truncated` = true se il budget si è esaurito dentro questo testo.

interface RevealResult {
  nodes: React.ReactNode;
  used: number;
  truncated: boolean;
}

function renderInlineRevealed(text: string, budget: number, keyBase: string): RevealResult {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  const out: React.ReactNode[] = [];
  let used = 0;
  let truncated = false;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isBold = part.startsWith('**') && part.endsWith('**');
    const content = isBold ? part.slice(2, -2) : part;

    const remaining = budget - used;
    if (remaining <= 0) { truncated = true; break; }

    let slice = content;
    if (content.length > remaining) {
      slice = content.slice(0, remaining);
      truncated = true;
    }
    used += slice.length;

    if (isBold) {
      out.push(<strong key={`${keyBase}-${i}`} className="font-bold text-title">{fadeWords(slice, `${keyBase}-${i}`)}</strong>);
    } else {
      out.push(<span key={`${keyBase}-${i}`}>{fadeWords(slice, `${keyBase}-${i}`)}</span>);
    }

    if (truncated) break;
  }

  return { nodes: <>{out}</>, used, truncated };
}

/** Lunghezza "visibile" di un testo (senza i marcatori **). */
function visibleLength(text: string): number {
  return text.replace(/\*\*/g, '').length;
}

// ── Cursore lampeggiante ──────────────────────────────────────────────────────

const Cursor: React.FC = () => (
  <span
    aria-hidden="true"
    className="inline-block w-[2px] h-[1em] align-[-0.15em] ml-0.5 bg-cherry-ai-teal animate-pulse"
  />
);

// ── Info-emoji detection ─────────────────────────────────────────────────────

const INFO_EMOJI_PREFIXES = [
  '⏰', '💰', '👥', '📍', '🚐', '🎓', '✅', '❌',
  '⚠️', '📅', '🕐', '🕑', '🕒', '🕓', '🕔',
] as const;

function startsWithInfoEmoji(line: string): boolean {
  if (line.includes('**')) return false; // bold → title, not info-row
  return INFO_EMOJI_PREFIXES.some(e => line.startsWith(e));
}

// ── Block parser ─────────────────────────────────────────────────────────────

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];

  // Split on double newline → major blocks
  const rawBlocks = text.split('\n\n').map(b => b.trim()).filter(Boolean);

  for (const raw of rawBlocks) {
    // Heading
    if (raw.startsWith('### ')) {
      blocks.push({ kind: 'heading', text: raw.slice(4).trim() });
      continue;
    }

    // Divider
    if (raw === '---') {
      blocks.push({ kind: 'divider' });
      continue;
    }

    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

    // Bullet list: every line starts with "- "
    if (lines.length > 0 && lines.every(l => l.startsWith('- '))) {
      blocks.push({ kind: 'bullets', items: lines.map(l => l.slice(2)) });
      continue;
    }

    // Info rows: 2+ lines, all start with an info emoji, none contain **
    if (lines.length >= 2 && lines.every(startsWithInfoEmoji)) {
      blocks.push({ kind: 'info-rows', rows: lines });
      continue;
    }

    // Default: paragraph (preserve internal single newlines as spaces)
    blocks.push({ kind: 'paragraph', text: raw });
  }

  return blocks;
}

// ── Render blocchi (con budget di reveal opzionale) ──────────────────────────
// Se `budget` è undefined → render completo (no reveal).
// Se `budget` è un numero → rivela fino a `budget` caratteri visibili, poi si
// ferma (i blocchi successivi non vengono renderizzati) e mostra il cursore.

function renderBlocks(blocks: Block[], budget?: number): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = budget ?? Infinity;
  const reveal = budget !== undefined;

  for (let i = 0; i < blocks.length; i++) {
    if (reveal && remaining <= 0) break;
    const block = blocks[i];

    switch (block.kind) {

      case 'heading': {
        if (reveal) {
          const r = renderInlineRevealed(block.text, remaining, `h-${i}`);
          remaining -= r.used;
          nodes.push(
            <Typography key={i} variant="accent" className="font-bold uppercase tracking-wide text-title">
              {r.nodes}{r.truncated && <Cursor />}
            </Typography>
          );
          if (r.truncated) return nodes;
        } else {
          nodes.push(
            <Typography key={i} variant="accent" className="font-bold uppercase tracking-wide text-title">
              {parseBold(block.text)}
            </Typography>
          );
        }
        break;
      }

      case 'divider':
        nodes.push(<div key={i} className="h-px bg-border opacity-40 my-1" role="separator" />);
        break;

      case 'bullets': {
        const visibleItems: React.ReactNode[] = [];
        let stop = false;
        for (let j = 0; j < block.items.length; j++) {
          const item = block.items[j];
          if (reveal) {
            if (remaining <= 0) { stop = true; break; }
            const r = renderInlineRevealed(item, remaining, `b-${i}-${j}`);
            remaining -= r.used;
            visibleItems.push(
              <li key={j} className="flex items-baseline gap-2">
                <span className="mt-[0.35em] size-1.5 rounded-full bg-cherry-ai-teal flex-shrink-0" aria-hidden="true" />
                <Typography variant="paragraphS" as="span" className="leading-snug text-title">
                  {r.nodes}{r.truncated && <Cursor />}
                </Typography>
              </li>
            );
            if (r.truncated) { stop = true; break; }
          } else {
            visibleItems.push(
              <li key={j} className="flex items-baseline gap-2">
                <span className="mt-[0.35em] size-1.5 rounded-full bg-cherry-ai-teal flex-shrink-0" aria-hidden="true" />
                <Typography variant="paragraphS" as="span" className="leading-snug text-title">
                  {parseBold(item)}
                </Typography>
              </li>
            );
          }
        }
        nodes.push(
          <ul key={i} className="flex flex-col [gap:var(--space-fluid-2xs)]">{visibleItems}</ul>
        );
        if (stop) return nodes;
        break;
      }

      case 'info-rows': {
        const visibleRows: React.ReactNode[] = [];
        let stop = false;
        for (let j = 0; j < block.rows.length; j++) {
          const row = block.rows[j];
          if (reveal) {
            if (remaining <= 0) { stop = true; break; }
            const r = renderInlineRevealed(row, remaining, `ir-${i}-${j}`);
            remaining -= r.used;
            visibleRows.push(
              <Typography key={j} variant="caption" as="p" className="leading-snug text-desc">
                {r.nodes}{r.truncated && <Cursor />}
              </Typography>
            );
            if (r.truncated) { stop = true; break; }
          } else {
            visibleRows.push(
              <Typography key={j} variant="caption" as="p" className="leading-snug text-desc">
                {parseBold(row)}
              </Typography>
            );
          }
        }
        nodes.push(
          <div key={i} className="flex flex-col [gap:var(--space-fluid-2xs)] rounded-[var(--radius-card-sm)] bg-surface [padding:var(--space-fluid-xs)]">
            {visibleRows}
          </div>
        );
        if (stop) return nodes;
        break;
      }

      case 'paragraph':
      default: {
        if (reveal) {
          const r = renderInlineRevealed(block.text, remaining, `p-${i}`);
          remaining -= r.used;
          nodes.push(
            <Typography key={i} variant="paragraphS" as="p" className="leading-snug text-title">
              {r.nodes}{r.truncated && <Cursor />}
            </Typography>
          );
          if (r.truncated) return nodes;
        } else {
          nodes.push(
            <Typography key={i} variant="paragraphS" as="p" className="leading-snug text-title">
              {parseBold(block.text)}
            </Typography>
          );
        }
        break;
      }
    }
  }

  return nodes;
}

// ── Plain text (risposte AI) ──────────────────────────────────────────────────
// Le risposte AI sono PLAIN: solo paragrafi, niente bold/heading/bullet/foto.
// Eventuali marcatori markdown emessi dal modello vengono ripuliti, così il
// testo resta pulito anche durante una transizione del prompt. Niente snap:
// non c'è parse di blocchi, solo paragrafi che crescono con la trascrizione.

function toPlainText(text: string): string {
  return (text ?? '')
    .replace(/\*\*/g, '')           // via i marcatori bold
    .replace(/^#{1,6}\s+/gm, '')    // via i marcatori heading
    .replace(/^\s*[-*]\s+/gm, '');  // i bullet diventano righe normali
}

const PlainParagraphs: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const paragraphs = toPlainText(text).split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  return (
    <div className={cn('flex flex-col [gap:var(--space-fluid-xs)]', className)}>
      {paragraphs.map((p, i) => (
        <Typography
          key={i}
          variant="paragraphS"
          as="p"
          className="leading-snug text-title whitespace-pre-line"
        >
          {fadeWords(p, `pp-${i}`)}
        </Typography>
      ))}
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────

export const CherryFormatter: React.FC<CherryFormatterProps> = ({
  text,
  fullText,
  isStreaming,
  className,
}) => {
  // ── AI (nessun fullText) → SEMPRE plain, paragrafi semplici ────────────────
  // Vale sia in streaming che a fine risposta. Tutto il "ricco" vive nei nodi.
  if (!fullText) {
    return <PlainParagraphs text={text} className={className} />;
  }

  // ── Nodi/preset (fullText noto) → ricco ────────────────────────────────────
  // Streaming: struttura calcolata da fullText, testo rivelato progressivamente.
  if (isStreaming) {
    const blocks = parseBlocks(fullText);
    const totalVisible = blocks.reduce((sum, b) => {
      if (b.kind === 'paragraph' || b.kind === 'heading') return sum + visibleLength(b.text);
      if (b.kind === 'bullets') return sum + b.items.reduce((s, it) => s + visibleLength(it), 0);
      if (b.kind === 'info-rows') return sum + b.rows.reduce((s, r) => s + visibleLength(r), 0);
      return sum;
    }, 0);

    const ratio = Math.min(1, Math.max(0, text.length / Math.max(1, fullText.length)));
    const budget = Math.max(1, Math.ceil(ratio * totalVisible));

    return (
      <div className={cn('flex flex-col [gap:var(--space-fluid-xs)]', className)}>
        {renderBlocks(blocks, budget)}
      </div>
    );
  }

  // Nodo a stream completo → render ricco definitivo (no reveal, no fade).
  const blocks = parseBlocks(text);
  return (
    <div className={cn('flex flex-col [gap:var(--space-fluid-xs)]', className)}>
      {renderBlocks(blocks)}
    </div>
  );
};

export default CherryFormatter;
