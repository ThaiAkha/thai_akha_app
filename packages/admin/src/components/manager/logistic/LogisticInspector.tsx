import React from 'react';
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
} from '../../../hooks/useManagerLogistic';
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

    if (!selectedBooking) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-sub">
                <Search className="w-12 h-12 mb-4 opacity-50" />
                <SectionTitle as="h5" className="text-title">{t('inspector.emptyTitle')}</SectionTitle>
                <Caption className="mt-2">{t('inspector.emptyHint')}</Caption>
            </div>
        );
    }

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
                    <SelectField
                        label={t('inspector.fieldPickupDriver')}
                        value={selectedBooking.pickup_driver_uid || ''}
                        onChange={(e) => onAssign(selectedBooking.id, e.target.value || null)}
                    >
                        <option value="">{t('inspector.unassigned')}</option>
                        {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                    </SelectField>
                </div>

                {/* ── Pickup Details ── */}
                <div className="p-6 space-y-4 border-b border-gray-100 dark:border-gray-800">
                    <SectionTitle as="h6" tone="sub" className="tracking-wide flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> {t('inspector.pickupDetails')}
                    </SectionTitle>

                    {/* Pickup / Walk-in toggle */}
                    <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => onUpdateLocal(selectedBooking.id, { meeting_point: null })}
                            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${!selectedBooking.meeting_point
                                ? 'bg-primary-500 text-white'
                                : 'text-sub hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            {t('inspector.pickupAtHotel')}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const updates: Partial<LogisticsItem> = {
                                    meeting_point: '',
                                    hotel_name: '',
                                    pickup_zone: 'walk-in',
                                };
                                // Auto-fill pickup time from meeting point if one is set
                                onUpdateLocal(selectedBooking.id, updates);
                            }}

                            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${selectedBooking.meeting_point
                                ? 'bg-primary-500 text-white'
                                : 'text-sub hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            {t('inspector.walkInMP')}
                        </button>
                    </div>

                    {/* Hotel Search - only when Pickup at Hotel */}
                    {selectedBooking.meeting_point === null && (
                        <SearchableHotelSelect
                            label={t('inspector.fieldHotel')}
                            value={selectedBooking.hotel_name || ''}
                            hotels={hotels}
                            zones={pickupZones}
                            placeholder={t('inspector.searchHotel')}
                            onChange={handleHotelChange}
                        />
                    )}

                    {/* Meeting Point - only when Walk-in */}
                    {selectedBooking.meeting_point !== null && (
                        <SelectField
                            label={t('inspector.fieldMP')}
                            value={selectedBooking.meeting_point || ''}
                            onChange={(e) => {
                                const mpId = e.target.value;
                                const mp = meetingPoints.find(m => m.id === mpId);
                                const updates: Partial<LogisticsItem> = { meeting_point: mpId };
                                if (mp) {
                                    const mpTime = selectedBooking.session_id === 'morning_class'
                                        ? mp.morning_pickup_time
                                        : mp.evening_pickup_time;
                                    if (mpTime) updates.pickup_time = mpTime;
                                }
                                onUpdateLocal(selectedBooking.id, updates);
                            }}
                        >
                            <option value="">{t('inspector.selectMP')}</option>
                            {meetingPoints.map(mp => (
                                <option key={mp.id} value={mp.id}>
                                    {mp.name}{mp.morning_pickup_time ? ` · ${selectedBooking.session_id === 'morning_class' ? mp.morning_pickup_time.slice(0, 5) : (mp.evening_pickup_time?.slice(0, 5) ?? '')}` : ''}
                                </option>
                            ))}
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

                    {/* Same / Different Location toggle */}
                    <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => onUpdateLocal(selectedBooking.id, { dropoff_hotel: null, dropoff_zone: null, dropoff_driver_uid: null })}
                            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${!selectedBooking.dropoff_hotel
                                ? 'bg-primary-500 text-white'
                                : 'text-sub hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            {t('inspector.sameLocation')}
                        </button>
                        <button
                            type="button"
                            onClick={() => onUpdateLocal(selectedBooking.id, { dropoff_hotel: selectedBooking.hotel_name || '' })}
                            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${selectedBooking.dropoff_hotel
                                ? 'bg-primary-500 text-white'
                                : 'text-sub hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            {t('inspector.differentLocation')}
                        </button>
                    </div>

                    {selectedBooking.dropoff_hotel !== null && selectedBooking.dropoff_hotel !== undefined && (
                        <>
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
                                <option value="">{t('inspector.sameAsPickup')}</option>
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
                <InspectorPrimaryButton type="submit" isLoading={isSaving} disabled={isSaving} startIcon={<Save className="w-4 h-4" />}>
                    {isSaving ? t('actions.saving') : t('actions.save')}
                </InspectorPrimaryButton>
            </InspectorFooter>

        </form>
        </InspectorShell>
    );
};

export default LogisticInspector;
