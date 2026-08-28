/**
 * Agency Reservations - inspector: dettagli e form di modifica/salvataggio.
 * Estratto da AgencyReservations.tsx (#16 split monstre), DOM invariato.
 */
import { cn } from '@thaiakha/shared/lib/utils';
import Label from '../../../components/form/Label';
import Button from '../../../components/ui/button/Button';
import { Heading, Caption, SectionTitle } from '../../../components/typography';
import { MapPin, Clock, Phone, Printer, Save, Edit, MoreHorizontal } from 'lucide-react';
import { getDisplayId, type AgencyBooking } from './types';
import type { AgencyReservationsState } from './useAgencyReservations';

export function ReservationInspectorPane({ s }: { s: AgencyReservationsState }) {
    const { t, setSelectedBookingId, isEditing, setIsEditing, editForm, setEditForm, isSaving, activeBooking, handleSave } = s;
    // 3. RIGHT PANE (Inspector) - Grid Col 3
    return (
        <div className="lg:col-span-3 flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center h-[73px] bg-gray-50/50 dark:bg-gray-800/50">
                <div>
                    <Heading level="h4" className="text-lg text-body uppercase tracking-tighter leading-7">{t('agency.inspectorTitle')}</Heading>
                    <Caption className="font-mono uppercase tracking-widest leading-4">{activeBooking ? getDisplayId(activeBooking) : t('agency.inspectorIdle')}</Caption>
                </div>
                {activeBooking && (
                    <Button variant="outline" size="sm" onClick={() => setSelectedBookingId(null)} className="rounded-lg h-9 w-9 p-0 flex items-center justify-center">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {activeBooking ? (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" startIcon={<Printer className="w-4 h-4" />} onClick={() => window.print()} className="rounded-xl h-11 font-bold">
                                {t('agency.btnPrint')}
                            </Button>
                            <Button
                                variant={isEditing ? "primary" : "outline"}
                                startIcon={isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                disabled={isSaving}
                                className="rounded-xl h-11 font-bold"
                            >
                                {isEditing ? (isSaving ? t('agency.btnSaving') : t('agency.btnSave')) : t('agency.btnEdit')}
                            </Button>
                        </div>

                        {/* Guest Logistics */}
                        <div className="space-y-4">
                            <SectionTitle as="h3" className="text-sub mb-4">{t('agency.guestLogistics')}</SectionTitle>

                            <div>
                                <Label className="text-xs font-bold uppercase text-sub mb-1 ml-1">{t('agency.hotelPickup')}</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={isEditing ? (editForm.hotel_name || '') : activeBooking.hotel_name}
                                        onChange={e => setEditForm({ ...editForm, hotel_name: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-bold uppercase text-sub mb-1 ml-1">{t('agency.fieldTime')}</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            placeholder="00:00"
                                            value={isEditing ? (editForm.pickup_time || '') : activeBooking.pickup_time}
                                            onChange={e => setEditForm({ ...editForm, pickup_time: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed font-mono font-bold"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs font-bold uppercase text-sub mb-1 ml-1">{t('agency.fieldPax')}</Label>
                                    <input
                                        type="text"
                                        disabled={true}
                                        value={activeBooking.pax}
                                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-transparent rounded-xl text-sm text-center font-black"
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-gray-800" />

                        {/* Internal Details */}
                        <div className="space-y-4">
                            <SectionTitle as="h3" className="text-sub mb-4">{t('agency.internalDetails')}</SectionTitle>

                            <div>
                                <Label className="text-xs font-bold uppercase text-sub mb-1 ml-1">{t('agency.agencyNote')}</Label>
                                <textarea
                                    rows={4}
                                    disabled={!isEditing}
                                    value={isEditing ? (editForm.agency_note || '') : activeBooking.agency_note}
                                    onChange={e => setEditForm({ ...editForm, agency_note: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed font-medium resize-none"
                                />
                            </div>

                            <div className="bg-primary-50/30 dark:bg-primary-500/5 p-4 rounded-xl border border-primary-100/50 dark:border-primary-500/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <Phone className="w-3 h-3 text-primary-400" />
                                    <span className="text-xs font-black text-primary-400 uppercase tracking-widest">{t('agency.guestContact')}</span>
                                </div>
                                <div className="text-sm font-bold text-gray-900 dark:text-primary-400 pl-5">
                                    {activeBooking.phone_number || t('agency.noPhone')}
                                </div>
                            </div>
                        </div>

                        {/* Status Actions (Only when editing) */}
                        {isEditing && (
                            <div className="space-y-3 pt-4 animate-in fade-in">
                                <SectionTitle as="h3" className="text-sub">{t('agency.lifecycleStatus')}</SectionTitle>
                                <div className="flex gap-2">
                                    {['confirmed', 'pending', 'cancelled'].map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setEditForm({ ...editForm, status: s as AgencyBooking['status'] })}
                                            className={cn(
                                                "flex-1 py-3 rounded-xl text-xs font-black uppercase border transition-all tracking-widest",
                                                editForm.status === s
                                                    ? "bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/20"
                                                    : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-sub hover:bg-gray-50"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-sub opacity-50">
                        <Edit className="w-12 h-12 mb-3" />
                        <Caption className="font-black uppercase tracking-widest leading-4">{t('agency.inspectorIdleMsg')}</Caption>
                    </div>
                )}
            </div>
        </div>
    );
}
