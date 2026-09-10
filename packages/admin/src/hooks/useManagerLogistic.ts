import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import { supabase } from '@thaiakha/shared/lib/supabase';
import type { Tables, MeetingPointType } from '@thaiakha/shared/types';
import { zoneNeedsDriver, WALK_IN_ZONE, pickupPlaceUnset, isWalkOff } from '@thaiakha/shared/lib/pickupCategory';
import type { DropoffState } from '@thaiakha/shared/lib/pickupCategory';
import { SessionType } from '../components/common/ClassPicker';

// --- COSTANTI DI DOMINIO ---

/**
 * Sentinello UI per "nessuna zona": la colonna nel DB e' NULL, ma la UI confronta
 * stringhe e ha bisogno di un valore. Non e' una zona e **non deve mai tornare nel
 * database**: `pickup_zone` ha una FK verso `pickup_zones(id)`, e nessuna riga ha
 * quell'id.
 * Fino al 2026-09-09 il salvataggio rimandava indietro 'pending' tale e quale, quindi
 * salvare una prenotazione senza zona falliva - e falliva in silenzio, perche' l'errore
 * non veniva ne' letto ne' mostrato. Sono esattamente le righe che questa pagina ha
 * iniziato a mostrare lo stesso giorno.
 */
export const ZONE_UNSET = 'pending';

/**
 * Serve un autista a questa prenotazione? Le tre categorie, la loro storia e i casi
 * limite stanno in `@thaiakha/shared/lib/pickupCategory` con i loro test: qui c'e' solo
 * l'adattamento all'item di questa pagina.
 */
export const needsDriver = (item: LogisticsItem): boolean =>
    zoneNeedsDriver(item.meeting_point, item.meeting_point_type, item.pickup_zone);

/**
 * Chi riporta a casa questa prenotazione.
 *
 * REGOLA DELL'OWNER (2026-09-09): **nel walk-in la riconsegna non puo' avere "driver same
 * as pickup"**. Il ripiego `dropoff_driver_uid || pickup_driver_uid` e' legittimo per le
 * altre due categorie — lo stesso autista che ti ha preso ti riporta — ma per chi arriva
 * da se' non c'e' nessun autista da ereditare: attribuire il ritorno all'autista del
 * ritiro significherebbe darlo a qualcuno che non e' mai passato. E succede per davvero,
 * perche' la console admin assegnava l'autista di default anche sui walk-in (corretto
 * oggi, ma le righe nate cosi' esistono). Per un walk-in il ritorno va detto, non dedotto.
 */
export const dropoffDriverOf = (item: LogisticsItem): string | null =>
    needsDriver(item)
        ? (item.dropoff_driver_uid || item.pickup_driver_uid)
        : item.dropoff_driver_uid;

/**
 * Lo stato della riconsegna di questa riga, nella forma che legge il criterio condiviso.
 *
 * Esiste perche' `dropoff_mode` e' arrivata nel database il 2026-09-10 e per un giorno
 * intero NESSUNO l'ha letta: la pagina non la chiedeva nemmeno nella select, e girava
 * ancora sulla booleana che significa due cose opposte. Il lettore condiviso aveva gia'
 * il parametro per riceverla, facoltativo "per non rompere i chiamanti mentre migrano",
 * e l'unico chiamante non glielo passava. Un parametro facoltativo aggiunto per migrare
 * dolcemente e' una migrazione che non parte mai.
 */
export const dropoffStateOf = (item: LogisticsItem): DropoffState =>
    ({ mode: item.dropoff_mode, meetingPoint: item.dropoff_meeting_point });

/**
 * Se ne va da se'? Criterio unico della pagina, il nome prima dei sintomi.
 * Regola, casi limite e test in `@thaiakha/shared/lib/pickupCategory` (`isWalkOff`).
 */
export const walkOffOf = (item: LogisticsItem): boolean =>
    isWalkOff(item.requires_dropoff, dropoffStateOf(item));

export { WALK_IN_ZONE };

