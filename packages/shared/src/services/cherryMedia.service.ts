// ─────────────────────────────────────────────────────────────────────────────
// cherryMedia.service — risoluzione foto per i blocchi ricchi Cherry.
//
// I blocchi (linkCard/gallery) referenziano le foto via `asset_id`
// (media_assets.asset_id). Qui le risolviamo in batch → {url, alt, caption, w, h}.
// Cache a livello modulo: ogni asset_id viene chiesto al DB una sola volta per
// sessione (le foto sono stabili). Fail-safe: in errore ritorna ciò che ha.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from '../lib/supabase';

export interface MediaAssetLite {
  assetId: string;
  url: string;
  alt: string;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
}

const cache = new Map<string, MediaAssetLite>();

/** Risolve un set di asset_id in MediaAssetLite. Usa la cache; chiede al DB solo i mancanti. */
export async function getMediaAssetsByIds(ids: string[]): Promise<Record<string, MediaAssetLite>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const out: Record<string, MediaAssetLite> = {};
  const missing: string[] = [];

  for (const id of unique) {
    const hit = cache.get(id);
    if (hit) out[id] = hit;
    else missing.push(id);
  }
  if (missing.length === 0) return out;

  try {
    const { data, error } = await supabase
      .from('media_assets')
      .select('asset_id, image_url, alt_text, caption, width, height')
      .in('asset_id', missing);
    if (error) throw error;

    for (const row of (data ?? []) as Array<Record<string, unknown>>) {
      const assetId = String(row.asset_id ?? '');
      if (!assetId) continue;
      const lite: MediaAssetLite = {
        assetId,
        url: String(row.image_url ?? ''),
        alt: String(row.alt_text ?? ''),
        caption: (row.caption as string | null) ?? null,
        width: (row.width as number | null) ?? null,
        height: (row.height as number | null) ?? null,
      };
      cache.set(assetId, lite);
      out[assetId] = lite;
    }
  } catch (err) {
    // Fail-safe: non bloccare mai la chat per un'immagine non risolta.
    console.warn('[cherryMedia] getMediaAssetsByIds failed (silent):', err);
  }
  return out;
}
