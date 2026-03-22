import { useState, useEffect } from 'react';
import { mediaService } from '@thaiakha/shared/services';
import { MediaAsset } from '@thaiakha/shared';

interface UseMediaAssetOptions {
  /** Unique string identifier for the asset (e.g. 'class-01') */
  assetId?: string;
}

interface UseMediaAssetResult {
  asset: MediaAsset | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch a media asset from the `media_assets` table.
 * Provide `assetId` (string).
 */
export function useMediaAsset({ assetId }: UseMediaAssetOptions): UseMediaAssetResult {
  const [asset, setAsset] = useState<MediaAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assetId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        const result = await mediaService.getMediaAsset(assetId);
        if (!cancelled) setAsset(result);
      } catch (err) {
        if (!cancelled) setError((err as Error).message ?? 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();

    return () => { cancelled = true; };
  }, [assetId]);

  return { asset, loading, error };
}
