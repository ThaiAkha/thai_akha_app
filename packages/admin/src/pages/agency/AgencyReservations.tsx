import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { cn } from '@thaiakha/shared/lib/utils';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import {
    Search, MapPin, Clock, Phone,
    FileText, Printer, Save, Edit, Calendar,
    MoreHorizontal
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import PageGrid from '../../components/layout/PageGrid';
import PageMeta from '../../components/common/PageMeta';

interface AgencyBooking {
    internal_id: string;
    booking_ref: string | null;
    guest_name: string;
    email: string;
    booking_date: string;
    session_type: string;
    pax: number;
    total_price: number;
    commission: number;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    hotel_name: string;
    pickup_time: string;
    pickup_zone: string;
    customer_note: string;
    agency_note: string;
    phone_number: string;
}

const getDisplayId = (b: AgencyBooking) => b.booking_ref || b.internal_id.slice(0, 8).toUpperCase();

export default function AgencyReservations() {
    const { t } = useTranslation('reservation');
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<AgencyBooking[]>([]);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<AgencyBooking>>({});
    const [isSaving, setIsSaving] = useState(false);

    const fetchBookings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let query = supabase
                .from('bookings')
                .select(`
          internal_id, booking_ref, booking_date, session_id, pax_count, total_price, status,
          customer_note, agency_note, hotel_name, pickup_time, pickup_zone, phone_number,
          guest_name, guest_email,
          profiles:user_id(full_name, email)
        `)
                .order('booking_date', { ascending: false });

            if (user.role === 'agency') query = query.eq('user_id', user.id);

            const { data } = await query;
            const mapped: AgencyBooking[] = (data || []).map((b: any) => ({
                internal_id: b.internal_id,
                booking_ref: b.booking_ref,
                guest_name: b.guest_name || b.profiles?.full_name || 'Guest',
                email: b.guest_email || b.profiles?.email || '',
                booking_date: b.booking_date,
                session_type: b.session_id?.includes('morning') ? 'Morning Class' : 'Evening Class',
                pax: b.pax_count,
                total_price: b.total_price,
                commission: Math.round(b.total_price * ((user.agency_commission_rate || 0) / 100)),
                status: b.status,
                hotel_name: b.hotel_name || '',
                pickup_time: b.pickup_time ? b.pickup_time.slice(0, 5) : '--:--',
                pickup_zone: b.pickup_zone || 'pending',
                customer_note: b.customer_note || '',
                agency_note: b.agency_note || '',
                phone_number: b.phone_number || ''
            }));
            setBookings(mapped);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ AppHeader handles metadata loading automatically

    useEffect(() => { fetchBookings(); }, [user]);

    const activeBooking = useMemo(() => bookings.find(b => b.internal_id === selectedBookingId), [bookings, selectedBookingId]);

    useEffect(() => {
        if (activeBooking) {
            setEditForm({
                hotel_name: activeBooking.hotel_name,
                pickup_time: activeBooking.pickup_time,
                agency_note: activeBooking.agency_note,
                status: activeBooking.status
            });
            setIsEditing(false);
        }
    }, [activeBooking]);

    const handleSave = async () => {
        if (!activeBooking) return;
        setIsSaving(true);
        try {
            await supabase.from('bookings').update(editForm).eq('internal_id', activeBooking.internal_id);
            fetchBookings();
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating booking:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredList = useMemo(() => {
        return bookings.filter(b => (statusFilter === 'all' || b.status === statusFilter) &&
            (b.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) || getDisplayId(b).toLowerCase().includes(searchQuery.toLowerCase())));
    }, [bookings, statusFilter, searchQuery]);

    return (
        <PageContainer className="h-[calc(100vh-180px)] flex flex-col no-scrollbar">
            <PageMeta
                title="Admin Dashboard | Thai Akha Kitchen"
                description="To be set up later."
            />

            <PageGrid columns={12} className="flex-1 min-h-0">
                {/* 1. LEFT PANE (List) - Grid Col 3 */}
                <div className="lg:col-span-3 flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <h6 className="uppercase tracking-widest text-xs font-bold text-gray-500">{t('agency.pageTitle')}</h6>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('agency.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary-500 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Filters  */}
                    <div className="p-2 border-b border-gray-100 dark:border-gray-800 flex gap-2 overflow-x-auto no-scrollbar">
                        {['all', 'confirmed', 'pending', 'cancelled'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors",
                                    statusFilter === s
                                        ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400"
                                        : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {loading ? (
                            <div className="p-8 text-center text-gray-400">
                                <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                <p className="text-xs">{t('agency.loading')}</p>
                            </div>
                        ) : (
                            <>
                                {filteredList.map(b => (
                                    <div
                                        key={b.internal_id}
                                        onClick={() => setSelectedBookingId(b.internal_id)}
                                        className={cn(
                                            "p-3 rounded-xl cursor-pointer transition-all border",
                                            selectedBookingId === b.internal_id
                                                ? "bg-primary-50 border-primary-200 shadow-sm dark:bg-primary-500/10 dark:border-primary-500/20"
                                                : "bg-white border-transparent hover:bg-gray-50 dark:bg-transparent dark:hover:bg-gray-800"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-gray-900 dark:text-white truncate">{b.guest_name}</span>
                                            <Badge color={b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'error'}>
                                                {b.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            <span>{new Date(b.booking_date).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span className="font-mono">{getDisplayId(b)}</span>
                                        </div>
                                    </div>
                                ))}
                                {filteredList.length === 0 && (
                                    <div className="p-8 text-center text-gray-400">
                                        <p className="text-sm">{t('agency.noBookings')}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* 2. CENTER PANE (Preview) - Grid Col 6 */}
                <div className="lg:col-span-6 flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center h-[73px]">
                        <h2 className="text-lg font-black uppercase text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {t('agency.invoiceTitle')}
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-100/50 dark:bg-black/20 flex justify-center">
                        {activeBooking ? (
                            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                                <div className="p-8 md:p-10 space-y-8">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="w-16 h-16 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-600/20">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <div className="text-right">
                                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">{t('agency.invoiceLabel')}</h1>
                                            <p className="text-gray-500 font-mono mt-1 text-sm tracking-widest">REF: #{getDisplayId(activeBooking)}</p>
                                        </div>
                                    </div>

                                    {/* Addresses */}
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('agency.billedTo')}</h3>
                                            <p className="font-bold text-gray-900 dark:text-white">{user?.agency_company_name || user?.full_name}</p>
                                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                                {user?.agency_address || t('agency.partnerAddress')}<br />
                                                {user?.agency_city}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('agency.guestInfo')}</h3>
                                            <p className="font-bold text-gray-900 dark:text-white">{activeBooking.guest_name}</p>
                                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                                {activeBooking.session_type}<br />
                                                {activeBooking.pax} {t('agency.participants')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Line Items */}
                                    <div className="border-t border-b border-gray-100 dark:border-gray-700 py-6">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-left">
                                                    <th className="pb-4">{t('agency.colDescription')}</th>
                                                    <th className="pb-4 text-center">{t('agency.colDate')}</th>
                                                    <th className="pb-4 text-right">{t('agency.colAmount')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-gray-700 dark:text-gray-300">
                                                <tr>
                                                    <td className="py-2 font-bold">{activeBooking.session_type} for {activeBooking.pax} pax</td>
                                                    <td className="py-2 text-center text-xs">{new Date(activeBooking.booking_date).toLocaleDateString()}</td>
                                                    <td className="py-2 text-right font-mono font-bold">{activeBooking.total_price.toLocaleString()} THB</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Totals */}
                                    <div className="flex justify-end pt-4">
                                        <div className="w-full max-w-xs space-y-3">
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span className="font-medium">{t('agency.grossSubtotal')}</span>
                                                <span className="font-mono">{activeBooking.total_price.toLocaleString()} THB</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                                <span className="font-medium">{t('agency.agencyDiscount', { rate: user?.agency_commission_rate })}</span>
                                                <span className="font-mono">-{activeBooking.commission.toLocaleString()} THB</span>
                                            </div>
                                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-baseline">
                                                <span className="font-black uppercase text-xs text-gray-900 dark:text-white tracking-widest">{t('agency.netPayable')}</span>
                                                <span className="text-3xl font-black text-primary-600 dark:text-primary-400 font-mono tracking-tighter">
                                                    {(activeBooking.total_price - activeBooking.commission).toLocaleString()}
                                                    <span className="text-xs text-gray-500 ml-2 font-black">THB</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                <FileText className="w-16 h-16 mb-4 opacity-20" />
                                <p className="font-bold text-xs uppercase tracking-widest">{t('agency.selectBooking')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. RIGHT PANE (Inspector) - Grid Col 3 */}
                <div className="lg:col-span-3 flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center h-[73px] bg-gray-50/50 dark:bg-gray-800/50">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-tighter">{t('agency.inspectorTitle')}</h2>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{activeBooking ? getDisplayId(activeBooking) : t('agency.inspectorIdle')}</p>
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
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('agency.guestLogistics')}</h3>

                                    <div>
                                        <Label className="text-[10px] font-bold uppercase text-gray-400 mb-1 ml-1">{t('agency.hotelPickup')}</Label>
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
                                            <Label className="text-[10px] font-bold uppercase text-gray-400 mb-1 ml-1">{t('agency.fieldTime')}</Label>
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
                                            <Label className="text-[10px] font-bold uppercase text-gray-400 mb-1 ml-1">{t('agency.fieldPax')}</Label>
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
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('agency.internalDetails')}</h3>

                                    <div>
                                        <Label className="text-[10px] font-bold uppercase text-gray-400 mb-1 ml-1">{t('agency.agencyNote')}</Label>
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
                                            <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">{t('agency.guestContact')}</span>
                                        </div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-primary-400 pl-5">
                                            {activeBooking.phone_number || t('agency.noPhone')}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Actions (Only when editing) */}
                                {isEditing && (
                                    <div className="space-y-3 pt-4 animate-in fade-in">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('agency.lifecycleStatus')}</h3>
                                        <div className="flex gap-2">
                                            {['confirmed', 'pending', 'cancelled'].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setEditForm({ ...editForm, status: s as any })}
                                                    className={cn(
                                                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase border transition-all tracking-widest",
                                                        editForm.status === s
                                                            ? "bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/20"
                                                            : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:bg-gray-50"
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
                            <div className="flex flex-col items-center justify-center h-full text-gray-300 opacity-50">
                                <Edit className="w-12 h-12 mb-3" />
                                <p className="text-[10px] font-black uppercase tracking-widest">{t('agency.inspectorIdleMsg')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </PageGrid>
        </PageContainer>
    );
}
