/**
 * 🛒 KITCHEN PURCHASES — kitchen Store POS: pick the customer (booking), see the
 * order starting with the auto class-fee line (per group), add shop products and
 * save them as PENDING shop_orders. The manager then adds items, takes payment and
 * closes the order in the Manager POS. The kitchen never takes payment.
 *
 * Class fee is shown read-only here (per-group total = class price × pax), marked
 * PAID if paid online, TO PAY if pay-on-arrival. It is NOT persisted here — the
 * Manager POS owns it as a virtual line and settles it on payment.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { Plus, Minus, Save, ShoppingCart, Users, GraduationCap } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import WelcomeHero from '../../components/dashboard/WelcomeHero';
import Button from '../../components/ui/button/Button';
import { cn } from '@thaiakha/shared/lib/utils';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import { Heading, SectionTitle } from '../../components/typography';

interface BookingLite {
    internal_id: string;
    guest_name: string | null;
    session_id: string | null;
    session_name: string;
    pax_count: number;
    payment_method: string | null;
    payment_status: string | null;
    class_price_thb: number;
}
interface Product { sku: string; item_name: string; price_thb: number; catalog_image_url: string | null; }

const KitchenPurchases: React.FC = () => {
    const { t } = useTranslation('pos');
    const { pageMeta } = usePageMetadata('kitchen-purchases');
    const todayISO = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(todayISO);
    const [bookings, setBookings] = useState<BookingLite[]>([]);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<Record<string, number>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            const safeDate = date < todayISO ? todayISO : date;
            const [bk, pr] = await Promise.all([
                supabase.from('bookings')
                    .select('internal_id, guest_name, session_id, pax_count, payment_method, payment_status, class_sessions (display_name, price_thb)')
                    .eq('booking_date', safeDate).neq('status', 'cancelled').order('session_id'),
                supabase.from('shop_akha').select('sku, item_name, price_thb, catalog_image_url').eq('is_active', true).order('item_name'),
            ]);
            setBookings((((bk.data as unknown) as Array<Record<string, unknown>>) || []).map((b) => {
                const cs = (Array.isArray(b.class_sessions) ? b.class_sessions[0] : b.class_sessions) as { display_name?: string; price_thb?: number } | null;
                return {
                    internal_id: b.internal_id as string,
                    guest_name: (b.guest_name as string) || null,
                    session_id: (b.session_id as string) || null,
                    session_name: cs?.display_name || 'Class',
                    pax_count: (b.pax_count as number) || 1,
                    payment_method: (b.payment_method as string) || null,
                    payment_status: (b.payment_status as string) || null,
                    class_price_thb: cs?.price_thb || 0,
                };
            }));
            setProducts((pr.data as unknown as Product[]) || []);
            setBookingId(null);
            setCart({});
        };
        load();
    }, [date, todayISO]);

    const activeBooking = useMemo(() => bookings.find(b => b.internal_id === bookingId) || null, [bookings, bookingId]);
    // Class fee line (per group): total = class price × pax. Paid online → PAID; pay-on-arrival → TO PAY.
    const classFee = useMemo(() => {
        if (!activeBooking || activeBooking.class_price_thb <= 0) return null;
        const total = activeBooking.class_price_thb * activeBooking.pax_count;
        const paid = activeBooking.payment_method !== 'pay_on_arrival' || activeBooking.payment_status === 'paid';
        return { name: `${activeBooking.session_name} — ${activeBooking.pax_count} pax`, total, paid };
    }, [activeBooking]);

    const productBySku = useMemo(() => Object.fromEntries(products.map(p => [p.sku, p])), [products]);
    const cartTotal = useMemo(
        () => Object.entries(cart).reduce((acc, [sku, qty]) => acc + (productBySku[sku]?.price_thb || 0) * qty, 0),
        [cart, productBySku],
    );

    const addItem = (sku: string) => setCart(prev => ({ ...prev, [sku]: (prev[sku] || 0) + 1 }));
    const removeItem = (sku: string) => setCart(prev => {
        const n = (prev[sku] || 0) - 1;
        const next = { ...prev };
        if (n <= 0) delete next[sku]; else next[sku] = n;
        return next;
    });

    const handleSave = async () => {
        if (!bookingId || Object.keys(cart).length === 0) return;
        setSaving(true);
        try {
            const rows = Object.entries(cart).map(([sku, quantity]) => {
                const price = productBySku[sku]?.price_thb || 0;
                return { booking_id: bookingId, sku, quantity, unit_price_snapshot: price, total_price: price * quantity, status: 'pending', staff_note: 'kitchen' };
            });
            const { error } = await supabase.from('shop_orders').insert(rows);
            if (error) throw error;
            alert(t('messages.purchaseSaved', { defaultValue: 'Purchases saved — sent to the manager.' }));
            setCart({});
        } catch (err) {
            alert(t('messages.error', { message: err instanceof Error ? err.message : 'error' }));
        } finally {
            setSaving(false);
        }
    };

    return (
        <PageContainer variant="wide">
            <div>
                {pageMeta && (
                    <WelcomeHero badge={pageMeta.badge} titleMain={pageMeta.titleMain} titleHighlight={pageMeta.titleHighlight} description={pageMeta.description} imageUrl={pageMeta.imageUrl} icon={pageMeta.icon} />
                )}

                {/* Controls: date + booking picker */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <input type="date" min={todayISO} value={date} onChange={e => setDate(e.target.value)} className="h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" />
                    <select value={bookingId ?? ''} onChange={e => { setBookingId(e.target.value || null); setCart({}); }} className="h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                        <option value="">{t('purchases.pickBooking', { defaultValue: 'Select a booking…' })}</option>
                        {bookings.map(b => <option key={b.internal_id} value={b.internal_id}>{b.guest_name || `#${b.internal_id.slice(0, 8)}`} · {(b.session_id || '').replace('_class', '')} · {b.pax_count} pax</option>)}
                    </select>
                </div>

                {!bookingId ? (
                    <div className="py-20 text-center flex flex-col items-center gap-3 text-gray-400">
                        <Users className="w-10 h-10 opacity-40" />
                        <SectionTitle className="text-gray-400">{t('purchases.selectHint', { defaultValue: 'Select a booking to add purchases.' })}</SectionTitle>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Catalog */}
                        <div className="lg:col-span-8 min-w-0">
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                                {products.map(p => (
                                    <button key={p.sku} onClick={() => addItem(p.sku)} className="group text-left rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                            <img src={p.catalog_image_url || 'https://via.placeholder.com/200'} alt={p.item_name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-3">
                                            <div className="text-xs font-black uppercase text-gray-900 dark:text-white truncate">{p.item_name}</div>
                                            <div className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400">{p.price_thb} ฿</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cart */}
                        <div className="lg:col-span-4 min-w-0">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
                                <div className="flex items-center gap-2 px-4 h-14 border-b border-gray-100 dark:border-gray-800">
                                    <ShoppingCart className="w-4 h-4 text-primary-500" />
                                    <Heading level="h5">{t('purchases.report', { defaultValue: 'Purchase report' })}</Heading>
                                </div>
                                <div className="p-4 space-y-2 min-h-[120px]">
                                    {/* Auto class-fee line (read-only, first line of the order) */}
                                    {classFee && (
                                        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-50/40 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-800">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <GraduationCap className="w-4 h-4 text-primary-500 shrink-0" />
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{classFee.name}</div>
                                                    <div className="font-mono text-xs font-black text-primary-600 dark:text-primary-400">{classFee.total.toLocaleString()} ฿</div>
                                                </div>
                                            </div>
                                            <span className={cn('text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded shrink-0',
                                                classFee.paid ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400')}>
                                                {classFee.paid ? t('purchases.paid', { defaultValue: 'Paid' }) : t('purchases.toPay', { defaultValue: 'To pay' })}
                                            </span>
                                        </div>
                                    )}
                                    {Object.keys(cart).length === 0 ? (
                                        <SectionTitle className="text-gray-400">{t('purchases.empty', { defaultValue: 'No products yet.' })}</SectionTitle>
                                    ) : Object.entries(cart).map(([sku, qty]) => (
                                        <div key={sku} className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-bold text-gray-900 dark:text-white truncate flex-1">{productBySku[sku]?.item_name || sku}</span>
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => removeItem(sku)} className="size-6 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-red-500"><Minus className="w-3 h-3" /></button>
                                                <span className="text-xs font-mono font-black w-5 text-center">{qty}</span>
                                                <button onClick={() => addItem(sku)} className="size-6 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-primary-500"><Plus className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                                    <div className="flex justify-between items-end">
                                        <SectionTitle className="text-gray-400 mb-0">{t('purchases.productsTotal', { defaultValue: 'Products total' })}</SectionTitle>
                                        <span className="font-mono text-xl font-black text-gray-900 dark:text-white">{cartTotal.toLocaleString()} <span className="text-xs text-gray-400 font-normal">THB</span></span>
                                    </div>
                                    <Button variant="primary" size="md" className="w-full justify-center" startIcon={<Save className="w-4 h-4" />} disabled={saving || Object.keys(cart).length === 0} onClick={handleSave}>
                                        {t('purchases.save', { defaultValue: 'Save & send to manager' })}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageContainer>
    );
};

export default KitchenPurchases;
