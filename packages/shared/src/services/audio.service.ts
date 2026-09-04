import { supabase } from '@thaiakha/shared/lib/supabase';
import { sidecarJoin, mergeSidecarRow } from '../lib/mergeTranslation';
import { AudioAsset } from '../types/media.types';

/**
 * 🎙️ AUDIO SERVICE
 * Centralized service for fetching audio assets (voice stories)
 * Supports querying by string identifier 'asset_id'.
 */
export const audioService = {
  /**
   * Fetch a single audio asset by its unique string identifier (asset_id)
   * Example: asset_id = "akha-history-01"
   */
  async getAudioAsset(assetId: string): Promise<AudioAsset | null> {
    if (!assetId) return null;

    try {
      const { data, error } = await supabase
        .from('audio_assets')
        .select('*')
        .eq('asset_id', assetId)
        .maybeSingle();

      if (error || !data) {
        console.info(`ℹ️ Audio asset [${assetId}] not found in audio_assets table.`);
        return null;
      }

      return data as AudioAsset;
    } catch (e) {
      console.error(`❌ Unexpected error fetching audio asset [${assetId}]:`, e);
      return null;
    }
  },

  /**
   * Fetch audio info from content_categories (domain=recipe)
   */
  async getCategoryAudio(categoryId: string, lang = 'en'): Promise<Partial<AudioAsset> | null> {
    if (!categoryId) return null;

    try {
      // `audio_story_url` resta sulla base: la traccia audio e' incisa in inglese,
      // titolo e didascalia invece si traducono.
      let query = supabase
        .from('content_categories')
        .select('audio_story_url, title, ui_quote'
          + sidecarJoin('content_categories_translations', ['title', 'ui_quote'], lang))
        .eq('id', categoryId)
        .eq('domain', 'recipe');
      if (lang !== 'en') query = query.eq('translations.lang', lang);
      const { data: raw, error } = await query.single();

      if (error || !raw) return null;
      // Cast unico (regola repo #20): PostgREST non inferisce la select concatenata.
      const data = mergeSidecarRow(raw as unknown as Record<string, unknown>, lang);
      if (!data.audio_story_url) return null;

      return {
        audio_url: data.audio_story_url as string,
        title: data.title as string,
        caption: (data.ui_quote as string) || '',
        asset_id: categoryId,
        id: categoryId,
        transcript: '', // Not available in category metadata
        duration_seconds: 0
      };
    } catch (e) {
      return null;
    }
  }
};
