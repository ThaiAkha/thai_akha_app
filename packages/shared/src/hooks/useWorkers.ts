import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Worker, WorkerRole } from '../types/workers.types';

// authors + worker_roles(!inner) filtered by role. Light module cache per role-set:
// the staff list changes rarely and selectors mount often (every market/POS screen).
const cache = new Map<string, { at: number; workers: Worker[] }>();
const TTL_MS = 5 * 60 * 1000;

interface Row {
  id: string;
  name: string;
  avatar_asset_id: string | null;
  display_order: number | null;
  profile_id: string | null;
  worker_roles: { role: string; is_primary: boolean }[] | null;
  avatar: { image_url: string | null } | { image_url: string | null }[] | null;
}

const rowToWorker = (r: Row): Worker => {
  const av = Array.isArray(r.avatar) ? r.avatar[0] : r.avatar;
  const roles = (r.worker_roles ?? []);
  return {
    id: r.id,
    name: r.name,
    avatarAssetId: r.avatar_asset_id,
    avatarUrl: av?.image_url ?? null,
    isPrimary: roles.some(x => x.is_primary),
    roles: roles.map(x => x.role as WorkerRole),
    displayOrder: r.display_order ?? 999,
    profileId: r.profile_id,
  };
};

export async function fetchWorkers(roles: readonly WorkerRole[]): Promise<Worker[]> {
  const key = [...roles].sort().join('|') || '*';
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.workers;

  let q = supabase
    .from('authors')
    .select('id, name, avatar_asset_id, display_order, profile_id, worker_roles!inner(role, is_primary), avatar:media_assets!avatar_asset_id(image_url)')
    .eq('is_active', true)
    .eq('is_organization', false)
    .eq('is_ai_agent', false);
  if (roles.length > 0) q = q.in('worker_roles.role', [...roles]);
  const { data, error } = await q;
  if (error) throw error;

  const workers = ((data ?? []) as unknown as Row[])
    .map(rowToWorker)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
  cache.set(key, { at: Date.now(), workers });
  return workers;
}

export function invalidateWorkersCache(): void { cache.clear(); }

/**
 * Active staff wearing at least one of `roles` (empty array = every worker),
 * primary hat first, then display_order. Selectors filter by the FUNCTION of the
 * screen (teacher flow → ['teacher'], logistics flow → ['logistics','setup']), never by login.
 */
export function useWorkers(roles: readonly WorkerRole[]) {
  const key = useMemo(() => [...roles].sort().join('|'), [roles]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchWorkers(key ? (key.split('|') as WorkerRole[]) : [])
      .then(w => { if (alive) { setWorkers(w); setError(null); } })
      .catch((e: unknown) => { if (alive) setError(e instanceof Error ? e.message : 'workers'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [key]);

  return { workers, loading, error };
}

/**
 * The worker linked to the logged-in profile (authors.profile_id = auth uid), if any.
 * Personal logins (At, Kasem, Svevo) skip the "Who are you?" question.
 */
export function useMyWorkerId(profileId: string | null | undefined) {
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  useEffect(() => {
    let alive = true;
    setResolved(false);
    if (!profileId) { setWorkerId(null); setResolved(true); return; }
    supabase.from('authors').select('id').eq('profile_id', profileId).eq('is_active', true).limit(1)
      .then(({ data }) => { if (alive) { setWorkerId(data?.[0]?.id ?? null); setResolved(true); } });
    return () => { alive = false; };
  }, [profileId]);
  return { workerId, resolved };
}
