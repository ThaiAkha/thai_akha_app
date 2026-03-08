import React from 'react';
import { CheckCircle2, Map, MessageSquare, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import Badge from '../ui/badge/Badge';
import Avatar from '../ui/avatar/Avatar';

export type TransportStatus = 'waiting' | 'driver_en_route' | 'driver_arrived' | 'on_board' | 'dropped_off';

export interface Stop {
    internal_id: string;
    status: string;
    pax_count: number;
    hotel_name: string;
    pickup_zone: string;
    pickup_time: string;
    phone_number: string;
    customer_note?: string;
    session_id: string;
    route_order: number;
    pickup_driver_uid: string | null;
    transport_status: TransportStatus;
    dropoff_hotel?: string;
    requires_dropoff?: boolean;
    guest_name: string;
    avatar_url?: string;
}

interface TransportStopCardProps {
    stop: Stop;
    phase: 'PICKUP' | 'DROPOFF';
    displayHotel: string;
    isOnBoard: boolean;
    isActiveStep: boolean;
    isConfirming: boolean;
    statusCfg: {
        label: string;
        actionLabel: string;
        color: string;
        next: TransportStatus | null;
    };
    onAction: (stop: Stop) => void;
    onOpenMap: (hotel: string) => void;
    onWhatsApp: (phone: string) => void;
}

const TransportStopCard: React.FC<TransportStopCardProps> = ({
    stop,
    phase,
    displayHotel,
    isOnBoard,
    isActiveStep,
    isConfirming,
    statusCfg,
    onAction,
    onOpenMap,
    onWhatsApp
}) => {
    const isDone = stop.transport_status === 'dropped_off';

    // Compact card for completed stops
    if (isDone) {
        return (
            <div className="flex items-center justify-between p-3 bg-white/5 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl opacity-60">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div>
                        <div className="text-gray-700 dark:text-white/80 font-semibold text-sm line-through decoration-gray-400 dark:decoration-white/30">{stop.guest_name}</div>
                        <div className="text-[9px] text-gray-500 dark:text-white/40 uppercase">{displayHotel || stop.hotel_name}</div>
                    </div>
                </div>
                <div className="text-gray-700 dark:text-white/60 text-lg font-black">{stop.pax_count} Pax</div>
            </div>
        );
    }

    return (
        <div className={cn(
            "relative rounded-[2rem] border overflow-hidden transition-all duration-500",
            isOnBoard ? "bg-green-50 dark:bg-green-900/10 border-green-400 dark:border-green-500/30 shadow-lg" :
                isActiveStep ? "bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-white/10 shadow-2xl" :
                    "bg-gray-100 dark:bg-black/40 border-gray-300 dark:border-white/5 opacity-60"
        )}>
            <div className={cn(
                "flex justify-between items-stretch border-b",
                isOnBoard ? "bg-green-100 dark:bg-green-500/10 border-green-300 dark:border-green-500/20" : "bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/5"
            )}>
                <div className="px-5 py-4 flex items-center gap-3">
                    <span className="font-mono text-2xl font-black tracking-tighter text-gray-900 dark:text-white">{stop.pickup_time?.slice(0, 5)}</span>
                    <Badge variant="light" color="light" className="text-[9px] px-2 h-5 bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-white/60">{stop.pickup_zone?.toUpperCase()}</Badge>
                </div>
                <div className="px-5 flex items-center justify-center bg-gray-200 dark:bg-black/20 border-l border-gray-300 dark:border-white/5 min-w-[5rem]">
                    <span className={cn("text-3xl font-black", isOnBoard ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white")}>{stop.pax_count} <span className="text-base">Pax</span></span>
                </div>
            </div>

            <div className="p-5 space-y-5">
                <div className="flex items-center gap-4">
                    <Avatar src={stop.avatar_url} alt={stop.guest_name} size="medium" />
                    <div className="min-w-0">
                        <h5 className="truncate leading-none mb-1 text-lg font-bold text-gray-900 dark:text-white">{stop.guest_name}</h5>
                        {stop.customer_note
                            ? <p className="text-[10px] text-yellow-600 dark:text-yellow-500 italic truncate font-bold">⚠️ "{stop.customer_note}"</p>
                            : <p className="text-[10px] text-gray-400 dark:text-white/30 font-bold uppercase">No Notes</p>
                        }
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => onOpenMap(displayHotel)} className="flex-1 flex items-center gap-3 p-4 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-black/40 hover:bg-gray-200 dark:hover:bg-white/5 transition-all text-left group">
                        <Map className="w-5 h-5 text-brand-500 dark:text-brand-400 shrink-0 group-hover:scale-110 transition-transform" />
                        <div className="min-w-0">
                            <span className="text-sm font-bold truncate text-gray-900 dark:text-white/90 block">{displayHotel}</span>
                            {phase === 'DROPOFF' && stop.dropoff_hotel && (
                                <span className="text-[9px] text-green-600 dark:text-green-400 uppercase font-bold">Destination</span>
                            )}
                        </div>
                    </button>
                    <button onClick={() => onWhatsApp(stop.phone_number)} className="size-14 rounded-xl bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-500/30 flex items-center justify-center text-green-600 dark:text-green-500 hover:bg-green-200 dark:hover:bg-green-900/40 transition-all">
                        <MessageSquare className="w-6 h-6" />
                    </button>
                </div>

                {isActiveStep && stop.transport_status !== 'waiting' && (
                    <button
                        onClick={() => onAction(stop)}
                        className={cn(
                            "w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-sm transition-all shadow-lg active:scale-95",
                            isConfirming
                                ? "bg-red-500 text-white border-red-400 animate-pulse"
                                : statusCfg.color
                        )}
                    >
                        {isConfirming
                            ? <>CONFIRM ACTION?</>
                            : <>{statusCfg.actionLabel} {isOnBoard ? <CheckCircle2 className="w-5 h-5 animate-bounce" /> : <ArrowRight className="w-5 h-5 animate-bounce" />}</>
                        }
                    </button>
                )}
            </div>
        </div>
    );
};

export default TransportStopCard;
