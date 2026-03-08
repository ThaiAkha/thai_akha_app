import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { supabase } from "../../lib/supabase";

interface Booking {
    internal_id: string; // Changed from id
    created_at: string;
    booking_date: string;
    session_id: string;
    pax_count: number;
    payment_status: string;
    guest_name: string;
}

export default function RecentBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
          internal_id, created_at, booking_date, session_id, pax_count, payment_status, guest_name
        `)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            console.error("Error fetching recent bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const getSessionLabel = (id: string) => {
        return id === 'morning_class' ? 'Morning Tour' : 'Evening Feast';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'success';
            case 'pay_on_arrival': return 'warning';
            case 'pending': return 'error';
            default: return 'light';
        }
    };

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) return <div className="p-6 text-center text-gray-500">Loading bookings...</div>;

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Recent Bookings
                    </h3>
                </div>
            </div>
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">User</TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date</TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Class</TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Pax</TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {bookings.map((booking) => (
                            <TableRow key={booking.internal_id}>
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-[40px] w-[40px] overflow-hidden rounded-full uppercase bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xs ring-2 ring-white dark:ring-gray-800">
                                            {booking.guest_name?.substring(0, 2) || 'GU'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {booking.guest_name || 'Guest'}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {new Date(booking.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 max-w-[100px] truncate">
                                    {getSessionLabel(booking.session_id)}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {booking.pax_count}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <Badge size="sm" color={getStatusColor(booking.payment_status)}>
                                        {formatStatus(booking.payment_status)}
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
