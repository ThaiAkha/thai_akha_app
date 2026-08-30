import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Heading, Paragraph } from '../typography';
import Badge from "../ui/badge/Badge"; // Default import assuming Badge.tsx has export default
import { supabase } from "@thaiakha/shared/lib/supabase";
import { useTranslation } from "react-i18next";
import { formatDateByLanguage } from '../../lib/dateFormatter';

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
    const { t, i18n } = useTranslation('dashboard');
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
            setBookings((data as unknown as Booking[]) || []);
        } catch (error) {
            console.error("Error fetching agency bookings:", error);
        } finally {
            setLoading(false);
        }
    };


    const getStatusColor = (status: string): "success" | "warning" | "error" | "light" => {
        return status === 'paid' ? 'success' : 'warning';
    };

    if (loading) return <div className="p-6 text-center text-sub">{t('agencyBookings.loading')}</div>;

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Heading level="h4" className="text-body">
                        {t('agencyBookings.title')}
                    </Heading>
                </div>
            </div>
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="py-3 font-medium text-sub text-start text-theme-xs">{t('agencyBookings.colRef')}</TableCell>
                            <TableCell isHeader className="py-3 font-medium text-sub text-start text-theme-xs">{t('agencyBookings.colDate')}</TableCell>
                            <TableCell isHeader className="py-3 font-medium text-sub text-start text-theme-xs">{t('agencyBookings.colPax')}</TableCell>
                            <TableCell isHeader className="py-3 font-medium text-sub text-start text-theme-xs">{t('agencyBookings.colStatus')}</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {bookings.map((booking) => (
                            <TableRow key={booking.internal_id}>
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-[32px] w-[32px] overflow-hidden rounded-md bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xs">
                                            {booking.guest_name?.substring(0, 2).toUpperCase() || 'AG'}
                                        </div>
                                        <div>
                                            <Paragraph size="sm" className="text-gray-800 dark:text-white/90 truncate max-w-[120px] font-medium">
                                                {booking.guest_name || t('agencyBookings.guest')}
                                            </Paragraph>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-sub text-theme-sm">
                                    {formatDateByLanguage(booking.booking_date, i18n.language, { day: 'numeric', month: 'short' })}
                                </TableCell>
                                <TableCell className="py-3 text-sub text-theme-sm font-bold">
                                    {booking.pax_count}
                                </TableCell>
                                <TableCell className="py-3 text-sub text-theme-sm">
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
