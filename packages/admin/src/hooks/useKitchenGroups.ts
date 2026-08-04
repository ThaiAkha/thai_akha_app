import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { useAuth } from '../context/AuthContext';
import { kitchenScope } from '../lib/kitchenScope';

// ── Types ────────────────────────────────────────────────────────────────────
export interface KitchenMenu {
  curry: string | null;
  soup: string | null;
  stirfry: string | null;
  profile: string | null;
  allergies: string[];
  spiciness: number | null;
}

export interface KitchenProfile {
  full_name: string | null;
  avatar_url: string | null;
  nationality: string | null;
  age: number | null;
  gender: string | null;
  dietary_profile: string | null;
  allergies: string[];
  preferred_spiciness_id: number | null;
  whatsapp: boolean | null;
}

export interface KitchenParticipant {
  id: string;
  user_id: string | null;
  is_leader: boolean;
  profile: KitchenProfile | null;
  menu: KitchenMenu | null;
}

export interface KitchenGroup {
  id: string;
  booking_date: string;
  session_id: string | null;
  pax_count: number;
  status: string | null;
  hotel_name: string | null;
  pickup_time: string | null;
  pickup_zone: string | null;
  meeting_point: string | null;
  participants: KitchenParticipant[];
  placeholders: number; // pax not yet registered with a code
  leaderName: string;   // who the booking belongs to: agency name / parent / self-booking guest
  ownerRole: string | null;
  parentId?: string | null; // PAYMENT-SPLIT: figli vengono fusi nel padre (vista kitchen = gruppo intero)
  paymentStatus: string | null;
  phone: string | null;       // booking contact phone (prefix + number)
  ownerEmail: string | null;
  ownerPhone: string | null;  // agency phone
  ownerLineId: string | null;
}

export interface KitchenDay {
  date: string;
  morning: number; // pax
  evening: number;
}

const WINDOW_DAYS = 21;
const toISO = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];

