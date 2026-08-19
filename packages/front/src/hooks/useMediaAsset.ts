/**
 * useMediaAsset / useMediaAssets - UNICO hook per `media_assets` (#86 F1).
 *
 * Fonde il vecchio useMediaAsset (riga singola, mediaService.getMediaAsset) e
 * useMediaAssets (batch Cherry, cherryMedia.service con Map a modulo).
 *
 * Modello cache (TanStack Query):
 * - ogni asset vive nella cache come `['media_asset', assetId]` (riga completa MediaAsset);
 * - il batch `useMediaAssets(ids)` fa UNA query `.in()` solo per gli id non ancora
 *   in cache, poi semina le voci singole: una gallery Cherry = 1 richiesta,
 *   e una StatCard che chiede lo stesso asset dopo non ne fa nessuna;
 * - niente `let cancelled`: risultati fuori tempo e StrictMode li gestisce il client.
 *
 * Usage:
 *   const { asset, loading, error } = useMediaAsset({ assetId: 'class-01' });
 *   const { assets, loading } = useMediaAssets(['ing-01', 'ing-02']);  // Record<asset_id, MediaAsset>
 */

import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@thaiakha/shared/query';
import { mediaService } from '@thaiakha/shared/services';
import type { MediaAsset } from '@thaiakha/shared';

export const mediaAssetQueryKey = (assetId: string) => ['media_asset', assetId] as const;

const normalizeIds = (ids: readonly (string | undefined | null)[]): string[] =>
  Array.from(new Set(ids.filter((id): id is string => Boolean(id))));

// ─── Batch ───────────────────────────────────────────────────────────────────

export interface UseMediaAssetsResult {
  /** Mappa asset_id → riga; gli asset non trovati mancano dalla mappa. */
  assets: Record<string, MediaAsset>;
  loading: boolean;
}

export function useMediaAssets(ids: readonly (string | undefined | null)[]): UseMediaAssetsResult {
  const queryClient = useQueryClient();
  const key = normalizeIds(ids).sort().join(',');

  const query = useQuery({
    queryKey: ['media_assets', key] as const,
    enabled: key.length > 0,
    queryFn: async (): Promise<Record<string, MediaAsset>> => {
      const wanted = key.split(',');
      const out: Record<string, MediaAsset> = {};
      const missing: string[] = [];
      for (const id of wanted) {
        // Anche `null` (asset non trovato, gia' seminato) e' una risposta: niente rifetch.
        const state = queryClient.getQueryState<MediaAsset | null>(mediaAssetQueryKey(id));
        if (state?.data) out[id] = state.data;
        else if (state?.data !== null) missing.push(id);
      }
      if (missing.length > 0) {
        const rows = await mediaService.getMediaAssetRows(missing);
        for (const row of rows) {
          if (!row.asset_id) continue;
          out[row.asset_id] = row;
          queryClient.setQueryData(mediaAssetQueryKey(row.asset_id), row);
        }
        // Semina anche i "non trovati": la singola useMediaAsset non ripete la query.
        for (const id of missing) {
          if (!out[id]) queryClient.setQueryData(mediaAssetQueryKey(id), null);
        }
      }
      return out;
    },
  });

  const assets = useMemo(() => query.data ?? {}, [query.data]);
  return { assets, loading: key.length > 0 && query.isPending };
}

// ─── Singolo ─────────────────────────────────────────────────────────────────

interface UseMediaAssetOptions {
  /** Identificatore stringa dell'asset (es. 'class-01'). Se assente: nessuna query, loading=false. */
  assetId?: string | null;
}

interface UseMediaAssetResult {
  asset: MediaAsset | null;
  loading: boolean;
  error: string | null;
}

export function useMediaAsset({ assetId }: UseMediaAssetOptions): UseMediaAssetResult {
  const id = assetId ?? '';
  const query = useQuery({
    queryKey: mediaAssetQueryKey(id),
    queryFn: () => mediaService.getMediaAsset(id),
    enabled: id.length > 0,
  });

  return {
    asset: query.data ?? null,
    loading: id.length > 0 && query.isPending,
    error: query.error ? (query.error instanceof Error ? query.error.message : String(query.error)) : null,
  };
}
