import React, { useState, useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { useTranslation } from 'react-i18next';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/ui/button/Button';
import InputField from '../../components/form/input/InputField';
import TextArea from '../../components/form/input/TextArea';
import { Send, Info } from 'lucide-react';
import AdminClassPicker from '../../components/common/AdminClassPicker';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';

const PRICES: Record<string, number> = {
    morning_class: 1400,
    evening_class: 1300
};

const ZONES = ['green', 'pink', 'yellow', 'outside', 'walk-in'];

const AgencyBooking: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation('booking');
    const [loading, setLoading] = useState(false);

    // --- 1. SESSION DATA ---
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [session, setSession] = useState<'morning_class' | 'evening_class'>('morning_class');

    // --- 2. GUEST DATA ---
    const [guest, setGuest] = useState({
        fullName: '',
        email: '',
        phone: '',
        diet: 'diet_regular'
    });

    // --- 3. BOOKING  DETAILS ---
    const [pax, setPax] = useState(1);
    const [amount, setAmount] = useState(1400);

    // --- 4. LOGISTICS ---
    const [hotel, setHotel] = useState('');
    const [zone, setZone] = useState('outside');
    const [pickupTime, setPickupTime] = useState('08:30');
    const [notes, setNotes] = useState('');

    // Auto-calc Price (Net for Agency)
    useEffect(() => {
        const basePrice = PRICES[session] || 1400;
        const commissionRate = user?.agency_commission_rate || 0;
        const gross = basePrice * pax;
        const discount = Math.round((gross * commissionRate) / 100);
        setAmount(gross - discount);
    }, [pax, session, user]);

    // Auto-set Pickup Time
    useEffect(() => {
        if (session === 'morning_class') setPickupTime('08:30');
        if (session === 'evening_class') setPickupTime('16:30');
    }, [session]);

    const handleCreate = async () => {
        if (!guest.fullName) return alert(t('agencyBooking.errorNameRequired'));
        if (!user) return;

        setLoading(true);

        try {
            // 1. CREATE GUEST ACCOUNT (Call Edge Function)
            const { data: uData, error: uError } = await supabase.functions.invoke('create-guest-user', {
                body: {
                    email: guest.email || `agency-guest-${Date.now()}@temp.tak`,
                    full_name: guest.fullName,
                    password: `Partner${Date.now()}!`
                }
            });

            if (uError) throw uError;
            if (uData?.error) throw new Error(uData.error);

            const guestUserId = uData.userId || uData.user?.id;

            // 2. CREATE BOOKING
            const { error: bError } = await supabase.from('bookings').insert({
                user_id: user.id, // Agency is the booker
                guest_user_id: guestUserId, // Created guest account
                guest_name: guest.fullName,
                guest_email: guest.email,
                booking_date: date,
                session_id: session,
                pax_count: pax,
                total_price: amount,
                commission_amount: Math.round(((PRICES[session] * pax) * (user.agency_commission_rate || 0)) / 100),
                applied_commission_rate: user.agency_commission_rate || 0,
                status: 'confirmed',
                payment_status: 'pending_invoice',
                payment_method: 'agency_invoice',
                hotel_name: hotel || 'Pickup Requested',
                pickup_zone: zone,
                pickup_time: pickupTime,
                customer_note: `AGENCY BOOKING: ${notes}`,
                booking_source: 'agency_portal'
            });

            if (bError) throw bError;

            alert(t('agencyBooking.successConfirmed'));
            navigate('/agency-dashboard');

        } catch (e: any) {
            console.error(e);
            alert(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer variant="full">
            <PageMeta
                title={t('meta.agencyTitle')}
                description={t('meta.agencyDesc')}
            />
            <div className="pb-20 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT COL: WHO & WHEN */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="p-8 rounded-[2rem] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-8">
                            <div>
                                <h6 className="text-[10px] uppercase font-black text-brand-600 tracking-widest mb-4">{t('agencyBooking.stepGuest')}</h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField
                                        label={t('agencyBooking.fieldFullName')}
                                        value={guest.fullName}
                                        onChange={e => setGuest({ ...guest, fullName: e.target.value })}
                                        placeholder={t('agencyBooking.placeholderName')}
                                    />
                                    <InputField
                                        label={t('agencyBooking.fieldEmail')}
                                        value={guest.email}
                                        onChange={e => setGuest({ ...guest, email: e.target.value })}
                                        placeholder={t('agencyBooking.placeholderEmail')}
                                    />
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-gray-800" />

                            <div>
                                <h6 className="text-[10px] uppercase font-black text-brand-600 tracking-widest mb-4">{t('agencyBooking.stepClass')}</h6>
                                <AdminClassPicker
                                    date={date}
                                    session={session}
                                    onDateChange={setDate}
                                    onSessionChange={setSession}
                                />
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-6">
                            <h6 className="text-[10px] uppercase font-black text-brand-600 tracking-widest mb-2">{t('agencyBooking.stepPickup')}</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <InputField
                                        label={t('agencyBooking.fieldHotel')}
                                        value={hotel}
                                        onChange={e => setHotel(e.target.value)}
                                        placeholder={t('agencyBooking.placeholderHotel')}
                                    />
                                </div>
                                <InputField
                                    label={t('agencyBooking.fieldPickupTime')}
                                    type="time"
                                    value={pickupTime}
                                    onChange={e => setPickupTime(e.target.value)}
                                />
                                <div>
                                    <label className="text-[10px] uppercase font-black text-gray-500 mb-1.5 block ml-1">{t('agencyBooking.fieldZone')}</label>
                                    <select
                                        value={zone}
                                        onChange={e => setZone(e.target.value)}
                                        className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 text-sm font-bold outline-none focus:border-brand-500 transition-all"
                                    >
                                        {ZONES.map(z => <option key={z} value={z}>{z.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>
                            <TextArea
                                label={t('agencyBooking.fieldNotes')}
                                value={notes}
                                onChange={val => setNotes(val)}
                                rows={3}
                                placeholder={t('agencyBooking.placeholderNotes')}
                            />
                        </div>
                    </div>

                    {/* RIGHT COL: SUMMARY & ACTION */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
                        <div className="p-8 rounded-[2rem] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl space-y-8">
                            <h6 className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{t('agencyBooking.summaryTitle')}</h6>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                                    <span className="text-sm font-black uppercase text-gray-400">{t('agencyBooking.summaryParticipants')}</span>
                                    <div className="flex items-center gap-6">
                                        <button onClick={() => setPax(Math.max(1, pax - 1))} className="size-10 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 flex items-center justify-center font-bold">-</button>
                                        <span className="text-3xl font-black text-gray-900 dark:text-white w-8 text-center">{pax}</span>
                                        <button onClick={() => setPax(pax + 1)} className="size-10 rounded-xl bg-brand-600 text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center font-bold">+</button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-brand-50 dark:bg-brand-500/5 p-6 rounded-3xl border border-brand-100 dark:border-brand-500/20 space-y-2">
                                <div className="flex justify-between items-center text-xs font-bold text-brand-600">
                                    <span>{t('agencyBooking.summaryNetRate')}</span>
                                    <span>{user?.agency_commission_rate}% {t('agencyBooking.summaryDiscount')}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-xs text-gray-400 line-through mb-1">{(PRICES[session] * pax).toLocaleString()} THB</span>
                                    <div className="text-right">
                                        <span className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">{t('agencyBooking.summaryNetPayable')}</span>
                                        <h3 className="text-4xl font-black text-brand-600 dark:text-brand-400 italic">
                                            {amount.toLocaleString()} <span className="text-sm font-normal text-gray-400 not-italic uppercase">THB</span>
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest px-2">
                                <Info className="size-4 text-brand-500 shrink-0" />
                                <span>{t('agencyBooking.invoiceNote')}</span>
                            </div>

                            <Button
                                size="md"
                                onClick={handleCreate}
                                disabled={loading}
                                className="h-16 w-full rounded-2xl text-lg font-black uppercase italic shadow-lg animate-in zoom-in-95 duration-300"
                                startIcon={!loading && <Send className="w-5 h-5" />}
                            >
                                {loading ? t('agencyBooking.btnSyncing') : t('agencyBooking.btnConfirm')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default AgencyBooking;
