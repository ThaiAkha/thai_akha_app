import { useEffect, useState } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';

export interface FrontHomeCard {
  id: string;
  title: string;
  description: string;
  link_label: string;
  target_path: string;
  image_url: string;
  icon_name: string;
  color_theme: 'cherry' | 'orange';
  display_order: number;
}

export function useFrontHomeCards() {
  const [cards, setCards] = useState<FrontHomeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCards = async () => {
      try {
        const { data, error: sbError } = await supabase
          .from('home_cards_front')
          .select('*')
          .eq('is_active', true)
          .order('display_order');

        if (sbError) throw sbError;
        if (!cancelled) setCards(data ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCards();
    return () => { cancelled = true; };
  }, []);

  return { cards, loading, error };
}
