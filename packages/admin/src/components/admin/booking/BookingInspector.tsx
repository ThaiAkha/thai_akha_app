import { Rocket, Check } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import Button from '../../../components/ui/button/Button';
import Card from '../../ui/Card';
import { PaymentStatus } from '../../../hooks/useAdminBooking';
import SectionTitle from '../../typography/SectionTitle';

interface BookingInspectorProps {
    // Session & Booking Info
    session: 'morning_class' | 'evening_class';
    pax: number;

    // Guest Data
    userMode: string;
    newUser?: {
        fullName: string;
        email?: string;
        phone?: string;
        nationality?: string;
        age?: string | number;
        gender?: string;
        isWhatsapp?: boolean;
    };
    selectedUser?: {
        fullName?: string;
        full_name?: string;
        guest_name?: string;
        agency_company_name?: string;
        email?: string;
        phone?: string;
        nationality?: string;
        age?: string | number;
        gender?: string;
        is_whatsapp?: boolean;
    } | null;

    // Hotel & Logistics
    hotel?: string;
    meetingPoint?: string;
    hasLuggage: boolean;
    notes?: string;

    // Payment & Amount
    amount: number;
    paymentStatus: PaymentStatus;
    onPaymentStatusChange: (s: PaymentStatus) => void;

    // Actions
    onConfirm: () => void;
    loading: boolean;
}

const BookingInspector: React.FC<BookingInspectorProps> = ({
    session,
    pax,
    userMode,
    newUser,
    selectedUser,
    hotel,
    meetingPoint,
    hasLuggage,
    notes,
    amount,
    paymentStatus,
    onPaymentStatusChange,
    onConfirm,
    loading
}) => {
    const guestData = userMode === 'new' ? newUser : selectedUser;
    const sessionLabel = session === 'morning_class' ? 'Morning Class' : 'Evening Class';
    const isWhatsapp = userMode === 'new' ? newUser?.isWhatsapp : selectedUser?.is_whatsapp;

    let guestName: string | undefined = undefined;
    if (userMode === 'new') {
        guestName = newUser?.fullName;
    } else if (userMode === 'agency') {
        guestName = selectedUser?.agency_company_name || selectedUser?.fullName || selectedUser?.full_name || selectedUser?.guest_name;
    } else {
        guestName = selectedUser?.full_name || selectedUser?.fullName || selectedUser?.guest_name;
    }

    return (
        <div className="lg:col-span-3 space-y-6">
            <Card className="sticky top-6">
                <Card.Content className="space-y-6">

                    {/* 1. Class Selection - PROMINENT */}
                    <div className="pb-6 border-b border-gray-100 dark:border-gray-800">
                        <SectionTitle>Selected Class</SectionTitle>
                        <div className={cn(
                            "p-3 rounded-lg font-black text-lg uppercase tracking-wide text-center",
                            session === 'morning_class'
                                ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                                : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30"
                        )}>
                            {sessionLabel}
                        </div>
                    </div>

                    {/* 2. Pax Count */}
                    <div className="pb-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center gap-4">
                        <SectionTitle>Number of Guests</SectionTitle>
                        <div className="text-3xl font-black text-gray-900 dark:text-white flex items-center h-10">{pax}</div>
                    </div>

                    {/* 3. Guest Details */}
                    {guestData && (
                        <div className="pb-6 border-b border-gray-100 dark:border-gray-800">
                            <SectionTitle>Guest Details</SectionTitle>
                            <div className="space-y-2 text-sm">
                                {guestName && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Name</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{guestName}</span>
                                    </div>
                                )}
                                {guestData.email && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Email</span>
                                        <span className="font-medium text-gray-900 dark:text-white text-xs truncate ml-2">{guestData.email}</span>
                                    </div>
                                )}
                                {guestData.phone && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Phone</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{guestData.phone}</span>
                                    </div>
                                )}
                                {guestData.nationality && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Nationality</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{guestData.nationality}</span>
                                    </div>
                                )}
                                {guestData.age && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Age</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{guestData.age}</span>
                                    </div>
                                )}
                                {guestData.gender && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Gender</span>
                                        <span className="font-medium text-gray-900 dark:text-white capitalize">{guestData.gender}</span>
                                    </div>
                                )}
                                {isWhatsapp !== undefined && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">WhatsApp</span>
                                        <span className={cn("font-medium text-sm", isWhatsapp ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400")}>
                                            {isWhatsapp ? "Yes" : "No"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 4. Hotel & Logistics */}
                    <div className="pb-6 border-b border-gray-100 dark:border-gray-800">
                        <SectionTitle>Logistics</SectionTitle>
                        <div className="space-y-2 text-sm">
                            {hotel && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Hotel</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{hotel}</span>
                                </div>
                            )}
                            {!hotel && meetingPoint && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Meeting Point</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{meetingPoint}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Luggage</span>
                                <span className={cn("font-medium text-sm", hasLuggage ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400")}>
                                    {hasLuggage ? "Yes" : "No"}
                                </span>
                            </div>
                            {notes && (
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-600 dark:text-gray-400">Notes</span>
                                    <span className="font-medium text-gray-900 dark:text-white text-xs text-right line-clamp-2">{notes}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 5. Total Amount - PROMINENT */}
                    <div className="pb-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center gap-4">
                        <SectionTitle>Total Amount</SectionTitle>
                        <div className="text-3xl font-black flex items-center gap-1 h-10">
                            <span className="text-brand-600">{amount.toLocaleString()}</span>
                            <span className="text-gray-400 text-sm">THB</span>
                        </div>
                    </div>

                    {/* 6. Payment Status Toggle */}
                    <div className="pb-6 border-b border-gray-100 dark:border-gray-800">
                        <SectionTitle>Payment</SectionTitle>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => onPaymentStatusChange('unpaid')}
                                className={cn(
                                    "h-11 rounded-lg border font-black text-sm uppercase transition-all flex items-center justify-center",
                                    paymentStatus === 'unpaid'
                                        ? "border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                                )}
                            >
                                Unpaid
                            </button>
                            <button
                                onClick={() => onPaymentStatusChange('paid')}
                                className={cn(
                                    "h-11 rounded-lg border font-black text-sm uppercase transition-all flex items-center justify-center gap-2",
                                    paymentStatus === 'paid'
                                        ? "border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                                )}
                            >
                                <Check className="w-4 h-4" />
                                Paid
                            </button>
                        </div>
                    </div>

                </Card.Content>

                {/* Confirm Button */}
                <Card.Footer className="flex-col gap-0 pt-6">
                    <Button
                        variant="primary"
                        className="w-full py-4 text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/20"
                        onClick={onConfirm}
                        isLoading={loading}
                        startIcon={<Rocket className="w-4 h-4" />}
                    >
                        Confirm Booking
                    </Button>
                </Card.Footer>
            </Card>
        </div>
    );
};

export default BookingInspector;