// --- TYPES ---
export interface LogisticsItem {
    id: string;
    guest_name: string;
    pax: number;
    hotel_name: string;
    pickup_time: string;
    pickup_zone: string;
    route_order: number;
    avatar_url?: string;
    pickup_driver_uid: string | null;
    has_missing_info: boolean;
    customer_note?: string;
    agency_note?: string;
    phone_number?: string;
    session_id: string;
    booking_date: string;
    transport_status: string;
    // Drop-off fields
    requires_dropoff: boolean;
    /**
     * `bookings.dropoff_mode`: i cinque nomi ('same' | 'to_define' | 'none' | 'point' |
     * 'hotel'). NULL = riga non ancora convertita, si ripiega su `requires_dropoff`.
     * Non e' tipizzata `DropoffMode` di proposito: dal database arriva `string | null`,
     * e restringerla qui vorrebbe dire un cast che afferma una cosa non verificata.
     */
    dropoff_mode: string | null;
    /** `bookings.dropoff_meeting_point`: il vincolo del DB lo lega a mode 'point'. */
    dropoff_meeting_point: string | null;
    dropoff_hotel: string | null;
    dropoff_zone: string | null;
    dropoff_driver_uid: string | null;
    dropoff_sequence: number;
    pickup_sequence: number;
    // Meeting point
    /** ID di meeting_points (o '' = modalita' punto d'incontro senza scelta, mai salvato). */
    meeting_point: string | null;
    /** Nome del punto, solo per la UI: non si salva. */
    meeting_point_name: string | null;
    /** Tipo del punto, solo per la UI: decide se serve un autista. Vedi needsDriver. */
    meeting_point_type: MeetingPointType | null;
    // Zone color
    pickup_zone_color: string | null;
    // Luggage
    has_luggage: boolean;
}

/**
 * Riga della select bookings + profiles:user_id (join non inferibile da PostgREST: relazione ambigua).
 * Base Tables<'bookings'>; i campi che LogisticsItem consuma come NON nulli (pax_count, session_id,
 * transport_status, note, phone) sono ristretti qui esattamente come faceva il vecchio `any`.
 */
type LogisticBookingRow = Omit<Pick<Tables<'bookings'>,
    | 'internal_id' | 'pax_count' | 'hotel_name' | 'pickup_zone' | 'pickup_time' | 'route_order'
    | 'customer_note' | 'agency_note' | 'pickup_driver_uid' | 'phone_number' | 'session_id'
    | 'booking_date' | 'transport_status' | 'guest_name' | 'guest_email'
    | 'requires_dropoff' | 'dropoff_hotel' | 'dropoff_zone' | 'dropoff_driver_uid'
    | 'dropoff_mode' | 'dropoff_meeting_point'
    | 'dropoff_sequence' | 'pickup_sequence' | 'meeting_point' | 'has_luggage'
>, 'pax_count' | 'session_id' | 'transport_status' | 'customer_note' | 'agency_note' | 'phone_number'> & {
    pax_count: number;
    session_id: string;
    transport_status: string;
    customer_note?: string;
    agency_note?: string;
    phone_number?: string;
    profiles: { full_name: string | null; avatar_url?: string } | null;
};

export interface DriverProfile {
    id: string;
    full_name: string;
    avatar_url?: string;
}

export interface SessionSummary {
    date: string;
    session_id: string;
    unassigned_count: number;
}

export interface HotelOption {
    id: string;
    name: string;
    zone_id: string | null;
}

export interface MeetingPointOption {
    id: string;
    name: string;
    /** 'pickup' | 'walk_in' | 'dropoff': non era caricato, e senza di lui la pagina
        non poteva distinguere le tre categorie di ritiro. */
    point_type: MeetingPointType;
    /**
     * Serve anche per la RICONSEGNA? Non e' deducibile da `point_type`: l'aeroporto e la
     * stazione sono di tipo 'pickup' e valgono per entrambe le gambe, mentre i due
     * mercati del weekend sono di sola riconsegna. E' la colonna che dice quali punti
     * puo' offrire il comando del ritorno.
     */
    is_dropoff_point: boolean;
    morning_pickup_time: string | null;
    evening_pickup_time: string | null;
}

export interface PickupZoneOption {
    id: string;
    name: string;
    color_code: string | null;
    morning_pickup_time: string | null;
    evening_pickup_time: string | null;
}

/** Vuoti stabili: `[]` inline sarebbe un riferimento nuovo a ogni render. */
const NO_HOTELS: HotelOption[] = [];
const NO_MEETING_POINTS: MeetingPointOption[] = [];
const NO_ZONES: PickupZoneOption[] = [];

export const logisticReferenceQueryKey = ['logistic', 'reference_data'] as const;

