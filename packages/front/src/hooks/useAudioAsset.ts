/**
 * useAudioAsset - riga `audio_assets` (o audio di una content_category) via TanStack (#86).
 * Gemello audio di useMediaAsset: chiave `['audio_asset', assetId]` /
 * `['category_audio', categoryId]`; niente `let cancelled`, StrictMode non raddoppia.
 */
import { useMemo } from 'react';
import { useQuery } from '@thaiakha/shared/query';
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
 * Hook to fetch an audio asset from the `audio_assets` table or `content_categories`.
 * Supports `assetId` (string) and `categoryId` (string).
 */
export function useAudioAsset({ assetId, categoryId, url }: UseAudioAssetOptions): UseAudioAssetResult {
  const byAsset = Boolean(assetId);
  const byCategory = !byAsset && Boolean(categoryId);
  const enabled = byAsset || byCategory;

  const query = useQuery({
    queryKey: byAsset ? (['audio_asset', assetId ?? ''] as const) : (['category_audio', categoryId ?? ''] as const),
    queryFn: (): Promise<Partial<AudioAsset> | null> =>
      byAsset ? audioService.getAudioAsset(assetId!) : audioService.getCategoryAudio(categoryId!),
    enabled,
  });

  // If we have a direct URL but no assetId/categoryId, we wrap it in a partial asset
  const urlAsset = useMemo<Partial<AudioAsset> | null>(
    () => (!enabled && url ? { audio_url: url, title: 'Audio Story' } : null),
    [enabled, url],
  );

  return {
    asset: enabled ? (query.data ?? null) : urlAsset,
    loading: enabled && query.isPending,
    error: query.error ? (query.error instanceof Error ? query.error.message : String(query.error)) : null,
  };
}
