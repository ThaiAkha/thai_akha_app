import React from 'react';
import InputField from '../../form/input/InputField';
import TextArea from '../../form/input/TextArea';
import SelectField from '../../form/input/SelectField';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateByLanguage } from '../../../lib/dateFormatter';
import LeaderHeader from '../../common/LeaderHeader';
import type { ManagerBooking, ManagerBookingEditData } from '../../../hooks/useManagerReservation';

/** has_luggage non e' nella select del hook ma viene letto per il badge (legacy). */
type InspectorBooking = ManagerBooking & { has_luggage?: boolean | null };

interface ReservationInspectorProps {
    selectedBooking: InspectorBooking | null;
    isEditing: boolean;
    editData: ManagerBookingEditData | null;
    onEditChange: (data: ManagerBookingEditData | null) => void;
}



const ReservationInspector: React.FC<ReservationInspectorProps> = ({
    selectedBooking,
    isEditing,
    editData,
    onEditChange,
}) => {
    const { t, i18n } = useTranslation('reservation');

    const formatBookingDate = (dateStr: string): string => {
        return formatDateByLanguage(dateStr + 'T00:00:00', i18n.language, { day: '2-digit', month: 'long', year: 'numeric' });
    };

    if (!selectedBooking) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="size-16 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center mb-4 text-sub shadow-sm border border-gray-100 dark:border-gray-700">
                    <Users className="w-8 h-8" />
                </div>
                <h5 className="text-sub font-bold uppercase tracking-widest text-xs">{t('inspector.noSelection')}</h5>
                <p className="text-sub text-xs mt-2 max-w-[200px]">{t('inspector.noSelHint')}</p>
            </div>
        );
    }

    const b = selectedBooking;
    const leaderName = b.guest_name || b.profiles?.full_name || b.guest_email || t('inspector.guest', { defaultValue: 'Guest' });
    const leaderEmail = b.guest_email || b.profiles?.email || '';

    return (
        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden">
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {/* Header leader gruppo — avatar, nome, contatti (componente unificato) */}
                <LeaderHeader
                    label={t('inspector.groupLeader', { defaultValue: 'Group leader' })}
                    leader={{
                        name: leaderName,
                        avatarUrl: b.profiles?.avatar_url,
                        bookingRef: b.booking_ref,
                        phone: b.phone_number,
                        email: leaderEmail,
                        pax: b.pax_count ?? undefined,
                        luggage: b.has_luggage ?? undefined,
                    }}
                />
                {isEditing && editData ? (
                    <div className="space-y-4">
                        {/* Participants */}
                        <InputField
                            label={t('inspector.fieldPax')}
                            type="number"
                            value={editData.pax_count ?? undefined}
                            onChange={e => onEditChange({ ...editData, pax_count: parseInt(e.target.value, 10) || 0 })}
                        />

                        {/* Class Date */}
                        <InputField
                            label={t('inspector.fieldDate')}
                            type="date"
                            value={editData.booking_date}
                            onChange={e => onEditChange({ ...editData, booking_date: e.target.value })}
                        />

                        {/* Class Type */}
                        <SelectField
                            label={t('inspector.fieldClass')}
                            value={editData.session_id ?? ''}
                            onChange={e => onEditChange({ ...editData, session_id: e.target.value })}
                        >
                            <option value="morning_class">{t('inspector.morning')}</option>
                            <option value="evening_class">{t('inspector.evening')}</option>
                        </SelectField>

                        {/* Phone */}
                        <InputField
                            label={t('inspector.fieldPhone')}
                            type="text"
                            value={editData.phone_number || ''}
                            onChange={e => onEditChange({ ...editData, phone_number: e.target.value })}
                        />

                        {/* Payment Status */}
                        <SelectField
                            label={t('inspector.fieldPayment')}
                            value={editData.payment_status || 'pending'}
                            onChange={e => onEditChange({ ...editData, payment_status: e.target.value })}
                        >
                            <option value="pending">{t('inspector.payPending')}</option>
                            <option value="paid">{t('inspector.payPaid')}</option>
                            <option value="partial">{t('inspector.payPartial')}</option>
                            <option value="refunded">{t('inspector.payRefunded')}</option>
                        </SelectField>

                        {/* Notes */}
                        <TextArea
                            label={t('inspector.fieldNotes')}
                            value={editData.customer_note || ''}
                            onChange={val => onEditChange({ ...editData, customer_note: val })}
                            rows={3}
                        />
                    </div>
                ) : (
                    // Display Mode - Using standard form fields (disabled)
                    <div className="space-y-4">
                        {/* Participants */}
                        <InputField
                            label={t('inspector.fieldPax')}
                            type="number"
                            value={b.pax_count || 0}
                            disabled
                        />

                        {/* Reservation Day */}
                        <InputField
                            label={t('inspector.fieldDate')}
                            type="text"
                            value={b.booking_date ? formatBookingDate(b.booking_date) : ''}
                            disabled
                        />

                        {/* Class */}
                        <SelectField
                            label={t('inspector.fieldClass')}
                            value={b.session_id || ''}
                            onChange={() => { }}
                            disabled
                        >
                            <option value="morning_class">{t('inspector.morning')}</option>
                            <option value="evening_class">{t('inspector.evening')}</option>
                        </SelectField>

                        {/* Phone Number */}
                        <InputField
                            label={t('inspector.fieldPhone')}
                            type="text"
                            value={b.phone_number || ''}
                            disabled
                        />

                        {/* Payment Status */}
                        <SelectField
                            label={t('inspector.fieldPayment')}
                            value={b.payment_status || 'pending'}
                            onChange={() => { }}
                            disabled
                        >
                            <option value="pending">{t('inspector.payPending')}</option>
                            <option value="paid">{t('inspector.payPaid')}</option>
                            <option value="partial">{t('inspector.payPartial')}</option>
                            <option value="refunded">{t('inspector.payRefunded')}</option>
                        </SelectField>

                        {/* Notes */}
                        <TextArea
                            label={t('inspector.fieldNotes')}
                            value={b.customer_note || ''}
                            disabled
                            rows={2}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationInspector;