async function fetchLogisticReference() {
    const [hotelRes, mpRes, zoneRes] = await Promise.all([
        supabase
            .from('hotel_locations')
            .select('id, name, zone_id')
            .eq('is_active', true)
            .eq('review_status', 'approved')
            .order('name', { ascending: true }),
        supabase
            .from('meeting_points')
            .select('id, name, point_type, is_dropoff_point, morning_pickup_time, evening_pickup_time')
            .eq('active', true)
            .order('name', { ascending: true }),
        supabase
            .from('pickup_zones')
            .select('id, name, color_code, morning_pickup_time, evening_pickup_time')
            .order('display_order', { ascending: true }),
    ]);
    return {
        hotels: (hotelRes.data ?? []) as HotelOption[],
        meetingPoints: (mpRes.data ?? []) as MeetingPointOption[],
        pickupZones: (zoneRes.data ?? []) as PickupZoneOption[],
    };
}

export function useManagerLogistic() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [items, setItems] = useState<LogisticsItem[]>([]);
    const [drivers, setDrivers] = useState<DriverProfile[]>([]);
    const [upcomingSessions, setUpcomingSessions] = useState<SessionSummary[]>([]);
    /** Ultimo errore di scrittura, da mostrare: prima venivano scartati in silenzio. */
    const [actionError, setActionError] = useState<string | null>(null);

    // Reference data
    // Dati di riferimento: alberghi, punti di ritrovo e zone. Non cambiano quasi
    // mai, e prima venivano riletti a ogni montaggio della pagina. Una chiave sola,
    // condivisa da chiunque li chieda.
    const referenceQuery = useQuery({
        queryKey: logisticReferenceQueryKey,
        queryFn: fetchLogisticReference,
    });
    const hotels: HotelOption[] = referenceQuery.data?.hotels ?? NO_HOTELS;
    const meetingPoints: MeetingPointOption[] = referenceQuery.data?.meetingPoints ?? NO_MEETING_POINTS;
    const pickupZones: PickupZoneOption[] = referenceQuery.data?.pickupZones ?? NO_ZONES;

    // Selection State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSessionId, setSelectedSessionId] = useState<SessionType>('morning_class');
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

    // ✅ AppHeader handles metadata loading automatically

    // --- SESSION DATA FETCHING ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // A. Fetch Next 10 Sessions
            const today = new Date().toISOString().split('T')[0];
            const { data: upcomingData } = await supabase
                .from('bookings')
                .select('booking_date, session_id, pickup_driver_uid, pickup_zone, meeting_point')
                .gte('booking_date', today)
                .neq('status', 'cancelled')
                .order('booking_date', { ascending: true });

            if (upcomingData) {
                const summaries: Record<string, SessionSummary> = {};
                upcomingData.forEach(b => {
                    const key = `${b.booking_date}_${b.session_id}`;
                    if (!summaries[key]) {
                        summaries[key] = { date: b.booking_date || '', session_id: b.session_id || '', unassigned_count: 0 };
                    }
                    // Un walk-in non ha autista PER COSTRUZIONE: contarlo fra i "da
                    // assegnare" gonfia il numero. Stesso criterio della colonna, tipo
                    // del punto compreso, altrimenti il numero e la colonna divergono.
                    const mpType = b.meeting_point
                        ? meetingPoints.find(mp => mp.id === b.meeting_point)?.point_type ?? null
                        : null;
                    if (!b.pickup_driver_uid && zoneNeedsDriver(b.meeting_point, mpType, b.pickup_zone)) {
                        summaries[key].unassigned_count++;
                    }
                });
                setUpcomingSessions(Object.values(summaries).slice(0, 10));
            }

            // B. Fetch Drivers
            const { data: driverData } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .eq('role', 'driver')
                .order('full_name');
            setDrivers(driverData?.map(d => ({ ...d, full_name: d.full_name || '', avatar_url: d.avatar_url || undefined })) || []);

            // C. Fetch Selected Session Items (all transport-related fields)
            const { data: bookingData } = await supabase
                .from('bookings')
                .select(`
                    internal_id, pax_count, hotel_name, pickup_zone, pickup_time, route_order,
                    customer_note, agency_note, pickup_driver_uid, phone_number, session_id,
                    booking_date, transport_status, guest_name, guest_email,
                    requires_dropoff, dropoff_hotel, dropoff_zone, dropoff_driver_uid,
                    dropoff_mode, dropoff_meeting_point,
                    dropoff_sequence, pickup_sequence, meeting_point, has_luggage,
                    profiles:user_id(full_name, avatar_url)
                `)
                .eq('booking_date', selectedDate)
                .eq('session_id', selectedSessionId)
                .neq('status', 'cancelled')
                .order('route_order', { ascending: true });

            if (bookingData) {
                // Join non inferibile (vedi LogisticBookingRow): cast unico alla sorgente
                setItems((bookingData as unknown as LogisticBookingRow[]).map((b) => {
                    // Nome del punto dall'ID, solo per mostrarlo: l'item tiene l'ID.
                    // Fino al 2026-09-07 l'item portava il NOME e il salvataggio lo
                    // riscriveva nella colonna (4 prenotazioni con "Thai Akha Kitchen
                    // (School)" al posto di mp_school): con la FK sarebbe un errore.
                    const meetingPoint = b.meeting_point
                        ? meetingPoints.find(mp => mp.id === b.meeting_point) ?? null
                        : null;
                    const meetingPointName = b.meeting_point
                        ? meetingPoint?.name || b.meeting_point
                        : null;

                    // Resolve pickup zone color
                    const zoneColor = b.pickup_zone
                        ? pickupZones.find(z => z.id === b.pickup_zone)?.color_code || null
                        : null;

                    return {
                        id: b.internal_id,
                        guest_name: b.guest_name || b.profiles?.full_name || 'Guest',
                        pax: b.pax_count,
                        hotel_name: b.hotel_name || '',
                        pickup_time: b.pickup_time || '',
                        pickup_zone: b.pickup_zone || ZONE_UNSET,
                        route_order: b.route_order || 0,
                        avatar_url: b.profiles?.avatar_url,
                        pickup_driver_uid: b.pickup_driver_uid,
                        // Non e' `!hotel_name && !meeting_point`: il front scrive un
                        // SEGNAPOSTO nel campo hotel, quindi le prenotazioni davvero
                        // incomplete avevano quel campo pieno e risultavano complete.
                        // Misurato il 09/09: le due righe dichiarate incomplete non erano
                        // le due incomplete. Il criterio, e il perche', stanno in
                        // shared/lib/pickupCategory.ts con i test.
                        has_missing_info: pickupPlaceUnset(b.hotel_name, b.meeting_point),
                        customer_note: b.customer_note,
                        agency_note: b.agency_note,
                        phone_number: b.phone_number,
                        session_id: b.session_id,
                        booking_date: b.booking_date,
                        transport_status: b.transport_status,
                        requires_dropoff: b.requires_dropoff ?? true,
                        dropoff_mode: b.dropoff_mode,
                        dropoff_meeting_point: b.dropoff_meeting_point,
                        dropoff_hotel: b.dropoff_hotel,
                        dropoff_zone: b.dropoff_zone,
                        dropoff_driver_uid: b.dropoff_driver_uid,
                        dropoff_sequence: b.dropoff_sequence ?? 99,
                        pickup_sequence: b.pickup_sequence ?? 99,
                        meeting_point: b.meeting_point ?? null,
                        meeting_point_name: meetingPointName,
                        meeting_point_type: meetingPoint?.point_type ?? null,
                        pickup_zone_color: zoneColor,
                        has_luggage: b.has_luggage ?? false,
                    };
                }));
            }
        } finally {
            setLoading(false);
        }
    }, [selectedDate, selectedSessionId, meetingPoints, pickupZones]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- ACTIONS ---
    const handleAssign = useCallback(async (bookingId: string, driverId: string | null) => {
        const { error } = await supabase
            .from('bookings')
            .update({ pickup_driver_uid: driverId, route_order: 99 })
            .eq('internal_id', bookingId);

        // Prima il ramo d'errore non esisteva: se il DB rifiutava, la pagina restava
        // identica e chi assegnava non aveva modo di sapere che non era successo niente.
        setActionError(error ? error.message : null);
        if (!error) fetchData();
    }, [fetchData]);

    // L'evento serve SOLO per preventDefault, quindi e' opzionale: chi salva da un
    // bottone (non da un submit) chiama senza argomenti. Prima ManagerLogistic
    // fabbricava un `new Event('submit') as unknown as React.FormEvent` per farlo.
    const handleUpdateBooking = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!selectedBookingId) return;
        setIsSaving(true);

        const item = items.find(i => i.id === selectedBookingId);
        if (!item) { setIsSaving(false); return; }

        const { error } = await supabase
            .from('bookings')
            .update({
                hotel_name: item.hotel_name || null,
                pickup_time: item.pickup_time || null,
                // pickup_zone ha una FK verso pickup_zones(id) (migration 20260907170000,
                // prima era un CHECK con la lista delle zone copiata a mano). ZONE_UNSET e'
                // un sentinello della UI, non una zona: torna indietro come NULL, altrimenti
                // il rifiuto arriva come 23503 (violazione di chiave esterna).
                pickup_zone: item.pickup_zone && item.pickup_zone !== ZONE_UNSET ? item.pickup_zone : null,
                customer_note: item.customer_note || null,
                agency_note: item.agency_note || null,
                phone_number: item.phone_number || null,
                // '' e' il sentinello UI "punto d'incontro, non ancora scelto": al DB va null.
                meeting_point: item.meeting_point || null,
                // I DUE AUTISTI erano fuori dal payload. Effetto: l'ispettore faceva
                // scegliere l'autista di riconsegna, il salvataggio riusciva, e la
                // rilettura riportava il valore di prima. Una tendina che non fa niente,
                // senza dirlo. (Quello di ritiro ha anche la sua scrittura immediata in
                // handleAssign: le due vie scrivono lo stesso valore, non si pestano.)
                pickup_driver_uid: item.pickup_driver_uid,
                dropoff_driver_uid: item.dropoff_driver_uid,
                requires_dropoff: item.requires_dropoff,
                // Il NOME si salva insieme ai vecchi campi, e non e' ridondanza: finche'
                // i vecchi lettori sono vivi (il telefono dell'autista, i report) devono
                // trovare la loro verita'. Ma scrivere il nome e' OBBLIGATORIO, non
                // facoltativo: `dropoffPosition` gli da' la precedenza, quindi un nome
                // rimasto indietro VINCE sul dato fresco. Leggere questa colonna senza
                // scriverla e' peggio che non leggerla.
                dropoff_mode: item.dropoff_mode,
                // Il vincolo `bookings_dropoff_point_coerente_chk` lega questa colonna a
                // mode 'point': i due valori partono sempre insieme, mai uno solo.
                dropoff_meeting_point: item.dropoff_meeting_point,
                dropoff_hotel: item.dropoff_hotel || null,
                // dropoff_zone: stessa guardia (anche qui il vincolo e' una FK)
                dropoff_zone: item.dropoff_zone || null,
            })
            .eq('internal_id', selectedBookingId);

        setActionError(error ? error.message : null);
        if (!error) {
            fetchData();
        }
        setIsSaving(false);
    }, [selectedBookingId, items, fetchData]);

    const updateLocalItem = useCallback((id: string, updates: Partial<LogisticsItem>) => {
        setItems(prev => prev.map(i => {
            if (i.id !== id) return i;
            const next = { ...i, ...updates };
            // Il colore del riquadro zona veniva risolto solo alla lettura dal database:
            // cambiando zona dall'ispettore (scegliendo un hotel) la scheda nella colonna
            // restava del colore della zona VECCHIA fino al salvataggio, mentre il badge
            // dell'ispettore mostrava gia' la nuova. Due colori per la stessa riga.
            if (updates.pickup_zone !== undefined) {
                next.pickup_zone_color = pickupZones.find(z => z.id === next.pickup_zone)?.color_code ?? null;
            }
            return next;
        }));
    }, [pickupZones]);

    const clearActionError = useCallback(() => setActionError(null), []);
    /** Per chi scrive fuori da questo hook (il salvataggio dell'ordine sta nella pagina). */
    const reportActionError = useCallback((message: string | null) => setActionError(message), []);

    const closeInspector = useCallback(() => {
        setSelectedBookingId(null);
    }, []);

    // --- COMPUTED ---
    // I walk-in sono fuori: non hanno autista per costruzione, non sono "da assegnare".
    const unassignedItems = useMemo(
        () => items.filter(i => !i.pickup_driver_uid && needsDriver(i)),
        [items]
    );
    const selectedBooking = useMemo(() => items.find(i => i.id === selectedBookingId) || null, [items, selectedBookingId]);

    return {
        // Data
        items,
        drivers,
        upcomingSessions,
        unassignedItems,
        actionError,
        clearActionError,
        reportActionError,
        selectedBooking,
        hotels,
        meetingPoints,
        pickupZones,

        // State
        loading,
        isSaving,
        selectedDate,
        selectedSessionId,
        selectedBookingId,

        // Setters
        setSelectedDate,
        setSelectedSessionId,
        setSelectedBookingId,

        // Actions
        fetchData,
        handleAssign,
        handleUpdateBooking,
        updateLocalItem,
        closeInspector,
    };
}
