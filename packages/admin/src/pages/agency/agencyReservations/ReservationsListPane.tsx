/**
 * Agency Reservations - lista prenotazioni (header, ricerca/filtro stato, elenco).
 * Estratto da AgencyReservations.tsx (#16 split monstre), DOM invariato.
 */
import { cn } from '@thaiakha/shared/lib/utils';
import Badge from '../../../components/ui/badge/Badge';
import { Paragraph, Caption, SectionTitle } from '../../../components/typography';
import { Search, Calendar } from 'lucide-react';
import { getLocale, getDisplayId } from './types';
import type { AgencyReservationsState } from './useAgencyReservations';

export function ReservationsListPane({ s }: { s: AgencyReservationsState }) {
    const { t, i18n, loading, selectedBookingId, setSelectedBookingId, searchQuery, setSearchQuery, statusFilter, setStatusFilter, filteredList } = s;
    // 1. LEFT PANE (List) - Grid Col 3
    return (
        <div className="lg:col-span-3 flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <SectionTitle as="h6" className="font-bold text-sub mb-0">{t('agency.pageTitle')}</SectionTitle>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('agency.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-surface border-none rounded-lg text-sm focus:ring-1 focus:ring-primary-500 shadow-sm"
                    />
                </div>
            </div>

            {/* Filters  */}
            <div className="p-2 border-b border-gray-100 dark:border-gray-800 flex gap-2 overflow-x-auto no-scrollbar">
                {['all', 'confirmed', 'pending', 'cancelled'].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors",
                            statusFilter === s
                                ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
                                : "text-sub hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loading ? (
                    <div className="p-8 text-center text-sub">
                        <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <Caption className="leading-4">{t('agency.loading')}</Caption>
                    </div>
                ) : (
                    <>
                        {filteredList.map(b => (
                            <div
                                key={b.internal_id}
                                onClick={() => setSelectedBookingId(b.internal_id)}
                                className={cn(
                                    "p-3 rounded-xl cursor-pointer transition-all border",
                                    selectedBookingId === b.internal_id
                                        ? "bg-primary-50 border-primary-200 shadow-sm dark:bg-primary-500/10 dark:border-primary-500/20"
                                        : "bg-white border-transparent hover:bg-gray-50 dark:bg-transparent dark:hover:bg-gray-800"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-title truncate">{b.guest_name}</span>
                                    <Badge color={b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'error'}>
                                        {b.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-sub">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(b.booking_date).toLocaleDateString(getLocale(i18n.language))}</span>
                                    <span>•</span>
                                    <span className="font-mono">{getDisplayId(b)}</span>
                                </div>
                            </div>
                        ))}
                        {filteredList.length === 0 && (
                            <div className="p-8 text-center text-sub">
                                <Paragraph size="sm" color="secondary" className="leading-5">{t('agency.noBookings')}</Paragraph>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
