import { useCallback, useMemo } from 'react';
import { LogisticsItem, DriverProfile, needsDriver } from './useManagerLogistic';

interface UseLogisticFilteringProps {
    items: LogisticsItem[];
    drivers: DriverProfile[];
    selectedDriverIds: Set<string>;
    logisticsMode: 'pickup' | 'dropoff';
}

export function useLogisticFiltering({
    items,
    drivers,
    selectedDriverIds,
    logisticsMode
}: UseLogisticFilteringProps) {
    // Visible drivers based on selection
    const visibleDrivers = useMemo(() => {
        return drivers.filter(d => selectedDriverIds.has(d.id));
    }, [drivers, selectedDriverIds]);

    // Get driver items based on logistics mode
    const getDriverItems = useCallback((driverId: string): LogisticsItem[] => {
        if (logisticsMode === 'pickup') {
            return items
                .filter(i => i.pickup_driver_uid === driverId && needsDriver(i))
                .sort((a, b) => a.route_order - b.route_order);
        } else {
            // Drop-off: use dropoff_driver_uid, fallback to pickup_driver_uid
            return items
                .filter(i => {
                    const driverUid = i.dropoff_driver_uid || i.pickup_driver_uid;
                    // NIENTE needsDriver qui: quello dice se serve un autista di
                    // RITIRO. Chi arriva da se' viene comunque riportato indietro, quindi
                    // in riconsegna il criterio e' `requires_dropoff` e basta. Col filtro
                    // sbagliato un walk-in non stava in nessuna colonna autista, non stava
                    // fra le "da assegnare", e nella sua colonna non ha comandi: non era
                    // assegnabile da nessuna parte.
                    return driverUid === driverId && i.requires_dropoff;
                })
                .sort((a, b) => a.dropoff_sequence - b.dropoff_sequence);
        }
    }, [items, logisticsMode]);

    // Chi arriva da se': categoria 3, punto d'incontro di tipo 'walk_in'. NON e'
    // "senza autista", e' senza RITIRO. Il commento precedente diceva "not assigned to
    // any driver" ed e' probabilmente l'origine dell'equivoco che ha tenuto nascosto il
    // gruppo qui sotto. E il filtro precedente guardava la ZONA, che e' sbagliato:
    // vedi needsDriver, tre categorie e non due.
    const getWalkInItems = useCallback((): LogisticsItem[] => {
        // "Walk-in" e' una categoria del RITIRO: in riconsegna non significa niente, e
        // mostrarne l'elenco la' direbbe che quelle persone non hanno bisogno di nessuno.
        if (logisticsMode !== 'pickup') return [];
        return items.filter(i => !needsDriver(i));
    }, [items, logisticsMode]);

    /**
     * DA ASSEGNARE: ha bisogno di un autista e non ce l'ha.
     *
     * Fino al 2026-09-09 questo gruppo non esisteva: c'erano i walk-in e c'erano le
     * colonne degli autisti, e una prenotazione con una zona ma senza autista non
     * soddisfaceva ne' l'uno ne' l'altro filtro. Cioe' proprio lo stato in cui NASCE
     * ogni prenotazione era invisibile, nella pagina che serve ad assegnare gli autisti
     * (7 righe vere su 52 il giorno in cui e' stato trovato, usando la pagina).
     *
     * Vale in entrambe le modalita', e non e' un dettaglio: in riconsegna "assegnato"
     * significa avere `dropoff_driver_uid` OPPURE `pickup_driver_uid` (vedi
     * getDriverItems), quindi "da assegnare" e' non averne nessuno dei due. Sistemare
     * solo il ritiro lascerebbe mezza pagina cieca.
     *
     * Include chi non ha nessuna zona (ZONE_UNSET) e chi si presenta a un punto di
     * citta' dove l'autista passa a prendere (categoria 2): entrambi vanno assegnati, ed
     * entrambi prima restavano invisibili - il secondo perche' la UI lo marcava walk-in.
     */
    const getUnassignedItems = useCallback((): LogisticsItem[] => {
        const rows = items.filter(i => logisticsMode === 'pickup'
            // Ritiro: serve un autista di ritiro (tre categorie) e non c'e'.
            ? needsDriver(i) && !i.pickup_driver_uid
            // Riconsegna: serve una riconsegna e non c'e' nessuno dei due autisti.
            // I walk-in sono INCLUSI, a differenza del ritiro: tornano a casa anche loro.
            : i.requires_dropoff && !i.dropoff_driver_uid && !i.pickup_driver_uid);
        // Nessun ordine di percorso da rispettare (non ne hanno ancora uno): l'ordine
        // utile a chi smista e' l'orario, poi il nome per non ballare fra un giro e l'altro.
        return [...rows].sort((a, b) =>
            (a.pickup_time || '').localeCompare(b.pickup_time || '') ||
            a.guest_name.localeCompare(b.guest_name)
        );
    }, [items, logisticsMode]);

    return {
        visibleDrivers,
        getDriverItems,
        getWalkInItems,
        getUnassignedItems
    };
}
