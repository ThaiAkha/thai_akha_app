import React from 'react';
import { useNavigate } from 'react-router';
import Button from '../../components/ui/button/Button';
import { cn } from '@thaiakha/shared/lib/utils';
import {
    CheckCircle2,
    Bus, Truck, Home
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import AdminClassPicker from '../../components/common/AdminClassPicker';
import TransportStopCard from '../../components/driver/TransportStopCard';
import { Heading, Paragraph } from '../../components/typography';
import { useDriverRoute } from './driverRoute/useDriverRoute';
import { useTranslation } from 'react-i18next';

// --- TYPES ---
const DriverRoute: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('driver');
    usePageMetadata('driver');
    // Stato e logica in ./driverRoute/useDriverRoute (#16 split monstre): qui solo il render.
    const route = useDriverRoute();
    const { confirmId, phase, setPhase, showPayoutModal, setShowPayoutModal, payoutAmount, startRouteClicks, activeDate, setActiveDate, sessionFilter, setSessionFilter, STATUS_CONFIG, visibleStops, completedPax, totalPax, isRouteStarted, firstIncompleteIndex, handleClickAction, handleStartRoute } = route;

    // 9. UTILS
    const openMap = (hotel: string) =>
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel + " Chiang Mai")}`, '_blank');

    const handleWhatsApp = (phone: string) =>
        window.open(`https://wa.me/${phone?.replace(/[^0-9]/g, '')}?text=Sawasdee%20kha%20Driver%20is%20at%20lobby`, '_blank');

    return (
        <PageContainer variant="narrow" className="h-[calc(100vh-64px)] flex flex-col bg-gray-50 dark:bg-black p-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32">

                {/* --- DATE & SESSION PICKER --- */}
                <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 space-y-4">
                    <AdminClassPicker
                        date={activeDate}
                        session={sessionFilter}
                        onDateChange={setActiveDate}
                        onSessionChange={setSessionFilter}
                    />

                    {/* Phase Selector & Pax Counter */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10">
                            <button
                                onClick={() => setPhase('PICKUP')}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                    phase === 'PICKUP'
                                        ? "bg-primary-600 text-white shadow-lg"
                                        : "text-sub dark:text-white/40 hover:text-white/60"
                                )}
                            >
                                <Truck className="w-3.5 h-3.5" /> {t('phase.pickup')}
                            </button>
                            <button
                                onClick={() => setPhase('DROPOFF')}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                    phase === 'DROPOFF'
                                        ? "bg-green-600 text-white shadow-lg"
                                        : "text-sub dark:text-white/40 hover:text-white/60"
                                )}
                            >
                                <Home className="w-3.5 h-3.5" /> {t('phase.dropoff')}
                            </button>
                        </div>

                        <div className="bg-primary-50 dark:bg-primary-500/10 px-4 py-2 rounded-xl border border-primary-100 dark:border-primary-500/20 flex items-center gap-3">
                            <span className="text-xl font-mono font-black text-primary-600 dark:text-primary-400 leading-none">{completedPax}</span>
                            <span className="text-xs font-bold text-primary-400 dark:text-white/40 uppercase tracking-widest">/ {totalPax} {t('stopCard.pax')}</span>
                        </div>
                    </div>
                </div>

                <div className="px-4 space-y-6">
                    {/* Start Route Button */}
                    {!isRouteStarted && visibleStops.length > 0 && (
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleStartRoute}
                            className={cn(
                                "w-full h-16 text-lg font-black transition-all",
                                phase === 'PICKUP'
                                    ? startRouteClicks === 0
                                        ? "shadow-[0_0_40px_rgba(227,31,51,0.4)] animate-pulse bg-primary-600 hover:bg-primary-700 text-white"
                                        : "bg-red-500 text-white animate-pulse shadow-[0_0_60px_rgba(239,68,68,0.6)]"
                                    : startRouteClicks === 0
                                        ? "shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-pulse bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-red-500 text-white animate-pulse shadow-[0_0_60px_rgba(239,68,68,0.6)]"
                            )}
                        >
                            {phase === 'PICKUP'
                                ? <><Bus className="w-5 h-5 mr-2" />{startRouteClicks === 0 ? t('phase.startPickupRoute') : t('actions.clickAgainToConfirm')}</>
                                : <><Home className="w-5 h-5 mr-2" />{startRouteClicks === 0 ? t('phase.startDropoffRoute') : t('actions.clickAgainToConfirm')}</>
                            }
                        </Button>
                    )}

                    {visibleStops.map((stop, index) => (
                        <TransportStopCard
                            key={stop.internal_id}
                            stop={stop}
                            phase={phase}
                            displayHotel={phase === 'DROPOFF' ? (stop.dropoff_hotel || stop.hotel_name) : stop.hotel_name}
                            isOnBoard={stop.transport_status === 'on_board'}
                            isActiveStep={index === firstIncompleteIndex && isRouteStarted}
                            isConfirming={confirmId === stop.internal_id}
                            statusCfg={STATUS_CONFIG[stop.transport_status]}
                            onAction={handleClickAction}
                            onOpenMap={openMap}
                            onWhatsApp={handleWhatsApp}
                        />
                    ))}
                </div>
            </div>

            {/* --- PAYOUT MODAL --- */}
            {showPayoutModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-white/10">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>
                            <Heading level="h3" className="font-black tracking-normal leading-8">
                                {t('payout.allRidesCompleted')}
                            </Heading>
                            <div className="bg-primary-50 dark:bg-primary-500/10 p-6 rounded-xl border border-primary-100 dark:border-primary-500/20">
                                <Paragraph size="sm" color="secondary" className="mb-2 leading-5">{t('payout.dailyEarnings')}</Paragraph>
                                <Heading level="h2" color="brand" className="text-4xl font-black tracking-normal leading-10">
                                    {payoutAmount || 0} <span className="text-2xl">THB</span>
                                </Heading>
                            </div>
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setShowPayoutModal(false);
                                    navigate('/driver');
                                }}
                                className="w-full h-12 text-lg font-bold"
                            >
                                {t('payout.returnToHome')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </PageContainer>
    );
};

export default DriverRoute;
