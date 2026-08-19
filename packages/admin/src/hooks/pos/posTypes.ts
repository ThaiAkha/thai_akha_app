/**
 * Manager POS - tipi (partecipante, gruppo/guest, quota classe, prodotto, riga ordine) e costanti
 * catalogo. Estratti da useManagerPos.ts (#16 split monstre) a comportamento invariato.
 */
export interface PosParticipant {
    user_id: string | null;
    full_name: string;
    avatar_url?: string;
    is_leader: boolean;
}

export interface Guest {
    internal_id: string;
    created_at?: string;
    full_name: string;
    avatar_url?: string;
    pax_count: number;
    booking_date: string;
    session_name: string;
    session_id: string;
    status: string;
    payment_method?: string;
    payment_status?: string;
    class_price_thb?: number;
    pos_tender?: string;
    pos_saved_at?: string | null;
    // Stato card: none=grigio · saved=arancione (teacher ha salvato) · cash=verde · card=blu (manager ha incassato).
    billingState?: 'none' | 'saved' | 'cash' | 'card';
    // MULTI-KITCHEN + SPLIT
    kitchen_id?: string | null;
    kitchen_name?: string | null;
    parent_booking_id?: string | null;
    is_split_child?: boolean;
    participants: PosParticipant[];
}

export interface ClassFeeItem {
    sku: '_class_fee';
    name: string;
    price: number;
    quantity: number;
    status: 'pending';
}

export interface Product {
    sku: string;
    name: string;
    price: number;
    category: string;
    sub_category?: string;
    stock: number;
    description?: string;
    image?: string;
}

export interface OrderItem {
    id?: string;
    sku: string;
    name: string;
    price: number;
    quantity: number;
    status: 'new' | 'pending' | 'paid';
}

export interface OrderRow {
    id: string;
    sku: string | null;
    quantity: number;
    unit_price_snapshot: number;
    status: 'new' | 'pending' | 'paid' | string | null;
    // Join to-one via FK: supabase-js infers an object, but arrays are still tolerated by the mapper.
    shop_akha: { item_name: string } | { item_name: string }[] | null;
}

// Categorie servizio (classi/tour) gestite AUTOMATICAMENTE dalle prenotazioni —
// non sono prodotti da vendere a banco, vanno nascoste dal catalogo POS (manager + teacher).
export const HIDDEN_POS_CATEGORIES = ['service_class', 'service_tour'];

export const SUB_LABELS: Record<string, string> = {
    bottle_big: 'Big Bottles',
    bottle_small: 'Small Bottles',
    can: 'Cans',
    import: 'Import / Craft',
    apparel: 'Apparel',
    gear: 'Equipment',
    red: 'Red Wine',
    white: 'White Wine',
    cooler: 'Coolers',
    general: 'General',
    all: 'All'
};
