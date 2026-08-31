import { useQuery } from '@thaiakha/shared/query';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { getInfoPage } from '../services/infoPages.service';

// ─── Team (tabella authors — fonte unica lavoratori) ─────────────────────────
// staff_group (founders|teacher|helper|setup|extra|drivers|cherry) → header
// page_sections `about-role-{group}`. Ordine di esposizione = display_order (DB).
export interface TeamMember {
  id: string;
  name: string;
  title: string | null;
  description: string | null;
  avatar_url: string | null;
  expertise_tags: string[] | null;
  is_ai_agent: boolean;
  staff_group: string;
  display_order: number;
}

const NO_TEAM: TeamMember[] = [];

export const ABOUT_SLUG = 'about-thai-akha-kitchen';
export const aboutTeamQueryKey = ['about_team'] as const;
export const infoPageQueryKey = (slug: string) => ['info_page', slug] as const;

/**
 * Pagina About: team attivo (authors, avatar da media_assets) + corpo della story
 * (info_page_sections via getInfoPage). Era `useEffect + Promise.all + cancelled` dentro
 * la pagina (CLAUDE.md #17): stesse due letture, ora in cache.
 */
export function useAboutUsData() {
  const team = useQuery({
    queryKey: aboutTeamQueryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('id, name, title, description, expertise_tags, is_ai_agent, staff_group, display_order, avatar:media_assets!avatar_asset_id(image_url)')
        .eq('is_active', true)
        .is('terminated_at', null)
        .not('staff_group', 'is', null)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(row => {
        const av = (row as Record<string, unknown>).avatar as { image_url?: string } | null;
        return { ...row, avatar_url: av?.image_url ?? null } as unknown as TeamMember;
      });
    },
  });

  const story = useQuery({
    queryKey: infoPageQueryKey(ABOUT_SLUG),
    queryFn: () => getInfoPage(ABOUT_SLUG),
  });

  return {
    team: team.data ?? NO_TEAM,
    story: story.data ?? null,
    loading: team.isPending || story.isPending,
  };
}
