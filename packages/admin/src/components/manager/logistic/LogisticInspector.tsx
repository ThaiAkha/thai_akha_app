import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LeaderHeader from '../../common/LeaderHeader';
import SelectField from '../../form/input/SelectField';
import InputField from '../../form/input/InputField';
import { InspectorShell, InspectorLeader, InspectorBody, InspectorFooter } from '../../ui/inspector';
import { InspectorPrimaryButton } from '../../ui/inspector/InspectorActionButtons';
import SearchableHotelSelect from './logisticInspector/SearchableHotelSelect';
import ZoneTimeBadge from './logisticInspector/ZoneTimeBadge';
import {
    MapPin, Search,
    Save, Truck, User
} from 'lucide-react';
import {
    LogisticsItem,
    DriverProfile,
    HotelOption,
    MeetingPointOption,
    PickupZoneOption,
    WALK_IN_ZONE,
    ZONE_UNSET,
    needsDriver,
} from '../../../hooks/useManagerLogistic';
import {
    pickupPosition, type PickupPosition,
    dropoffPosition, type DropoffPosition,
} from '@thaiakha/shared/lib/pickupCategory';
import { Caption, SectionTitle } from '../../typography';

// ---------- Main Inspector ----------
interface LogisticInspectorProps {
    selectedBooking: LogisticsItem | null;
    drivers: DriverProfile[];
    hotels: HotelOption[];
    meetingPoints: MeetingPointOption[];
    pickupZones: PickupZoneOption[];
    onAssign: (bookingId: string, driverId: string | null) => void;
    onUpdateLocal: (id: string, updates: Partial<LogisticsItem>) => void;
    onSubmit: (e: React.FormEvent) => void;
    /** Salvataggio in corso: disabilita e mostra lo spinner sul Save del footer. */
    isSaving?: boolean;
}