function normAllergies(a: unknown): string[] {
  if (Array.isArray(a)) return a.map(String).filter(Boolean);
  if (typeof a === 'string' && a.trim()) return a.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

export function useKitchenGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<KitchenGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const end = new Date(today); end.setDate(today.getDate() + WINDOW_DAYS);

      // MULTI-KITCHEN (scope A) — la teacher loggata vede solo i gruppi della sua kitchen.
      const scope = kitchenScope(user);
      let bookingsQuery = supabase
        .from('bookings')
        .select(`
          internal_id, user_id, booking_date, session_id, pax_count, status, hotel_name, pickup_time, pickup_zone, meeting_point,
          payment_status, phone_number, phone_prefix, parent_booking_id,
          owner:user_id ( full_name, avatar_url, role, agency_company_name, email, agency_phone, line_id, nationality, age, gender, dietary_profile, allergies, preferred_spiciness_id, whatsapp ),
          booking_participants (
            id, is_leader, user_id,
            profiles:user_id ( full_name, avatar_url, nationality, age, gender, dietary_profile, allergies, preferred_spiciness_id, whatsapp )
          )
        `)
        .gte('booking_date', toISO(today))
        .lte('booking_date', toISO(end));
      if (scope) bookingsQuery = bookingsQuery.eq('kitchen_id', scope);
      const { data: bookings } = await bookingsQuery
        .order('booking_date', { ascending: true })
        .order('session_id', { ascending: true });

      const rows = (bookings ?? []) as unknown as Record<string, unknown>[];
      // bookings PK is internal_id (NOT id); booking_participants.booking_id → internal_id
      const bookingIds = rows.map(r => r.internal_id as string);

      // Menu selections + recipe names (curry/soup/stirfry → dish name)
      const menuByUserBooking = new Map<string, KitchenMenu>();
      if (bookingIds.length) {
        const { data: menus } = await supabase
          .from('menu_selections')
          .select('user_id, booking_id, curry_id, soup_id, stirfry_id, selected_profile, selected_allergies, spiciness_id')
          .in('booking_id', bookingIds);

        const dishIds = new Set<string>();
        (menus ?? []).forEach((m: Record<string, unknown>) => {
          (['curry_id', 'soup_id', 'stirfry_id'] as const).forEach(k => { if (m[k]) dishIds.add(m[k] as string); });
        });
        const nameById = new Map<string, string>();
        if (dishIds.size) {
          const { data: recipes } = await supabase.from('recipes').select('id, name').in('id', Array.from(dishIds));
          (recipes ?? []).forEach((r: Record<string, unknown>) => nameById.set(r.id as string, r.name as string));
        }
        (menus ?? []).forEach((m: Record<string, unknown>) => {
          menuByUserBooking.set(`${m.user_id}_${m.booking_id}`, {
            curry: m.curry_id ? (nameById.get(m.curry_id as string) ?? null) : null,
            soup: m.soup_id ? (nameById.get(m.soup_id as string) ?? null) : null,
            stirfry: m.stirfry_id ? (nameById.get(m.stirfry_id as string) ?? null) : null,
            profile: (m.selected_profile as string) ?? null,
            allergies: normAllergies(m.selected_allergies),
            spiciness: (m.spiciness_id as number) ?? null,
          });
        });
      }

      const out: KitchenGroup[] = rows.map(r => {
        const parts = ((r.booking_participants ?? []) as Record<string, unknown>[]).map(p => {
          const prof = p.profiles as Record<string, unknown> | null;
          const profile: KitchenProfile | null = prof ? {
            full_name: (prof.full_name as string) ?? null,
            avatar_url: (prof.avatar_url as string) ?? null,
            nationality: (prof.nationality as string) ?? null,
            age: (prof.age as number) ?? null,
            gender: (prof.gender as string) ?? null,
            dietary_profile: (prof.dietary_profile as string) ?? null,
            allergies: normAllergies(prof.allergies),
            preferred_spiciness_id: (prof.preferred_spiciness_id as number) ?? null,
            whatsapp: (prof.whatsapp as boolean) ?? null,
          } : null;
          return {
            id: p.id as string,
            user_id: (p.user_id as string) ?? null,
            is_leader: Boolean(p.is_leader),
            profile,
            menu: menuByUserBooking.get(`${p.user_id}_${r.internal_id}`) ?? null,
          } as KitchenParticipant;
        });
        // Utente NORMALE (guest): i suoi dati (avatar/dieta/allergie/nazionalità) stanno sul profilo
        // OWNER del booking, non in booking_participants. Lo aggiungo come partecipante (leader) se è
        // un guest e non è già tra i partecipanti registrati.
        const ownerId = (r.user_id as string) ?? null;
        const ownerProf = r.owner as Record<string, unknown> | null;
        const NON_GUEST = new Set(['agency', 'admin', 'manager', 'kitchen', 'driver', 'logistics']);
        if (ownerId && ownerProf && !NON_GUEST.has((ownerProf.role as string) ?? '') && !parts.some(p => p.user_id === ownerId)) {
          parts.unshift({
            id: `owner-${r.internal_id}`,
            user_id: ownerId,
            is_leader: true,
            profile: {
              full_name: (ownerProf.full_name as string) ?? null,
              avatar_url: (ownerProf.avatar_url as string) ?? null,
              nationality: (ownerProf.nationality as string) ?? null,
              age: (ownerProf.age as number) ?? null,
              gender: (ownerProf.gender as string) ?? null,
              dietary_profile: (ownerProf.dietary_profile as string) ?? null,
              allergies: normAllergies(ownerProf.allergies),
              preferred_spiciness_id: (ownerProf.preferred_spiciness_id as number) ?? null,
              whatsapp: (ownerProf.whatsapp as boolean) ?? null,
            },
            menu: menuByUserBooking.get(`${ownerId}_${r.internal_id}`) ?? null,
          } as KitchenParticipant);
        }
        const registered = parts.filter(p => p.user_id).length;
        const pax = (r.pax_count as number) ?? parts.length;
        // Group leader = the booking owner (agency → company name, otherwise the
        // booking holder's name), falling back to the flagged leader participant.
        const owner = r.owner as Record<string, unknown> | null;
        const ownerRole = (owner?.role as string) ?? null;
        const leaderName = ownerRole === 'agency'
          ? ((owner?.agency_company_name as string) || (owner?.full_name as string) || 'Agency')
          : ((owner?.full_name as string) || parts.find(p => p.is_leader)?.profile?.full_name || 'Guest');
        const phone = [r.phone_prefix, r.phone_number].filter(Boolean).join(' ').trim() || null;
        return {
          id: r.internal_id as string,
          leaderName,
          ownerRole,
          parentId: (r.parent_booking_id as string) ?? null,
          paymentStatus: (r.payment_status as string) ?? null,
          phone,
          ownerEmail: (owner?.email as string) ?? null,
          ownerPhone: (owner?.agency_phone as string) ?? null,
          ownerLineId: (owner?.line_id as string) ?? null,
          booking_date: r.booking_date as string,
          session_id: (r.session_id as string) ?? null,
          pax_count: pax,
          status: (r.status as string) ?? null,
          hotel_name: (r.hotel_name as string) ?? null,
          pickup_time: (r.pickup_time as string) ?? null,
          pickup_zone: (r.pickup_zone as string) ?? null,
          meeting_point: (r.meeting_point as string) ?? null,
          participants: parts,
          placeholders: Math.max(0, pax - registered),
        };
      });

      // PAYMENT-SPLIT — fonde i figli (parent_booking_id) nel padre: fuori dal POS il gruppo
      // resta intero (partecipanti + pax aggregati). Lo split-pagamento è invisibile qui.
      const byId = new Map(out.map(g => [g.id, g]));
      const folded: KitchenGroup[] = [];
      for (const g of out) {
        const parent = g.parentId ? byId.get(g.parentId) : undefined;
        if (parent) {
          parent.participants.push(...g.participants);
          parent.pax_count += g.pax_count;
        } else {
          folded.push(g);
        }
      }
      folded.forEach(g => {
        const reg = g.participants.filter(p => p.user_id).length;
        g.placeholders = Math.max(0, g.pax_count - reg);
      });

      setGroups(folded);
    } catch (err) {
      console.error('useKitchenGroups error:', err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [user]); // MULTI-KITCHEN (scope A): user → scope kitchen

  useEffect(() => { fetchData(); }, [fetchData]);

  // Left-nav: days with morning/evening pax counts
  const days = useMemo<KitchenDay[]>(() => {
    const map = new Map<string, KitchenDay>();
    for (const g of groups) {
      const d = map.get(g.booking_date) ?? { date: g.booking_date, morning: 0, evening: 0 };
      if (g.session_id === 'evening_class') d.evening += g.pax_count;
      else d.morning += g.pax_count;
      map.set(g.booking_date, d);
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [groups]);

  return { groups, days, loading, refetch: fetchData };
}
