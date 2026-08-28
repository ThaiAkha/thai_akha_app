/**
 * Agency Reservations - anteprima della prenotazione selezionata.
 * Estratto da AgencyReservations.tsx (#16 split monstre), DOM invariato.
 */
import { FileText } from 'lucide-react';
import { Heading, Paragraph, Caption, SectionTitle } from '../../../components/typography';
import { getLocale, getDisplayId } from './types';
import type { AgencyReservationsState } from './useAgencyReservations';

export function ReservationPreviewPane({ s }: { s: AgencyReservationsState }) {
    const { user, t, i18n, activeBooking } = s;
    // 2. CENTER PANE (Preview) - Grid Col 6
    return (
        <div className="lg:col-span-6 flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center h-[73px]">
                <Heading level="h4" className="text-lg font-black uppercase flex items-center gap-2 leading-7">
                    <FileText className="w-5 h-5" />
                    {t('agency.invoiceTitle')}
                </Heading>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-100/50 dark:bg-black/20 flex justify-center">
                {activeBooking ? (
                    <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-8 md:p-10 space-y-8">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="w-16 h-16 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-600/20">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <div className="text-right">
                                    <Heading level="h2" className="font-black tracking-tighter uppercase leading-9">{t('agency.invoiceLabel')}</Heading>
                                    <Paragraph size="sm" color="secondary" className="font-mono mt-1 tracking-widest leading-5">REF: #{getDisplayId(activeBooking)}</Paragraph>
                                </div>
                            </div>

                            {/* Addresses */}
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <SectionTitle as="h3" className="text-sub mb-2">{t('agency.billedTo')}</SectionTitle>
                                    <Paragraph className="font-bold text-title leading-6">{user?.agency_company_name || user?.full_name}</Paragraph>
                                    <Paragraph size="sm" color="secondary" className="mt-1 leading-5">
                                        {user?.agency_address || t('agency.partnerAddress')}<br />
                                        {user?.agency_city}
                                    </Paragraph>
                                </div>
                                <div>
                                    <SectionTitle as="h3" className="text-sub mb-2">{t('agency.guestInfo')}</SectionTitle>
                                    <Paragraph className="font-bold text-title leading-6">{activeBooking.guest_name}</Paragraph>
                                    <Paragraph size="sm" color="secondary" className="mt-1">
                                        {activeBooking.session_type}<br />
                                        {activeBooking.pax} {t('agency.participants')}
                                    </Paragraph>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="border-t border-b border-gray-100 dark:border-gray-700 py-6">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-sub text-xs font-black uppercase tracking-widest text-left">
                                            <th className="pb-4">{t('agency.colDescription')}</th>
                                            <th className="pb-4 text-center">{t('agency.colDate')}</th>
                                            <th className="pb-4 text-right">{t('agency.colAmount')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-body">
                                        <tr>
                                            <td className="py-2 font-bold">{activeBooking.session_type} for {activeBooking.pax} pax</td>
                                            <td className="py-2 text-center text-xs">{new Date(activeBooking.booking_date).toLocaleDateString(getLocale(i18n.language))}</td>
                                            <td className="py-2 text-right font-mono font-bold">{activeBooking.total_price.toLocaleString()} THB</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end pt-4">
                                <div className="w-full max-w-xs space-y-3">
                                    <div className="flex justify-between text-sm text-sub">
                                        <span className="font-medium">{t('agency.grossSubtotal')}</span>
                                        <span className="font-mono">{activeBooking.total_price.toLocaleString()} THB</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-success">
                                        <span className="font-medium">{t('agency.fieldCommission')}{user?.commission_config?.tiers?.[0] ? ` · ${user.commission_config.tiers[0].tier} ${user.commission_config.tiers[0].rate} ${user.commission_config.currency ?? 'THB'}/pax` : ''}</span>
                                        <span className="font-mono">-{activeBooking.commission.toLocaleString()} THB</span>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-baseline">
                                        <span className="font-black uppercase text-xs text-title tracking-widest">{t('agency.netPayable')}</span>
                                        <span className="text-3xl font-black text-primary-600 dark:text-primary-400 font-mono tracking-tighter">
                                            {(activeBooking.total_price - activeBooking.commission).toLocaleString()}
                                            <span className="text-xs text-sub ml-2 font-black">THB</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-sub">
                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                        <Caption className="font-bold uppercase tracking-widest leading-4">{t('agency.selectBooking')}</Caption>
                    </div>
                )}
            </div>
        </div>
    );
}
