import { supabase } from '@thaiakha/shared/lib/supabase';
import { MediaAsset } from '../types/media.types';
import { fetchWithCache } from './_cache';

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
        .maybeSingle();

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
  },

  /** 🖼️ MEDIA ASSETS BY IDS: Fetch specific media assets by their asset_id */
  async getMediaAssetsByIds(assetIds: string[]): Promise<Record<string, unknown>[]> {
    const data = await fetchWithCache<Record<string, unknown>[]>(`media_assets_by_ids_${assetIds.join(',')}_v1`, async () => {
      const { data, error } = await supabase
        .from('media_assets')
        .select('asset_id, title, image_url, caption, alt_text')
        .in('asset_id', assetIds);

      if (error) {
        console.error('Error fetching media assets:', error);
        return [];
      }

      return (data || []).sort((a, b) =>
        assetIds.indexOf((a as Record<string, string>).asset_id) -
        assetIds.indexOf((b as Record<string, string>).asset_id)
      );
    });
    return data || [];
  },

  /**
   * 🖼️ GALLERY: Fonte UNICA gallerie. Legge gallery_items per gallery_id, ordina
   * per display_order, e appiattisce media_assets in una shape pronta al render
   * (GalleryItem-compatibile). Sostituisce array hardcoded / gallery_images / gallery_asset_ids.
   */
  async getGallery(galleryId: string): Promise<Array<{
    asset_id: string; image_url: string; title?: string; caption?: string; alt_text?: string; quote?: string;
  }>> {
    if (!galleryId) return [];
    const data = await fetchWithCache(`gallery_${galleryId}_v1`, async () => {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('asset_id, display_order, quote, media_assets(image_url, title, caption, alt_text)')
        .eq('gallery_id', galleryId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error(`Gallery fetch error [${galleryId}]:`, error);
        return [];
      }

      return (data || []).map((row) => {
        const r = row as Record<string, unknown>;
        const m = (Array.isArray(r.media_assets) ? r.media_assets[0] : r.media_assets) as Record<string, string> | null;
        return {
          asset_id: r.asset_id as string,
          image_url: m?.image_url ?? '',
          title: m?.title ?? undefined,
          caption: m?.caption ?? undefined,
          alt_text: m?.alt_text ?? undefined,
          quote: (r.quote as string) ?? undefined,
        };
      });
    });
    return data || [];
  },
};