const LogisticInspector: React.FC<LogisticInspectorProps> = ({
    selectedBooking,
    drivers,
    hotels,
    meetingPoints,
    pickupZones,
    onAssign,
    onUpdateLocal,
    onSubmit,
    isSaving = false,
}) => {
    const { t } = useTranslation('logistics');

    /**
     * Posizione scelta col click, quando c'e'. I dati dicono da dove si PARTE; il click
     * dice dove sei andato.
     *
     * Serve perche' la derivazione pura non regge per la posizione HOTEL, e il buco era
     * uno stallo: premendo Hotel si scriveva `meeting_point: null` e non si toccava
     * `hotel_name`, che le altre due posizioni avevano appena svuotato. Quindi
     * `pickupPosition` tornava NULL ("da decidere"), il campo di ricerca hotel non si
     * montava — e' condizionato a `position === 'hotel'` — e senza quel campo non si
     * poteva scegliere un hotel, quindi la posizione non diventava mai 'hotel'.
     * Dopo aver usato lo switch UNA volta, Hotel restava inutilizzabile per quella
     * prenotazione: funzionava solo dove un hotel c'era gia', cioe' dove non serviva.
     *
     * Le altre due posizioni hanno un sentinello nei dati (`meeting_point: ''` piu' il
     * tipo); Hotel non ne ha, e dargliene uno vorrebbe dire mettere una seconda stringa
     * magica in `hotel_name` — proprio il campo che soffre gia' di 'Update in profile'.
     * Meglio uno stato locale, azzerato quando cambia la prenotazione selezionata.
     */
    const [chosenPosition, setChosenPosition] = useState<PickupPosition | undefined>(undefined);
    const selectedId = selectedBooking?.id ?? null;
    useEffect(() => { setChosenPosition(undefined); }, [selectedId]);

    if (!selectedBooking) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-sub">
                <Search className="w-12 h-12 mb-4 opacity-50" />
                <SectionTitle as="h5" className="text-title">{t('inspector.emptyTitle')}</SectionTitle>
                <Caption className="mt-2">{t('inspector.emptyHint')}</Caption>
            </div>
        );
    }

    // Posizione del comando a tre: hotel / punto d'incontro / walk-in, oppure NULL =
    // nessuna scelta fatta. La regola, il perche' non si deriva dalla verita' di
    // `meeting_point` e il caso delle prenotazioni nate dal sito stanno in
    // shared/lib/pickupCategory.ts con i test.
    const position = chosenPosition ?? pickupPosition(
        selectedBooking.meeting_point,
        selectedBooking.meeting_point_type,
        selectedBooking.hotel_name
    );

    /** Ogni posizione riparte da zero sull'orario: ognuna lo prende dalla propria fonte. */
    const goToPosition = (next: Exclude<PickupPosition, null>) => {
        setChosenPosition(next);
        const common = { meeting_point_name: null, pickup_time: '' };
        if (next === 'hotel') {
            onUpdateLocal(selectedBooking.id, {
                ...common,
                meeting_point: null,
                meeting_point_type: null,
                // La zona walk-in va tolta: e' la categoria che stiamo lasciando.
                // Le righe nate col vecchio difetto ce l'hanno ancora, e un punto
                // walk-in la mette per davvero. Sara' l'hotel scelto a rimetterne una.
                ...(selectedBooking.pickup_zone === WALK_IN_ZONE ? { pickup_zone: ZONE_UNSET } : {}),
            });
            return;
        }
        // '' = modalita' scelta, punto non ancora selezionato: al salvataggio diventa
        // NULL, mai '' nel database. Il TIPO porta l'intenzione dell'operatore, ed e'
        // quello che tiene accesa la posizione giusta mentre sceglie (vedi pickupPosition).
        if (next === 'meeting_point') {
            onUpdateLocal(selectedBooking.id, {
                ...common,
                meeting_point: '',
                meeting_point_type: 'pickup',
                hotel_name: '',
                // Un punto non prende dati dalle zone: la zona del luogo precedente
                // non vale piu' (regola dell'owner del 2026-09-09).
                pickup_zone: ZONE_UNSET,
            });
            return;
        }
        onUpdateLocal(selectedBooking.id, {
            ...common,
            meeting_point: '',
            meeting_point_type: 'walk_in',
            hotel_name: '',
            pickup_zone: WALK_IN_ZONE,
            // REGOLA DELL'OWNER: il walk-off e' lo stato standard del ritorno per un
            // walk-in. Corregge un difetto di nascita: `requires_dropoff` ha DEFAULT true
            // nel database, quindi ogni prenotazione nasce chiedendo il ritorno, walk-in
            // compresi, e il comando per dire il contrario non esisteva.
            // MA solo se nessuno ha ancora deciso il ritorno: una riconsegna configurata
            // apposta (destinazione o autista) non si disfa da sola. Se la macchina
            // cancellasse una scelta dell'operatore sarebbe lo stesso guasto del comando
            // che cambiava posizione da solo.
            ...(dropoffUntouched
                ? { requires_dropoff: false, dropoff_hotel: null, dropoff_zone: null, dropoff_driver_uid: null }
                : {}),
            // Chi arriva da se' non ha autista di RITIRO. La RICONSEGNA non si tocca:
            // viene comunque riportato indietro.
            pickup_driver_uid: null,
        });
    };

    // REGOLA DELL'OWNER (2026-09-09): nel walk-in la riconsegna non puo' essere "stesso
    // posto del ritiro" ne' "stesso autista del ritiro". "Stesso posto" per chi arriva da
    // se' vorrebbe dire riportarlo alla cucina o al tempio da cui esce; e non c'e' nessun
    // autista del ritiro da ereditare. Quindi in walk-in il luogo di riconsegna si chiede
    // sempre, e l'autista del ritorno va detto.
    const isWalkIn = position === 'walk_in';
    /** Posizione del ritorno. Mai dalla verita' di `dropoff_hotel`: vedi dropoffPosition. */
    const dropoffPos = dropoffPosition(
        selectedBooking.requires_dropoff,
        selectedBooking.dropoff_hotel,
        // "riportalo dove l'abbiamo preso" non esiste per chi non e' stato preso
        !isWalkIn,
        // per riconoscere le copie: vedi dropoffPosition
        selectedBooking.hotel_name
    );
    /** Un walk-in che chiede il rientro senza destinazione non e' consegnabile. */
    const dropoffMissing = isWalkIn
        && dropoffPos === 'elsewhere'
        && !(selectedBooking.dropoff_hotel ?? '').trim();
    /** Nessuno ha ancora deciso il ritorno: niente destinazione e niente autista. */
    const dropoffUntouched = !(selectedBooking.dropoff_hotel ?? '').trim()
        && !selectedBooking.dropoff_driver_uid;

    const goToDropoff = (next: DropoffPosition) => {
        if (next === 'walk_off') {
            // Se ne va da se': via destinazione e via autista, altrimenti resterebbe un
            // autista assegnato a un ritorno che non esiste piu'.
            onUpdateLocal(selectedBooking.id, {
                requires_dropoff: false,
                dropoff_hotel: null,
                dropoff_zone: null,
                dropoff_driver_uid: null,
            });
            return;
        }
        if (next === 'same') {
            onUpdateLocal(selectedBooking.id, {
                requires_dropoff: true,
                dropoff_hotel: null,
                dropoff_zone: null,
                dropoff_driver_uid: null,
            });
            return;
        }
        // '' = destinazione scelta e non ancora compilata. Si parte VUOTO, non dal luogo
        // di ritiro: precompilando, premere questo pulsante voleva dire confermare una
        // COPIA del ritiro invece di scegliere una destinazione, ed e' cosi' che sono nate
        // le 40 righe con la destinazione identica al ritiro. Chi lo preme scegle.
        onUpdateLocal(selectedBooking.id, {
            requires_dropoff: true,
            dropoff_hotel: '',
        });
    };

    /** Orario del punto per la sessione di questa prenotazione, se ce l'ha. */
    const pointTime = (mp: MeetingPointOption) =>
        (selectedBooking.session_id === 'morning_class' ? mp.morning_pickup_time : mp.evening_pickup_time) ?? null;

    const currentZone = pickupZones.find(z => z.id === selectedBooking.pickup_zone);
    const zoneDefaultTime = selectedBooking.session_id === 'morning_class'
        ? currentZone?.morning_pickup_time
        : currentZone?.evening_pickup_time;

    const handleHotelChange = (hotelName: string, zoneId: string | null) => {
        const updates: Partial<LogisticsItem> = { hotel_name: hotelName };
        if (zoneId) {
            updates.pickup_zone = zoneId;
            // Auto-fill time from zone
            const zone = pickupZones.find(z => z.id === zoneId);
            if (zone) {
                const zoneTime = selectedBooking.session_id === 'morning_class'
                    ? zone.morning_pickup_time
                    : zone.evening_pickup_time;
                if (zoneTime) updates.pickup_time = zoneTime;
            }
        }
        onUpdateLocal(selectedBooking.id, updates);
    };

    const handleDropoffHotelChange = (hotelName: string, zoneId: string | null) => {
        onUpdateLocal(selectedBooking.id, {
            dropoff_hotel: hotelName,
            ...(zoneId && { dropoff_zone: zoneId }),
        });
    };

    // Shell con overflow-visible: il corpo di DataExplorerInspector e' un blocco (non flex),
    // quindi la shell ha altezza automatica e lo scroll resta al corpo host, come prima.
    // L'overflow-hidden di default taglierebbe la tendina assoluta del select hotel di
    // drop-off (in fondo al form), che oggi allunga invece l'area di scroll del corpo host.
    return (
        <InspectorShell className="overflow-visible">
        <form onSubmit={onSubmit} className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
            {/* Header unificato (LeaderHeader) - coerente con kitchen/reservation */}
            <InspectorLeader tinted>
                <LeaderHeader
                    label={t('inspector.pickupGuest', { defaultValue: 'Pickup guest' })}
                    leader={{
                        name: selectedBooking.guest_name,
                        avatarUrl: selectedBooking.avatar_url,
                        phone: selectedBooking.phone_number,
                        pax: selectedBooking.pax,
                        luggage: selectedBooking.has_luggage,
                    }}
                    onWhatsApp={selectedBooking.phone_number ? (ph) => window.open(`https://wa.me/${ph.replace(/[^0-9]/g, '')}`, '_blank') : undefined}
                />
                {currentZone && (
                    <div className="pt-3">
                        <ZoneTimeBadge zone={currentZone} sessionId={selectedBooking.session_id} />
                    </div>
                )}
            </InspectorLeader>

            <InspectorBody>

                {/* ── Route Assignment ── */}
                <div className="p-6 space-y-4 border-b border-gray-100 dark:border-gray-800">
                    <SectionTitle as="h6" tone="sub" className="tracking-wide flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> {t('inspector.routeAssignment')}
                    </SectionTitle>
                    {!needsDriver(selectedBooking) ? (
                        /* Su un walk-in il selettore c'era e non produceva nessun effetto
                           visibile: il salvataggio andava a buon fine, ma l'appartenenza
                           alla colonna la decide la ZONA, non l'autista, quindi la scheda
                           non si spostava e nessuno spiegava perche'. Ora lo dice. Per dare
                           un autista serve prima un luogo di ritiro: e' anche l'ordine
                           giusto, perche' la zona del luogo porta con se' l'orario.
                           Se un autista c'e' GIA' (stato che esiste nei dati, nato proprio
                           da quel selettore muto) serve un modo per toglierlo, altrimenti
                           nascondendo il selettore lo si lascerebbe nel database senza
                           nessuna via d'uscita dalla UI. Un solo comando, non una tendina:
                           su uno stato anomalo l'unica operazione sensata e' annullarlo. */
                        <div className="space-y-2">
                            <Caption>{t('toAssign.walkInHasNoDriver')}</Caption>
                            {selectedBooking.pickup_driver_uid && (
                                <button
                                    type="button"
                                    onClick={() => onAssign(selectedBooking.id, null)}
                                    className="px-3 py-2 text-xs font-bold rounded-lg bg-gray-100 dark:bg-gray-700 text-title hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t('toAssign.removeDriver')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <SelectField
                            label={t('inspector.fieldPickupDriver')}
                            value={selectedBooking.pickup_driver_uid || ''}
                            onChange={(e) => onAssign(selectedBooking.id, e.target.value || null)}
                        >
                            <option value="">{t('inspector.unassigned')}</option>
                            {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                        </SelectField>
                    )}
                </div>

                {/* ── Pickup Details ── */}
                <div className="p-6 space-y-4 border-b border-gray-100 dark:border-gray-800">
                    <SectionTitle as="h6" tone="sub" className="tracking-wide flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> {t('inspector.pickupDetails')}
                    </SectionTitle>

                    {/* Comando a TRE posizioni (richiesta owner, 2026-09-09). Prima erano
                        due, e il secondo copriva due categorie diverse: la distinzione
                        avveniva implicitamente dopo, nella tendina, sul tipo del punto.
                        Ora la posizione la sceglie l'operatore e la tendina mostra SOLO i
                        punti di quella categoria: non si puo' piu' sbagliare categoria.
                        L'accensione viene da `position`, non dalla verita' di
                        `meeting_point`: quel campo vale '' mentre si sceglie, che e' falso,
                        e accendeva "Hotel" mentre il corpo mostrava i punti. */}
                    <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        {([
                            ['hotel', t('inspector.positionHotel')],
                            ['meeting_point', t('inspector.positionMeetingPoint')],
                            ['walk_in', t('inspector.positionWalkIn')],
                        ] as const).map(([key, label], i) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => goToPosition(key)}
                                className={`flex-1 py-2.5 px-1 text-xs font-bold uppercase tracking-wide transition-colors ${i > 0 ? 'border-l border-gray-200 dark:border-gray-700' : ''} ${position === key
                                    ? 'bg-primary-500 text-white'
                                    : 'text-sub hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Nessuna posizione: la prenotazione non ha ancora una scelta di
                        ritiro (nata dal sito col segnaposto). Si dice, invece di far
                        cadere il comando su walk-in e trasformare una supposizione in
                        una decisione al primo salvataggio. */}
                    {position === null && (
                        <Caption>{t('inspector.positionUndecided')}</Caption>
                    )}

                    {/* Hotel Search - only when Pickup at Hotel */}
                    {position === 'hotel' && (
                        <SearchableHotelSelect
                            label={t('inspector.fieldHotel')}
                            value={selectedBooking.hotel_name || ''}
                            hotels={hotels}
                            zones={pickupZones}
                            placeholder={t('inspector.searchHotel')}
                            onChange={handleHotelChange}
                        />
                    )}

                    {/* La tendina mostra SOLO i punti della posizione scelta: gli 8 di
                        citta' dove l'autista passa a prendere, oppure i 2 dove l'ospite
                        arriva da se'. I mercati del weekend, che sono di sola riconsegna,
                        non stanno in nessuno dei due. */}
                    {(position === 'meeting_point' || position === 'walk_in') && (
                        <SelectField
                            label={t('inspector.fieldMP')}
                            value={selectedBooking.meeting_point || ''}
                            onChange={(e) => {
                                const mpId = e.target.value;
                                const mp = meetingPoints.find(m => m.id === mpId);
                                const updates: Partial<LogisticsItem> = {
                                    meeting_point: mpId,
                                    meeting_point_name: mp?.name ?? null,
                                    // Svuotando la tendina non c'e' punto, ma la POSIZIONE
                                    // resta quella scelta dall'operatore: senza questo, un
                                    // tipo nullo farebbe saltare il comando da "walk-in" a
                                    // "punto d'incontro" da solo (la posizione si deriva
                                    // dal tipo, vedi pickupPosition).
                                    meeting_point_type: mp?.point_type ?? (position === 'walk_in' ? 'walk_in' : 'pickup'),
                                };
                                if (mp) {
                                    // Sempre assegnato, anche vuoto: Wat Pan Whaen non ha
                                    // orario serale, e prima in classe serale restava
                                    // l'orario di PRIMA — che poteva essere quello di un
                                    // aeroporto. Meglio nessun orario che uno falso.
                                    updates.pickup_time = pointTime(mp) ?? '';
                                    // La zona segue il TIPO. Un punto walk-in mette la zona
                                    // walk-in; un punto di citta' NON la mette, e se c'era
                                    // (scelta precedente, o il vecchio difetto) la toglie,
                                    // altrimenti la prenotazione resterebbe fuori dalle
                                    // colonne autista pur avendo bisogno dell'autista.
                                    if (mp.point_type === 'walk_in') {
                                        updates.pickup_zone = WALK_IN_ZONE;
                                        // Un walk-in non ha autista di RITIRO: se ce n'era
                                        // uno, se ne va con la categoria, altrimenti si
                                        // fabbrica proprio lo stato contraddittorio che
                                        // abbiamo appena finito di ripulire (autista su una
                                        // riga che nessuna colonna autista mostra).
                                        // La riconsegna NON si tocca: chi arriva da se'
                                        // viene comunque riportato indietro.
                                        updates.pickup_driver_uid = null;
                                    } else {
                                        // Un punto di citta' NON ha zona, e la zona del
                                        // luogo precedente non va tenuta: prima si puliva
                                        // solo se valeva 'walk-in', quindi passando da un
                                        // hotel in zona vera a un punto la zona sopravviveva.
                                        // Effetto: scheda colorata come l'hotel di prima,
                                        // badge con quella zona e il suo orario, e il
                                        // pulsante "Reset to zone" che offriva l'orario
                                        // dell'hotel a una fermata che e' all'aeroporto.
                                        updates.pickup_zone = ZONE_UNSET;
                                    }
                                }
                                onUpdateLocal(selectedBooking.id, updates);
                            }}
                        >
                            <option value="">{t('inspector.selectMP')}</option>
                            {meetingPoints
                                .filter(mp => {
                                    if (mp.point_type !== (position === 'walk_in' ? 'walk_in' : 'pickup')) return false;
                                    // Il punto GIA' scelto resta sempre in elenco, anche se
                                    // per questa sessione non ha orario: togliendolo, la
                                    // tendina non troverebbe il proprio valore, mostrerebbe
                                    // vuoto, e un click distratto lo sostituirebbe.
                                    if (mp.id === selectedBooking.meeting_point) return true;
                                    // Un punto senza orario per la sessione scelta non puo'
                                    // servirla: Wat Pan Whaen ha il mattino (08:50) e la
                                    // sera NULL, quindi in classe serale offrirlo voleva
                                    // dire farlo scegliere e poi non riuscire a riempire
                                    // l'orario. Il front questo caso lo scarta a monte
                                    // (useMeetingPoints): ora anche l'admin.
                                    return pointTime(mp) !== null;
                                })
                                .map(mp => {
                                    // L'orario mostrato e' quello della SESSIONE di questa
                                    // prenotazione: Wat Pan Whaen ha il mattino e non la
                                    // sera, e prima l'etichetta stampava " · " vuoto.
                                    const time = pointTime(mp);
                                    return (
                                        <option key={mp.id} value={mp.id}>
                                            {mp.name}{time ? ` · ${time.slice(0, 5)}` : ''}
                                        </option>
                                    );
                                })}
                        </SelectField>
                    )}

                    {/* Pickup Time */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-sub uppercase tracking-widest">{t('inspector.pickupTime')}</span>
                            {zoneDefaultTime && (
                                <button
                                    type="button"
                                    className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
                                    onClick={() => onUpdateLocal(selectedBooking.id, { pickup_time: zoneDefaultTime })}
                                >
                                    {t('inspector.resetToZone', { time: zoneDefaultTime.slice(0, 5) })}
                                </button>
                            )}
                        </div>
                        <InputField
                            type="time"
                            value={selectedBooking.pickup_time || ''}
                            onChange={e => onUpdateLocal(selectedBooking.id, { pickup_time: e.target.value })}
                        />
                    </div>
                </div>


                {/* ── Drop-off Management ── */}
                <div className="p-6 space-y-4">
                    <SectionTitle as="h6" tone="sub" className="tracking-wide flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5" /> {t('inspector.dropoff')}
                    </SectionTitle>

                    {/* Comando del RITORNO, tre posizioni. "Walk-off" era un comando
                        MANCANTE, non un doppione: nell'admin nessuno scriveva
                        `requires_dropoff`, quindi non c'era modo di dire che un ospite se
                        ne va da se'. Nei dati quello stato esiste (12 prenotazioni su 62)
                        e arrivava da fuori. E' la simmetria del ritiro: walk-in = arriva
                        da se', walk-off = se ne va da se'.
                        "Stesso posto" non si offre quando il ritiro e' walk-in: non c'e'
                        nessun posto in cui l'abbiamo preso. */}
                    <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        {(isWalkIn
                            ? ([['walk_off', t('inspector.dropoffWalkOff')], ['elsewhere', t('inspector.dropoffElsewhere')]] as const)
                            : ([['walk_off', t('inspector.dropoffWalkOff')], ['same', t('inspector.dropoffSame')], ['elsewhere', t('inspector.dropoffElsewhere')]] as const)
                        ).map(([key, label], i) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => goToDropoff(key)}
                                className={`flex-1 py-2.5 px-1 text-xs font-bold uppercase tracking-wide transition-colors ${i > 0 ? 'border-l border-gray-200 dark:border-gray-700' : ''} ${dropoffPos === key
                                    ? 'bg-primary-500 text-white'
                                    : 'text-sub hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {dropoffPos === 'elsewhere' && (
                        <>
                            {dropoffMissing && (
                                <Caption className="text-error">{t('inspector.dropoffRequired')}</Caption>
                            )}
                            {/* Drop-off Hotel */}
                            <SearchableHotelSelect
                                label={t('inspector.fieldDropoffHotel')}
                                value={selectedBooking.dropoff_hotel || ''}
                                hotels={hotels}
                                zones={pickupZones}
                                placeholder={t('inspector.searchHotel')}
                                onChange={handleDropoffHotelChange}
                            />

                            {/* Drop-off Driver */}
                            <SelectField
                                label={t('inspector.fieldDropoffDriver')}
                                value={selectedBooking.dropoff_driver_uid || ''}
                                onChange={(e) => onUpdateLocal(selectedBooking.id, { dropoff_driver_uid: e.target.value || null })}
                            >
                                {/* "Same as pickup" non si offre sui walk-in: non c'e'
                                    nessun autista del ritiro da ereditare, e la regola
                                    dell'owner lo esclude. Li' l'assenza e' "da assegnare". */}
                                <option value="">{isWalkIn ? t('inspector.unassigned') : t('inspector.sameAsPickup')}</option>
                                {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                            </SelectField>
                        </>
                    )}
                </div>
            </InspectorBody>
            {/* Il Save vive nel footer come azione primaria h-12 (standard planner), ed e'
                `type="submit"`: chiude il <form> radice, quindi Enter continua a salvare e
                non serve piu' alcun evento fabbricato dall'header. */}
            <InspectorFooter>
                {/* Bloccato SOLO su questa invariante: un walk-in che chiede il rientro
                    senza destinazione non e' consegnabile, e salvarlo non aiuta nessuno. */}
                <InspectorPrimaryButton type="submit" isLoading={isSaving} disabled={isSaving || dropoffMissing} startIcon={<Save className="w-4 h-4" />}>
                    {isSaving ? t('actions.saving') : t('actions.save')}
                </InspectorPrimaryButton>
            </InspectorFooter>

        </form>
        </InspectorShell>
    );
};

export default LogisticInspector;
