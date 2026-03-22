import { useState, useEffect } from 'react';
import { audioService } from '@thaiakha/shared/services';
import { AudioAsset } from '@thaiakha/shared';

interface UseAudioAssetOptions {
  assetId?: string;
  categoryId?: string;
  /** Explicit URL fallback if not using Supabase assets */
  url?: string;
}

interface UseAudioAssetResult {
  asset: Partial<AudioAsset> | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch an audio asset from the `audio_assets` table or `recipe_categories`.
 * Supports `assetId` (string) and `categoryId` (string).
 */
export function useAudioAsset({ assetId, categoryId, url }: UseAudioAssetOptions): UseAudioAssetResult {
  const [asset, setAsset] = useState<Partial<AudioAsset> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have a direct URL but no assetId/categoryId, we wrap it in a partial asset
    if (!assetId && !categoryId && url) {
      setAsset({ audio_url: url, title: 'Audio Story' });
      setLoading(false);
      return;
    }

    if (!assetId && !categoryId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        let result: Partial<AudioAsset> | null = null;

        if (assetId) {
          result = await audioService.getAudioAsset(assetId);
        } else if (categoryId) {
          result = await audioService.getCategoryAudio(categoryId);
        }

        if (!cancelled) setAsset(result);
      } catch (err) {
        if (!cancelled) setError((err as Error).message ?? 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();

    return () => { cancelled = true; };
  }, [assetId, categoryId, url]);

  return { asset, loading, error };
}
