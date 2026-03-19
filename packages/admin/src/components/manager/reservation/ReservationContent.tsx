import React from 'react';
import Badge from '../../ui/badge/Badge';
import Button from '../../ui/button/Button';
import Avatar from '../../ui/avatar/Avatar';
import { Users } from 'lucide-react';
import InputField from '../../form/input/InputField';

interface ReservationContentProps {
    loading: boolean;
    bookings: any[];
    selectedBookingId: string | null;
    onCancelBooking?: (bookingId: string) => void;
    onRestoreBooking?: (bookingId: string) => void;
    onDeleteBooking?: (bookingId: string) => void;
}

const ReservationContent: React.FC<ReservationContentProps> = ({
    loading,
    bookings,
    selectedBookingId,
    onCancelBooking,
    onRestoreBooking,
    onDeleteBooking,
}) => {
    const [confirmCancel, setConfirmCancel] = React.useState(false);
    const selectedBooking = bookings.find(b => b.internal_id === selectedBookingId);

    // Debug logging
    React.useEffect(() => {
        console.log('ReservationContent State:', {
            bookingsCount: bookings.length,
            selectedBookingId,
            foundBooking: !!selectedBooking,
            bookingNames: bookings.slice(0, 3).map(b => b.guest_name || b.profiles?.full_name),
            loading
        });
        if (selectedBooking) {
            console.log('ReservationContent - Location Data:', {
                pickup_zone: selectedBooking.pickup_zone,
                meeting_point: selectedBooking.meeting_point,
                hotel_name: selectedBooking.hotel_name,
                is_walk_in: selectedBooking.pickup_zone === 'walk-in'
            });
        }
    }, [bookings, selectedBookingId, selectedBooking, loading]);

    if (loading && bookings.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Loading...</span>
            </div>
        );
    }

    if (!selectedBooking) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                <Users className="w-12 h-12 opacity-50" />
                <span className="text-sm font-bold uppercase tracking-widest">Select a client to view details</span>
                {bookings.length > 0 && (
                    <span className="text-xs text-gray-500 mt-2">({bookings.length} bookings available)</span>
                )}
                {bookings.length === 0 && (
                    <span className="text-xs text-gray-500 mt-2">No bookings found for selected date</span>
                )}
            </div>
        );
    }

    const profile = selectedBooking.profiles || {};

    return (
        <div className="flex flex-col h-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header with booking summary */}
            <div className="bg-orange-100/80 dark:bg-btn-p-900/10 p-8 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <Avatar
                            src={profile.avatar_url}
                            alt={profile.full_name || 'Guest'}
                            size="xxlarge"
                        />
                        <div>
                            <h3 className="font-black text-3xl text-gray-900 dark:text-white">
                                {selectedBooking.guest_name || profile.full_name || 'Guest'}
                            </h3>
                            <p className="text-md text-gray-500 dark:text-gray-400 mt-2 tracking-widest font-bold">
                                Booking Number: {selectedBooking.booking_ref || selectedBooking.internal_id.slice(0, 8).toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                        <Badge variant="solid" color={selectedBooking.status === 'confirmed' ? 'success' : 'warning'}>
                            {selectedBooking.status?.toUpperCase()}
                        </Badge>
                        <Badge variant="light" color={selectedBooking.pickup_zone === 'walk-in' ? 'success' : 'info'}>
                            {selectedBooking.pickup_zone === 'walk-in' ? 'Walk In' : 'Pickup Required'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-3 no-scrollbar">

                {/* Contact Info */}
                <div className="space-y-4 grid grid-cols-3 gap-4">
                    {selectedBooking.phone_number && (
                        <InputField
                            label="Phone"
                            value={selectedBooking.phone_number}
                            disabled
                        />
                    )}

                    {selectedBooking.guest_email && (
                        <InputField
                            label="Email"
                            value={selectedBooking.guest_email}
                            disabled
                        />
                    )}

                </div>

                {/* Location */}
                {selectedBooking.pickup_zone !== 'walk-in' ? (
                    <div className="space-y-4 grid grid-cols-3 gap-4">
                        {selectedBooking.hotel_name && (
                            <InputField
                                label="Hotel"
                                value={selectedBooking.hotel_name}
                                disabled
                            />
                        )}

                        {selectedBooking.pickup_zone && (
                            <InputField
                                label="Zone"
                                value={selectedBooking.pickup_zone}
                                disabled
                            />
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {selectedBooking.meeting_point && (
                            <InputField
                                label="Meeting Point"
                                value={selectedBooking.meeting_point}
                                disabled
                            />
                        )}
                    </div>
                )}

                {/* Notes */}
                {selectedBooking.customer_note && (
                    <div className="bg-white dark:bg-white/[0.05] rounded-lg p-4 border border-gray-100 dark:border-white/10">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">Notes</h4>
                        <InputField
                            label="Customer Note"
                            value={selectedBooking.customer_note}
                            disabled
                        />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50/30 dark:bg-gray-800/20 shrink-0 flex items-center justify-between">
                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    {selectedBooking.status === 'cancelled' ? 'Booking Cancelled' : 'Active Booking'}
                </div>

                {selectedBooking.status !== 'cancelled' ? (
                    // Active booking - show Cancel button
                    !confirmCancel ? (
                        <Button
                            onClick={() => setConfirmCancel(true)}
                            variant="outline"
                            size="sm"
                        >
                            Cancel Booking
                        </Button>
                    ) : (
                        // Confirmation state - show confirm and discard buttons
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => {
                                    onCancelBooking?.(selectedBookingId!);
                                    setConfirmCancel(false);
                                }}
                                variant="outline"
                                size="sm"
                            >
                                Confirm
                            </Button>
                            <Button
                                onClick={() => setConfirmCancel(false)}
                                variant="outline"
                                size="sm"
                            >
                                Discard
                            </Button>
                        </div>
                    )
                ) : (
                    // Cancelled booking - show Restore and Delete Permanently buttons
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => onRestoreBooking?.(selectedBookingId!)}
                            variant="outline"
                            size="sm"
                        >
                            Restore Booking
                        </Button>
                        <Button
                            onClick={() => onDeleteBooking?.(selectedBookingId!)}
                            variant="outline"
                            size="sm"
                        >
                            Delete Permanently
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationContent;