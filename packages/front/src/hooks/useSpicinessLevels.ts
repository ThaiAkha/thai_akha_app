import { useQuery } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';
import type { SpicinessLevel } from '@thaiakha/shared/types';

const NO_LEVELS: SpicinessLevel[] = [];

export const spicinessLevelsQueryKey = ['spiciness_levels'] as const;

/** Livelli di piccantezza (con foto) da spiciness_levels, via il service (fonte unica, #70). */
export function useSpicinessLevels() {
  const query = useQuery({
    queryKey: spicinessLevelsQueryKey,
    queryFn: () => contentService.getSpicinessLevels(),
  });
  return { spicinessLevels: query.data ?? NO_LEVELS, loading: query.isPending };
}
