/**
 * ContentRenderer - parser del testo grezzo in blocchi (paragrafi, bullets, heading, quote, foto,
 * grid, divider, mappa, info box, reward cards) + slugify. Estratto da ContentRenderer.tsx (#16 split
 * monstre) a comportamento invariato.
 */
import type { AkhaTheme } from '../../divider/AkhaPixelPattern';

export interface RewardCardItem {
  image_url?: string;
  label: string;
  description?: string;
  required_points: number;
  icon?: string;
  badge_type?: 'physical' | 'digital';
}

export type ContentBlock =
  | { type: 'paragraph'; text: string; bold?: boolean }
  | { type: 'bullets'; items: string[] }
  | { type: 'heading'; level: 2 | 3; text: string; subtitle?: string; anchorId?: string }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'photo'; assetId: string; fullWidth?: boolean }
  | { type: 'photo_grid'; assetIds: string[] }
  | { type: 'divider'; theme?: AkhaTheme | 'cooking' }  // 'cooking' kept for DB backward-compat, mapped to 'kitchen' at render
  | { type: 'map'; url: string; title?: string; height?: number }
  | { type: 'info_box'; title?: string; subtitle?: string; text?: string; items?: string[]; icon?: string }
  | { type: 'reward_cards'; items: RewardCardItem[] };

// ─── Plain-text parser (backward compat) ─────────────────────────────────────
// ... (rest of the parser remains unchanged)

function parsePlainText(raw: string): ContentBlock[] {
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

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// ─── JSON parser ──────────────────────────────────────────────────────────────

export function parseContent(raw: string): ContentBlock[] {
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed) as ContentBlock[];
    } catch {
      // fall through to plain text
    }
  }
  return parsePlainText(raw);
}

// ─── GalleryPhoto — resolves asset and registers it in parent
