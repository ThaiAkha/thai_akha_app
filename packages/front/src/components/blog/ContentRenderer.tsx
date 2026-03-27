import React from 'react';
import { Typography, Icon } from '../ui';

// ─── Content parser ───────────────────────────────────────────────────────────

type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] };

function parseContent(raw: string): ContentBlock[] {
  const lines = raw.split('\n');
  const blocks: ContentBlock[] = [];
  let para: string[] = [];
  let bullets: string[] = [];

  const flushPara = () => {
    const t = para.join(' ').trim();
    if (t) blocks.push({ type: 'paragraph', text: t });
    para = [];
  };
  const flushBullets = () => {
    if (bullets.length) { blocks.push({ type: 'bullets', items: bullets }); bullets = []; }
  };

  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('•') || t.startsWith('–') || t.startsWith('-')) {
      flushPara();
      bullets.push(t.replace(/^[•–-]\s*/, ''));
    } else if (t === '') {
      if (bullets.length) flushBullets(); else flushPara();
    } else {
      if (bullets.length) flushBullets();
      para.push(t);
    }
  }
  flushBullets();
  flushPara();
  return blocks;
}

// ─── Component ──────────────────────────────────────────────────────────────

interface ContentRendererProps {
  content: string;
  className?: string;
}

/**
 * Recursive content renderer for database-stored post content.
 * Handles paragraphs and bullet points with consistent styling.
 */
export const ContentRenderer: React.FC<ContentRendererProps> = ({ content, className }) => {
  const blocks = parseContent(content);
  return (
    <div className={className}>
      <div className="space-y-5">
        {blocks.map((block, i) => {
          if (block.type === 'paragraph') {
            return (
              <Typography key={i} variant="paragraphL" color="default" className="leading-loose">
                {block.text}
              </Typography>
            );
          }
          return (
            <ul key={i} className="space-y-3 pl-1">
              {block.items.map((item, j) => (
                <li key={j} className="flex items-start gap-3">
                  <Icon name="chevron_right" size="sm" className="text-action shrink-0 mt-1 opacity-70" />
                  <Typography variant="paragraphM" color="default" className="leading-relaxed">
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>
          );
        })}
      </div>
    </div>
  );
};

export default ContentRenderer;
