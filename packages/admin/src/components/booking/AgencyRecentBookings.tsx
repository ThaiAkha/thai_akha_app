import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge"; // Default import assuming Badge.tsx has export default
import { supabase } from "../../lib/supabase";

interface Booking {
    internal_id: string;
    created_at: string;
    booking_date: string;
    session_id: string;
    pax_count: number;
    payment_status: string;
    guest_name: string;
    payment_method: string;
}

export default function AgencyRecentBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            // Filter for bookings where payment_method is agency_invoice
            const { data, error } = await supabase
                .from('bookings')
                .select(`
          internal_id, created_at, booking_date, session_id, pax_count, payment_status, guest_name, payment_method
        `)
                .eq('payment_method', 'agency_invoice')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            console.error("Error fetching agency bookings:", error);
        } finally {
            setLoading(false);
        }
    };


    const getStatusColor = (status: string): "success" | "warning" | "error" | "light" => {
        return status === 'paid' ? 'success' : 'warning';
    };

    if (loading) return <div className="p-6 text-center text-gray-500">Loading agency bookings...</div>;

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Agency Bookings
                    </h3>
                </div>
            </div>
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Agency Ref / Guest</TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date</TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Pax</TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {bookings.map((booking) => (
                            <TableRow key={booking.internal_id}>
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-[32px] w-[32px] overflow-hidden rounded-md bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-[10px]">
                                            {booking.guest_name?.substring(0, 2).toUpperCase() || 'AG'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 truncate max-w-[120px]">
                                                {booking.guest_name || 'Guest'}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {new Date(booking.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 font-bold">
                                    {booking.pax_count}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <Badge size="sm" color={getStatusColor(booking.payment_status)}>
                                        {booking.payment_status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
