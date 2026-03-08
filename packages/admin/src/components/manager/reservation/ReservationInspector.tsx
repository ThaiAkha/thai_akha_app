import React from 'react';
import InputField from '../../form/input/InputField';
import TextArea from '../../form/input/TextArea';
import SelectField from '../../form/input/SelectField';
import { Users } from 'lucide-react';

interface ReservationInspectorProps {
    selectedBooking: any | null;
    isEditing: boolean;
    editData: any;
    onEditChange: (data: any) => void;
}



const formatBookingDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
        .replace(/(\d+)\s+(\w+)\s+(\d+)/, '$1 $2, $3');
};

const ReservationInspector: React.FC<ReservationInspectorProps> = ({
    selectedBooking,
    isEditing,
    editData,
    onEditChange,
}) => {
    if (!selectedBooking) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="size-16 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center mb-4 text-gray-300 shadow-sm border border-gray-100 dark:border-gray-700">
                    <Users className="w-8 h-8" />
                </div>
                <h5 className="text-gray-500 font-bold uppercase tracking-widest text-xs">No Selection</h5>
                <p className="text-gray-400 text-xs mt-2 max-w-[200px]">Select a booking from the list to view and manage details.</p>
            </div>
        );
    }

    const b = selectedBooking;

    return (
        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden">
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {isEditing ? (
                    <div className="space-y-4">
                        {/* Participants */}
                        <InputField
                            label="Participants"
                            type="number"
                            value={editData.pax_count}
                            onChange={e => onEditChange({ ...editData, pax_count: parseInt(e.target.value, 10) || 0 })}
                        />

                        {/* Class Date */}
                        <InputField
                            label="Reservation Day"
                            type="date"
                            value={editData.booking_date}
                            onChange={e => onEditChange({ ...editData, booking_date: e.target.value })}
                        />

                        {/* Class Type */}
                        <SelectField
                            label="Class"
                            value={editData.session_id}
                            onChange={e => onEditChange({ ...editData, session_id: e.target.value })}
                        >
                            <option value="morning_class">Morning</option>
                            <option value="evening_class">Evening</option>
                        </SelectField>

                        {/* Phone */}
                        <InputField
                            label="Phone Number"
                            type="text"
                            value={editData.phone_number || ''}
                            onChange={e => onEditChange({ ...editData, phone_number: e.target.value })}
                        />

                        {/* Payment Status */}
                        <SelectField
                            label="Payment Status"
                            value={editData.payment_status || 'pending'}
                            onChange={e => onEditChange({ ...editData, payment_status: e.target.value })}
                        >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                            <option value="refunded">Refunded</option>
                        </SelectField>

                        {/* Notes */}
                        <TextArea
                            label="Notes"
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
                            label="Participants"
                            type="number"
                            value={b.pax_count || 0}
                            disabled
                        />

                        {/* Reservation Day */}
                        <InputField
                            label="Reservation Day"
                            type="text"
                            value={b.booking_date ? formatBookingDate(b.booking_date) : ''}
                            disabled
                        />

                        {/* Class */}
                        <SelectField
                            label="Class"
                            value={b.session_id || ''}
                            onChange={() => { }}
                            disabled
                        >
                            <option value="morning_class">Morning</option>
                            <option value="evening_class">Evening</option>
                        </SelectField>

                        {/* Phone Number */}
                        <InputField
                            label="Phone Number"
                            type="text"
                            value={b.phone_number || ''}
                            disabled
                        />

                        {/* Payment Status */}
                        <SelectField
                            label="Payment Status"
                            value={b.payment_status || 'pending'}
                            onChange={() => { }}
                            disabled
                        >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                            <option value="refunded">Refunded</option>
                        </SelectField>

                        {/* Notes */}
                        <TextArea
                            label="Notes"
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
