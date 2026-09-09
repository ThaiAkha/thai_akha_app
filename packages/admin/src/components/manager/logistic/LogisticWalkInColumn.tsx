import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, UserX } from 'lucide-react';
import { LogisticsItem, DriverProfile } from '../../../hooks/useManagerLogistic';
import LogisticWalkInItemList from './LogisticWalkInItemList';
import LogisticItemList from './LogisticItemList';
import Avatar from '../../ui/avatar/Avatar';

interface LogisticWalkInColumnProps {
    items: LogisticsItem[];
    /**
     * DA ASSEGNARE: hanno bisogno di un autista e non ce l'hanno (vedi
     * useLogisticFiltering.getUnassignedItems). Stanno qui, in coda ai walk-in, perche'
     * fino al 2026-09-09 non stavano in nessuna colonna: la pagina che serve ad
     * assegnare gli autisti non mostrava le prenotazioni da assegnare.
     */
    unassignedItems: LogisticsItem[];
    drivers: DriverProfile[];
    selectedBookingId: string | null;
    onSelectBooking: (id: string) => void;
    onMoveItem: (itemId: string, direction: 'up' | 'down' | 'to-driver', targetDriverId?: string) => void;
}

export const LogisticWalkInColumn: React.FC<LogisticWalkInColumnProps> = ({
    items,
    unassignedItems,
    drivers,
    selectedBookingId,
    onSelectBooking,
    onMoveItem
}) => {
    const { t } = useTranslation('logistics');

    return (
        <div className="w-[320px] flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-surface shadow-sm overflow-hidden">
            {/* Header walk-in */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                <div className="flex items-center gap-2">
                    <Avatar
                        size="xlarge"
                        fallback={<MapPin className="w-6 h-6 text-orange-100 dark:text-orange-400" />}
                        fallbackClassName="bg-orange-400 dark:bg-btn-p-900/30"
                    />
                    <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="font-bold text-title uppercase text-base tracking-wider truncate leading-tight">
                            {t('walkIn.title')}
                        </div>
                        <div className="text-sm text-sub font-mono">{items.length} {t('walkIn.booking', { count: items.length })}</div>
                    </div>
                </div>
            </div>

            {/* Walk-in: chi arriva da se'. `flex-auto` e non `flex-1`: con `flex-1` i due
                riquadri si dividono l'altezza a META' anche quando uno e' vuoto, e in una
                giornata con 0 walk-in e 3 da assegnare metà colonna restava bianca mentre
                la lista utile scrollava in 230px. `flex-auto` parte dal contenuto, quindi
                lo spazio va dove ci sono le schede. min-h-0 perche' due aree con scroll
                proprio nella stessa colonna flex non si restringono senza. */}
            <div className="flex-auto min-h-0 flex flex-col">
                <LogisticWalkInItemList
                    items={items}
                    selectedBookingId={selectedBookingId}
                    onSelectBooking={onSelectBooking}
                />
            </div>

            {/* Intestazione "da assegnare": e' un'intestazione vera, non appiccicata in
                cima allo scroll, quindi resta leggibile anche con la lista lunga. Porta
                il rosso di stato QUI e non sulle schede: il rosso semantico dell'admin
                (--color-sys-error) e' #EF4444, cioe' lo STESSO valore del colore della
                zona `outside` nel database, e le righe da assegnare stanno spesso proprio
                in quella zona. Un bordo rosso sulla scheda avrebbe voluto dire due cose
                diverse con lo stesso colore, sulla stessa scheda. */}
            <div className="p-3 border-y border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex items-center gap-2">
                <UserX className="w-5 h-5 shrink-0 text-error" />
                <div className="flex-1 min-w-0 font-bold text-error uppercase text-sm tracking-wider truncate leading-tight">
                    {t('toAssign.title')}
                </div>
                <div className="text-sm text-sub font-mono shrink-0">{unassignedItems.length}</div>
            </div>

            {/* Da assegnare: si riusa la lista delle colonne autista perche' porta la
                tendina "assegna", cioe' l'azione che serve. Le frecce d'ordine no: queste
                righe non hanno ancora un percorso da ordinare. */}
            <div className="flex-auto min-h-0 flex flex-col">
                <LogisticItemList
                    items={unassignedItems}
                    drivers={drivers}
                    selectedBookingId={selectedBookingId}
                    onSelectBooking={onSelectBooking}
                    onMoveItem={onMoveItem}
                    showAvatar={true}
                    showAssignDriver={true}
                    showMove={false}
                    showTime={true}
                />
            </div>
        </div>
    );
};
