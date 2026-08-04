import { supabase } from '@thaiakha/shared/lib/supabase';
import { fetchWithCache } from './_cache';

/**
 * 🎭 AVATAR SERVICE
 * Fonte unica per i preset avatar: legge da media_assets (asset_id = avatar-<gender>-<bracket>-<variant>).
 * Elimina ogni dipendenza da URL/bucket hardcoded nel codice.
 */

export interface PresetAvatar {
  assetId: string;
  gender: 'male' | 'female' | 'other';
  bracket: 'teen' | 'adult' | 'senior';
  variant: number;
  url: string;
}

/**
 * Fonte unica preset avatar: media_assets asset_id 'avatar-<gender>-<bracket>-<variant>'.
 * Es: avatar-female-adult-3 → { gender: 'female', bracket: 'adult', variant: 3, url: '...' }
 *
 * Risultati cachati in localStorage via fetchWithCache (stale-while-revalidate).
 * Restituisce [] se il fetch fallisce — mai null.
 */
export async function getPresetAvatars(): Promise<PresetAvatar[]> {
  const result = await fetchWithCache<PresetAvatar[]>('preset_avatars_v1', async () => {
    const { data, error } = await supabase
      .from('media_assets')
      .select('asset_id, image_url')
      .like('asset_id', 'avatar-%');

    if (error || !data) return [];

    const parsed: PresetAvatar[] = [];
    for (const row of data) {
      const parts = (row.asset_id as string).split('-');
      // Format: avatar-<gender>-<bracket>-<variant>  → parts = ['avatar', gender, bracket, variant]
      if (parts.length !== 4) continue;
      const [, gender, bracket, variantStr] = parts;
      const variant = Number(variantStr);
      if (
        !variant ||
        !['male', 'female', 'other'].includes(gender) ||
        !['teen', 'adult', 'senior'].includes(bracket)
      ) continue;
      parsed.push({
        assetId: row.asset_id as string,
        gender: gender as PresetAvatar['gender'],
        bracket: bracket as PresetAvatar['bracket'],
        variant,
        url: row.image_url as string,
      });
    }
    return parsed;
  });

  return result ?? [];
}
