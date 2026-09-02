import React from 'react';
import InputField from '../../form/input/InputField';
import TextArea from '../../form/input/TextArea';
import SelectField from '../../form/input/SelectField';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateByLanguage } from '../../../lib/dateFormatter';
import LeaderHeader from '../../common/LeaderHeader';
import { InspectorShell, InspectorBody, InspectorLeader, InspectorEmpty } from '../../ui/inspector';
import type { ManagerBooking, ManagerBookingEditData } from '../../../hooks/useManagerReservation';

/** has_luggage non e' nella select del hook ma viene letto per il badge (legacy). */
type InspectorBooking = ManagerBooking & { has_luggage?: boolean | null };

interface ReservationInspectorProps {
    selectedBooking: InspectorBooking | null;
    isEditing: boolean;
    editData: ManagerBookingEditData | null;
    onEditChange: (data: ManagerBookingEditData | null) => void;
}

/** Tile dell'icona nello stato vuoto: era il div scritto a mano, ora passa da InspectorEmpty. */
const EMPTY_ICON_TILE = 'size-16 rounded-2xl bg-surface flex items-center justify-center text-sub shadow-sm border border-gray-100 dark:border-gray-700';

/**
 * Pannello destro di ManagerReservation (task #93, B6): sui primitivi `ui/inspector`.
 * Il LeaderHeader esce dal corpo scrollabile e vive in InspectorLeader (pb-0: il gap
 * di 24px verso i campi lo da' il p-6 del corpo, come lo space-y-6 di prima); il corpo
 * scrolla da solo. Nessun footer: le azioni restano nell'header dell'host.
 */
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
            <InspectorEmpty
                icon={<Users className="w-8 h-8" />}
                iconClassName={EMPTY_ICON_TILE}
                title={t('inspector.noSelection')}
                hint={t('inspector.noSelHint')}
            />
        );
    }

    const b = selectedBooking;
    const leaderName = b.guest_name || b.profiles?.full_name || b.guest_email || t('inspector.guest', { defaultValue: 'Guest' });
    const leaderEmail = b.guest_email || b.profiles?.email || '';

    return (
        <InspectorShell className="animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header leader gruppo - avatar, nome, contatti (componente unificato) */}
            <InspectorLeader className="pb-0">
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
            </InspectorLeader>
            {/* Content Area */}
            <InspectorBody className="p-6 space-y-6">
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
            </InspectorBody>
        </InspectorShell>
    );
};

export default ReservationInspector;
