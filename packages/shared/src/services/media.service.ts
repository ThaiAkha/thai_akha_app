import { supabase } from '@thaiakha/shared/lib/supabase';
import { MediaAsset } from '../types/media.types';

/**
 * 🖼️ MEDIA SERVICE
 * Centralized service for fetching media assets (images/photos)
 * Supports querying by string identifier 'asset_id'.
 */
export const mediaService = {
  /**
   * Fetch a single media asset by its unique string identifier (asset_id)
   * Example: asset_id = "class-01"
   */
  async getMediaAsset(assetId: string): Promise<MediaAsset | null> {
    if (!assetId) return null;

    try {
      const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .eq('asset_id', assetId)
        .single();

      if (error) {
        // We log as info since some assets might legitimately be missing during dev/migration
        console.info(`ℹ️ Media asset [${assetId}] not found in media_assets table.`);
        return null;
      }

      return data as MediaAsset;
    } catch (e) {
      console.error(`❌ Unexpected error fetching media asset [${assetId}]:`, e);
      return null;
    }
  }
};
