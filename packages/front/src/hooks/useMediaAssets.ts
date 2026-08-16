import { useEffect, useState } from 'react';
import { getMediaAssetsByIds, type MediaAssetLite } from '@thaiakha/shared/services';

/**
 * Risolve un set di asset_id (media_assets) in MediaAssetLite per i blocchi
 * ricchi Cherry. Batch + cache (lato service). Non blocca mai il render: torna
 * una mappa progressiva e `loading`. Le foto compaiono quando pronte.
 */
export function useMediaAssets(ids: string[]): {
  assets: Record<string, MediaAssetLite>;
  loading: boolean;
} {
  const key = ids.filter(Boolean).join(',');
  const [assets, setAssets] = useState<Record<string, MediaAssetLite>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!key) {
      setAssets({});
      return;
    }
    let alive = true;
    setLoading(true);
    getMediaAssetsByIds(key.split(','))
      .then(map => {
        if (alive) setAssets(map);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [key]);

  return { assets, loading };
}
