/**
 * Manager POS - caricamento dati del giorno: prenotazioni (scope kitchen), catalogo shop,
 * nomi kitchen, stato ordini → Guest[] + Product[]. Era il corpo di `initData` in
 * useManagerPos.ts (#16 split monstre): stesse query, stessa mappatura, ora funzione pura.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- righe Supabase non tipizzate (9 `any` ereditati dall'originale).
   NON estendere questo file con altro codice: qui vive solo la mappatura DB → Guest/Product. */
import { supabase } from '@thaiakha/shared/lib/supabase';
import { kitchenScope } from '../../lib/kitchenScope';
import type { UserProfile } from '../../services/auth.service';
import { HIDDEN_POS_CATEGORIES, type Guest, type PosParticipant, type Product } from './posTypes';

export async function loadPosData(selectedDate: string, user: UserProfile | null): Promise<{ guests: Guest[]; products: Product[] }> {
    // MULTI-KITCHEN (scope A) — la teacher loggata vede solo i clienti della sua kitchen.
    const scope = kitchenScope(user);
    // Solo OGGI: manager e kitchen fatturano sempre la classe del giorno corrente
    // (no finestra multi-giorno → impossibile fatturare per sbaglio un giorno passato).
    let bookingsQuery = supabase
        .from('bookings')
        .select(`
            internal_id, created_at, user_id, guest_name, booking_date, pax_count, status, session_id,
            payment_method, payment_status, pos_tender, pos_saved_at, kitchen_id, parent_booking_id, is_split_child,
            profiles:user_id (full_name, avatar_url, role),
            booking_participants ( user_id, is_leader, profiles:user_id (full_name, avatar_url) ),
            class_sessions (display_name, price_thb)
        `)
        .eq('booking_date', selectedDate)
        .neq('status', 'cancelled');
    if (scope) bookingsQuery = bookingsQuery.eq('kitchen_id', scope);
    const { data: bookings } = await bookingsQuery
        .order('booking_date', { ascending: true })
        .order('pickup_time', { ascending: true });

    const { data: shopItems } = await supabase
        .from('shop_akha')
        .select('*')
        .eq('is_active', true);

    // Kitchen (teacher) names per il raggruppamento colonna POS
    const kitchenIds = Array.from(new Set(((bookings as any[]) ?? []).map(b => b.kitchen_id).filter(Boolean)));
    const kitchenNames = new Map<string, string>();
    if (kitchenIds.length) {
        const { data: ks } = await supabase.from('profiles').select('id, full_name').in('id', kitchenIds as string[]);
        ((ks as any[]) ?? []).forEach(k => kitchenNames.set(k.id, k.full_name));
    }
    // Stato ordini per booking → colore card (pending=arancione salvato · paid=verde)
    const bookingIds = Array.from(new Set(((bookings as any[]) ?? []).map(b => b.internal_id)));
    const ordAgg = new Map<string, { hasPending: boolean; hasPaid: boolean }>();
    if (bookingIds.length) {
        const { data: ords } = await supabase.from('shop_orders').select('booking_id, status').in('booking_id', bookingIds as string[]);
        ((ords as { booking_id: string; status: string | null }[]) ?? []).forEach(o => {
            const a = ordAgg.get(o.booking_id) ?? { hasPending: false, hasPaid: false };
            if (o.status === 'paid') a.hasPaid = true; else a.hasPending = true;
            ordAgg.set(o.booking_id, a);
        });
    }
    const NON_GUEST = new Set(['agency', 'admin', 'manager', 'kitchen', 'driver', 'logistics']);

    const guests: Guest[] = ((bookings as any[]) ?? []).map((b: any) => {
        const ownerProf = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
        const parts: PosParticipant[] = ((b.booking_participants ?? []) as any[]).map((bp: any) => {
            const pr = Array.isArray(bp.profiles) ? bp.profiles[0] : bp.profiles;
            return { user_id: bp.user_id ?? null, full_name: pr?.full_name ?? 'Guest', avatar_url: pr?.avatar_url, is_leader: !!bp.is_leader };
        });
        // Owner-guest come partecipante (per l'utente normale i dati stanno sull'owner)
        if (b.user_id && ownerProf && !NON_GUEST.has(ownerProf.role) && !parts.some(p => p.user_id === b.user_id)) {
            parts.unshift({ user_id: b.user_id, full_name: ownerProf.full_name || b.guest_name || 'Guest', avatar_url: ownerProf.avatar_url, is_leader: true });
        }
        // Stato card = stato ORDINI bibite (la quota classe è gestita a parte): nessun ordine =
        // grigio · ordini pending = arancione (salvato teacher) · tutti paid = verde (incassato manager).
        const agg = ordAgg.get(b.internal_id);
        const saved = !!b.pos_saved_at || (!!agg && agg.hasPending);
        const billingState: Guest['billingState'] =
            b.pos_tender === 'card' ? 'card'
                : b.pos_tender === 'cash' ? 'cash'
                    : saved ? 'saved' : 'none';
        return {
            internal_id: b.internal_id,
            created_at: b.created_at,
            full_name: b.guest_name || ownerProf?.full_name || 'Walk-in Guest',
            avatar_url: ownerProf?.avatar_url,
            pax_count: b.pax_count || 1,
            booking_date: b.booking_date,
            session_name: (Array.isArray(b.class_sessions) ? b.class_sessions[0] : b.class_sessions)?.display_name || 'Class',
            session_id: b.session_id || 'all',
            status: b.status || 'unknown',
            payment_method: b.payment_method || undefined,
            payment_status: b.payment_status || undefined,
            pos_tender: b.pos_tender || undefined,
            pos_saved_at: b.pos_saved_at ?? null,
            class_price_thb: (Array.isArray(b.class_sessions) ? b.class_sessions[0] : b.class_sessions)?.price_thb,
            kitchen_id: b.kitchen_id ?? null,
            kitchen_name: b.kitchen_id ? (kitchenNames.get(b.kitchen_id) ?? null) : null,
            parent_booking_id: b.parent_booking_id ?? null,
            is_split_child: !!b.is_split_child,
            participants: parts,
            billingState,
        } as Guest;
    });

    const products: Product[] = ((shopItems as any[]) || [])
        .filter((p: any) => !HIDDEN_POS_CATEGORIES.includes(p.category_id))
        .map((p: any) => ({
        sku: p.sku,
        name: p.item_name,
        price: p.price_thb,
        stock: p.stock_quantity || 0,
        category: p.category_id || '',
        sub_category: p.sub_category || 'general',
        description: p.description_internal,
        image: p.catalog_image_url
    })) || [];

    return { guests, products };
}
