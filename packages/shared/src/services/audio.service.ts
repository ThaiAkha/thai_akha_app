import { supabase } from '@thaiakha/shared/lib/supabase';
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
   * Fetch audio info from recipe_categories (legacy/direct support)
   */
  async getCategoryAudio(categoryId: string): Promise<Partial<AudioAsset> | null> {
    if (!categoryId) return null;

    try {
      const { data, error } = await supabase
        .from('recipe_categories')
        .select('audio_story_url, title, ui_quote')
        .eq('id', categoryId)
        .single();

      if (error || !data || !data.audio_story_url) return null;

      return {
        audio_url: data.audio_story_url,
        title: data.title,
        caption: data.ui_quote || '',
        asset_id: categoryId,
        id: categoryId,
        transcript: '', // Not available in recipe_categories
        duration_seconds: 0
      };
    } catch (e) {
      return null;
    }
  }
};
