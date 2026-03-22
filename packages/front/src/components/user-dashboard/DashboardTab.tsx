import React from 'react';
import { Card, Button, Icon, Badge } from '../ui';
import { UserProfile } from '../../services/auth.service';
import { cn } from '@thaiakha/shared/lib/utils';

interface DashboardTabProps {
  userProfile: UserProfile | null;
  bookings: any[];
  activeId: string | null;
  routeStops: any[];
  onSelectBooking: (id: string) => void;
  menuStatus: boolean;
  onNavigate: (page: string) => void;
  onChangeTab: (tab: string) => void;
  onOpenSettings: () => void;
  onShowCertificate?: () => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  userProfile,
  bookings,
  activeId,
  routeStops,
  onSelectBooking,
  menuStatus,
  onNavigate,
  onChangeTab,
  onOpenSettings,
  onShowCertificate,
}) => {
  const activeBooking = bookings.find(b => b.internal_id === activeId) || bookings[0];

  if (!activeBooking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border border-dashed rounded-3xl text-center">
        <Icon name="event_busy" size="2xl" className="text-gray-500 dark:text-gray-500 mb-4" />
        <p className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">No Active Booking</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">Book a cooking class to manage your reservation here.</p>
        <Button variant="brand" size="lg" onClick={() => onNavigate('booking')}>
          <Icon name="calendar_add_on" />
          Book a Class
        </Button>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(activeBooking.booking_date);
  const isPast = bookingDate < today;

  const hasHotel = activeBooking.hotel_name && activeBooking.hotel_name !== 'To be selected';
  const hotelPending = !hasHotel && !isPast;
  const isMorning = activeBooking.session_id?.includes('morning');
  const isWalkIn = activeBooking.pickup_zone === 'walk-in';
  const bookingRef = activeBooking.internal_id?.slice(0, 6).toUpperCase() ?? 'REF';
  const transportStatus = activeBooking.transport_status || 'waiting';

  /* ── UNIFIED TIMELINE ── */
  const renderTimeline = () => {
    if (isPast) return (
      <div className="mt-6 p-6 bg-surface rounded-2xl border border-border text-center">
        <Icon name="verified" className="text-gray-500 dark:text-gray-500 mb-2" size="lg" />
        <p className="font-bold text-gray-500 dark:text-gray-500">Journey Completed</p>
      </div>
    );

    const showFullRoute = routeStops && routeStops.length > 1 && !isWalkIn;

    return (
      <div className="relative pl-4 ml-2 space-y-6 border-l-2 border-dashed border-border mt-6">

        {/* STEP 1 — Driver started */}
        <div className={cn("relative pl-8 transition-opacity duration-500", transportStatus === 'waiting' ? "opacity-40" : "opacity-100")}>
          <div className={cn(
            "absolute -left-[9px] top-1 size-4 rounded-full border-2 transition-colors",
            transportStatus !== 'waiting'
              ? "bg-action border-action"
              : "bg-surface border-border"
          )} />
          <div className="flex items-center gap-3">
            <Icon name="local_shipping" size="sm" className={transportStatus !== 'waiting' ? "text-action" : "text-gray-500 dark:text-gray-500"} />
            <span className="font-bold text-sm text-gray-600 dark:text-gray-400">Driver Started Route</span>
          </div>
        </div>

        {/* STEP 2 — Stops */}
        {showFullRoute && routeStops.map((stop) => {
          const isMe = stop.internal_id === activeBooking.internal_id;

          let rowClass = "border-border bg-surface text-gray-500 dark:text-gray-500";
          let iconName = "radio_button_unchecked";
          let stopLabel = "Waiting";

          if (stop.transport_status === 'dropped_off' || stop.transport_status === 'on_board') {
            rowClass = "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400";
            iconName = "check_circle";
            stopLabel = "Picked Up";
          } else if (stop.transport_status === 'driver_arrived') {
            rowClass = "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 animate-pulse";
            iconName = "local_taxi";
            stopLabel = "Driver Here!";
          } else if (stop.transport_status === 'driver_en_route') {
            rowClass = "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400 animate-pulse";
            iconName = "directions_car";
            stopLabel = "En Route";
          }

          if (isMe) {
            return (
              <div key={stop.internal_id} className="relative pl-8">
                <div className={cn(
                  "absolute -left-[11px] top-5 size-5 rounded-full border-4 transition-all duration-500 z-10",
                  stop.transport_status === 'driver_en_route'  ? "bg-blue-500 border-blue-500 animate-pulse" :
                  stop.transport_status === 'driver_arrived'   ? "bg-yellow-500 border-yellow-500 animate-bounce" :
                  (stop.transport_status === 'on_board' || stop.transport_status === 'dropped_off')
                    ? "bg-green-500 border-green-500"
                    : "bg-surface border-border"
                )} />

                <div className={cn(
                  "p-5 rounded-2xl border relative overflow-hidden transition-all duration-500",
                  stop.transport_status === 'driver_arrived' ? "bg-yellow-500/10 border-yellow-500/50" :
                  stop.transport_status === 'driver_en_route' ? "bg-blue-500/10 border-blue-500/50" :
                  "bg-surface border-border"
                )}>
                  {stop.transport_status === 'driver_arrived' && (
                    <div className="absolute inset-0 bg-yellow-500/5 animate-pulse pointer-events-none" />
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-xl font-black text-gray-900 dark:text-gray-100">
                          {stop.pickup_time?.slice(0, 5)}
                        </span>
                        {transportStatus !== 'waiting' && (
                          <Badge variant="mineral" className="text-[9px] h-5 px-2 bg-black/5 dark:bg-white/10">LIVE</Badge>
                        )}
                      </div>
                      <p className={cn(
                        "font-bold text-base leading-tight mb-1",
                        stop.transport_status === 'driver_arrived' ? "text-yellow-600 dark:text-yellow-400" :
                        stop.transport_status === 'driver_en_route' ? "text-blue-600 dark:text-blue-400" :
                        "text-gray-900 dark:text-gray-100"
                      )}>
                        {stop.transport_status === 'driver_arrived' ? "Driver is Waiting for YOU!" :
                         stop.transport_status === 'driver_en_route' ? "Driver is on the way!" :
                         stop.transport_status === 'on_board' ? "You are On Board" : "Your Pickup"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{stop.hotel_name || "Location not set"}</p>
                    </div>
                    {hasHotel && !isWalkIn && transportStatus === 'waiting' && (
                      <Button variant="mineral" size="sm" onClick={() => { localStorage.setItem('current_booking_id', activeBooking.internal_id); onNavigate('location'); }}>
                        Check / Modify
                      </Button>
                    )}
                    {!hasHotel && (
                      <Button variant="brand" size="sm" icon="add_location" onClick={() => { localStorage.setItem('current_booking_id', activeBooking.internal_id); onNavigate('location'); }}>
                        Set Location
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={stop.internal_id} className="relative pl-8">
              <div className={cn(
                "absolute -left-[9px] top-3 size-4 rounded-full border-2",
                (stop.transport_status === 'on_board' || stop.transport_status === 'dropped_off')
                  ? "bg-green-500 border-green-500"
                  : "bg-surface border-border"
              )} />
              <div className={cn("flex items-center justify-between p-3 rounded-xl border text-xs", rowClass)}>
                <div className="flex items-center gap-2">
                  <Icon name={iconName} size="sm" />
                  <span className="font-bold uppercase">{stopLabel}</span>
                </div>
                <span className="font-mono opacity-60">{stop.pickup_time?.slice(0, 5)}</span>
              </div>
            </div>
          );
        })}

        {/* Fallback — single stop or walk-in */}
        {(!showFullRoute || isWalkIn) && (
          <div className="relative pl-8">
            <div className={cn(
              "absolute -left-[11px] top-5 size-5 rounded-full border-4",
              hasHotel ? "bg-surface border-border" : "bg-sys-notice border-sys-notice animate-pulse"
            )} />
            <div className="p-5 rounded-2xl border bg-surface border-border">
              <p className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                {isWalkIn ? "Meeting at School" : "Your Pickup"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {activeBooking.hotel_name || (isWalkIn ? "Thai Akha Kitchen" : "Location not set")}
              </p>
              {isWalkIn && (
                <p className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                  Self Transport
                </p>
              )}
              {!hasHotel && !isWalkIn && (
                <Button variant="brand" size="sm" className="mt-4" icon="add_location" onClick={() => { localStorage.setItem('current_booking_id', activeBooking.internal_id); onNavigate('location'); }}>
                  Set Location
                </Button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 — Arrival */}
        <div className={cn("relative pl-8 transition-opacity duration-500", (transportStatus === 'dropped_off' || isPast) ? "opacity-100" : "opacity-30")}>
          <div className={cn(
            "absolute -left-[9px] top-1 size-4 rounded-full border-2",
            (transportStatus === 'dropped_off' || isPast) ? "bg-action border-action" : "bg-surface border-border"
          )} />
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-500 bg-surface border border-border px-2 py-1 rounded">
              Finish
            </span>
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Thai Akha Kitchen</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── BOOKING SELECTOR (horizontal chips, only when multiple bookings) ── */}
      {bookings.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {bookings.map((b) => {
            const d = new Date(b.booking_date);
            const isSelected = activeBooking.internal_id === b.internal_id;
            const isItemPast = d < today;
            return (
              <button
                key={b.internal_id}
                onClick={() => onSelectBooking(b.internal_id)}
                className={cn(
                  "shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all",
                  isSelected
                    ? "bg-primary/10 border-primary/50"
                    : "bg-surface border-border hover:bg-black/5 dark:hover:bg-white/5",
                  isItemPast && !isSelected && "opacity-50"
                )}
              >
                <div className={cn(
                  "size-7 rounded-lg flex items-center justify-center shrink-0 font-black text-sm",
                  isSelected ? "bg-primary text-white" : "bg-black/5 dark:bg-white/5 text-gray-900 dark:text-gray-100"
                )}>
                  {d.getDate()}
                </div>
                <div className="text-left">
                  <p className={cn("text-xs font-bold whitespace-nowrap", isSelected ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400")}>
                    {b.session_id.includes('morning') ? 'Morning Class' : 'Evening Feast'}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-500 font-mono whitespace-nowrap">
                    {d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── MISSION CONTROL CARD (full width) ── */}
      <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">

        {/* Header */}
        <div className={cn(
          "p-6 md:p-8 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
          hotelPending ? "bg-sys-notice/5" : "bg-black/[0.02] dark:bg-white/[0.03]"
        )}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge
                variant="solid"
                className={cn(
                  "text-white",
                  isPast        ? "bg-black/20 dark:bg-white/15 !text-gray-500 dark:text-gray-500" :
                  hasHotel      ? "bg-action border-action" :
                                  "bg-sys-notice border-sys-notice"
                )}
              >
                {isPast ? 'COMPLETED' : (hasHotel ? 'CONFIRMED' : 'ACTION REQUIRED')}
              </Badge>
              <span className="font-mono text-[10px] text-gray-500 dark:text-gray-500 tracking-widest">#{bookingRef}</span>
            </div>
            <p className="font-display font-bold text-2xl text-gray-900 dark:text-gray-100 italic leading-none">
              {isMorning ? "Morning Market Tour" : "Evening Sunset Feast"}
            </p>
            {hotelPending && (
              <div className="flex items-center gap-1.5 mt-2 text-amber-800 dark:text-yellow-400 text-xs font-semibold">
                <Icon name="warning" size="sm" />
                Pickup location not set — please add your hotel
              </div>
            )}
          </div>
        </div>

        {/* Timeline body */}
        <div className="p-6 md:p-8">
          <p className="text-gray-500 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">
            {isPast ? "Journey Log" : "Live Logistics"}
          </p>
          {renderTimeline()}
        </div>

        {/* Footer Actions — 4-col grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-border">

          {/* Menu */}
          <button
            onClick={() => onChangeTab('menu')}
            className={cn(
              "group relative p-4 h-20 flex flex-col items-center justify-center gap-1.5 transition-all border-r border-border",
              "hover:bg-black/5 dark:hover:bg-white/5",
              !menuStatus && "bg-primary/5"
            )}
          >
            <div className={cn(
              "size-9 rounded-full flex items-center justify-center transition-all group-hover:scale-110",
              menuStatus
                ? "bg-black/5 dark:bg-white/10 text-gray-900 dark:text-gray-100"
                : "bg-primary text-white shadow-sm animate-pulse"
            )}>
              <Icon name="restaurant_menu" size="sm" />
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-wider",
              menuStatus ? "text-gray-600 dark:text-gray-400" : "text-primary"
            )}>
              {menuStatus ? "My Menu" : "Select Menu"}
            </span>
          </button>

          {/* Pickup */}
          {!isPast ? (
            <button
              onClick={() => { localStorage.setItem('current_booking_id', activeBooking.internal_id); onNavigate('location'); }}
              className="group p-4 h-20 flex flex-col items-center justify-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-all border-r border-border"
            >
              <div className={cn(
                "size-9 rounded-full flex items-center justify-center transition-all group-hover:scale-110",
                hasHotel
                  ? "bg-black/5 dark:bg-white/10 text-gray-900 dark:text-gray-100"
                  : "bg-sys-notice text-white shadow-sm animate-pulse"
              )}>
                <Icon name="local_taxi" size="sm" />
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-wider",
                hasHotel ? "text-gray-600 dark:text-gray-400" : "text-sys-notice"
              )}>
                {hasHotel ? "Pickup" : "Add Pickup"}
              </span>
            </button>
          ) : (
            <div className="p-4 h-20 flex flex-col items-center justify-center gap-1.5 opacity-30 border-r border-border">
              <Icon name="local_taxi" size="sm" className="text-gray-500 dark:text-gray-500" />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-500">Transport</span>
            </div>
          )}

          {/* Certificate */}
          <button
            onClick={() => onShowCertificate?.()}
            className="group p-4 h-20 flex flex-col items-center justify-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-all border-r border-border"
          >
            <div className="size-9 rounded-full border border-border text-gray-900 dark:text-gray-100 flex items-center justify-center transition-all group-hover:border-quiz-p group-hover:text-quiz-p group-hover:scale-110">
              <Icon name="workspace_premium" size="sm" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-400 group-hover:text-quiz-p">
              Certificate
            </span>
          </button>

          {/* Modify / Completed */}
          {!isPast ? (
            <button
              onClick={() => onNavigate('booking')}
              className="group p-4 h-20 flex flex-col items-center justify-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              <div className="size-9 rounded-full border border-border text-gray-900 dark:text-gray-100 flex items-center justify-center transition-all group-hover:border-title group-hover:scale-110">
                <Icon name="edit_calendar" size="sm" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">Modify</span>
            </button>
          ) : (
            <div className="p-4 h-20 flex flex-col items-center justify-center gap-1.5 opacity-30">
              <Icon name="check_circle" size="sm" className="text-action" />
              <span className="text-[10px] font-black uppercase tracking-wider text-action">Done</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
