import React from 'react';
import { Button, Icon, Badge, Typography } from '../ui';
import { UserProfile } from '../../services/auth.service';
import { useActiveProfile } from '../../context/ActiveProfileContext';
import { cn } from '@thaiakha/shared/lib/utils';
import type { UserDashboardBooking, PickupRouteStop } from '@thaiakha/shared/types';

interface DashboardTabProps {
  userProfile: UserProfile | null;
  bookings: UserDashboardBooking[];
  activeId: string | null;
  routeStops: PickupRouteStop[];
  onSelectBooking: (id: string) => void;
  menuStatus: boolean;
  onNavigate: (page: string) => void;
  onChangeTab: (tab: string) => void;
  onOpenSettings: () => void;
  onShowCertificate?: () => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  bookings,
  activeId,
  routeStops,
  onSelectBooking,
  menuStatus,
  onNavigate,
  onChangeTab,
  onShowCertificate,
}) => {
  const { isActiveVisitor } = useActiveProfile();
  const activeBooking = bookings.find(b => b.internal_id === activeId) || bookings[0];

  if (!activeBooking) {
    return (
      <div className="flex flex-col items-center justify-center [padding-vertical:var(--space-fluid-3xl)] bg-surface border border-border border-dashed rounded-3xl text-center">
        <Icon name="event_busy" size="2xl" color="muted" className="mb-4" />
        <Typography variant="h4" color="title" className="mb-2">No Active Booking</Typography>
        <Typography variant="paragraphS" color="sub" className="mb-6">Book a cooking class to manage your reservation here.</Typography>
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
      <div className="mt-6 [padding:var(--space-fluid-m)] bg-surface rounded-2xl border border-border text-center">
        <Icon name="verified" color="muted" className="mb-2" size="lg" />
        <Typography variant="body" color="muted" className="font-bold">Journey Completed</Typography>
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
            <Icon name="local_shipping" size="sm" className={transportStatus !== 'waiting' ? "text-action" : "text-muted"} />
            <Typography variant="paragraphS" color="sub" className="font-bold">Driver Started Route</Typography>
          </div>
        </div>

        {/* STEP 2 — Stops */}
        {showFullRoute && routeStops.map((stop) => {
          const isMe = stop.internal_id === activeBooking.internal_id;

          let rowClass = "border-border bg-surface text-muted";
          let iconName = "radio_button_unchecked";
          let stopLabel = "Waiting";

          if (stop.transport_status === 'dropped_off' || stop.transport_status === 'on_board') {
            rowClass = "border-action/30 bg-action/5 text-action";
            iconName = "check_circle";
            stopLabel = "Picked Up";
          } else if (stop.transport_status === 'driver_arrived') {
            rowClass = "border-sys-notice/50 bg-sys-notice/10 text-sys-notice animate-pulse";
            iconName = "local_taxi";
            stopLabel = "Driver Here!";
          } else if (stop.transport_status === 'driver_en_route') {
            rowClass = "border-secondary/50 bg-secondary/10 text-secondary animate-pulse";
            iconName = "directions_car";
            stopLabel = "En Route";
          }

          if (isMe) {
            return (
              <div key={stop.internal_id} className="relative pl-8">
                <div className={cn(
                  "absolute -left-[11px] top-5 size-5 rounded-full border-4 transition-all duration-500 z-10",
                  stop.transport_status === 'driver_en_route'  ? "bg-secondary border-secondary animate-pulse" :
                  stop.transport_status === 'driver_arrived'   ? "bg-sys-notice border-sys-notice animate-bounce" :
                  (stop.transport_status === 'on_board' || stop.transport_status === 'dropped_off')
                    ? "bg-action border-action"
                    : "bg-surface border-border"
                )} />

                <div className={cn(
                  "p-5 rounded-2xl border relative overflow-hidden transition-all duration-500",
                  stop.transport_status === 'driver_arrived' ? "bg-sys-notice/10 border-sys-notice/50" :
                  stop.transport_status === 'driver_en_route' ? "bg-secondary/10 border-secondary/50" :
                  "bg-surface border-border"
                )}>
                  {stop.transport_status === 'driver_arrived' && (
                    <div className="absolute inset-0 bg-sys-notice/5 animate-pulse pointer-events-none" />
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <Typography variant="numericRegular" color="title" className="text-xl font-black">
                          {stop.pickup_time?.slice(0, 5)}
                        </Typography>
                        {transportStatus !== 'waiting' && (
                          <Badge variant="mineral-accent">LIVE</Badge>
                        )}
                      </div>
                      <Typography variant="body" className={cn(
                        "font-bold leading-tight mb-1",
                        stop.transport_status === 'driver_arrived' ? "text-sys-notice" :
                        stop.transport_status === 'driver_en_route' ? "text-secondary font-display" :
                        "text-title"
                      )}>
                        {stop.transport_status === 'driver_arrived' ? "Driver is Waiting for YOU!" :
                         stop.transport_status === 'driver_en_route' ? "Driver is on the way!" :
                         stop.transport_status === 'on_board' ? "You are On Board" : "Your Pickup"}
                      </Typography>
                      <Typography variant="caption" color="muted">{stop.hotel_name || "Location not set"}</Typography>
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
                  ? "bg-action border-action"
                  : "bg-surface border-border"
              )} />
              <div className={cn("flex items-center justify-between p-3 rounded-xl border", rowClass)}>
                <div className="flex items-center gap-2">
                  <Icon name={iconName} size="sm" />
                  <Typography variant="microLabel" color="inherit" className="font-bold">{stopLabel}</Typography>
                </div>
                <Typography variant="numericRegular" color="inherit" className="opacity-60">{stop.pickup_time?.slice(0, 5)}</Typography>
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
              <Typography variant="body" color="title" className="font-bold mb-1">
                {isWalkIn ? "Meeting at School" : "Your Pickup"}
              </Typography>
              <Typography variant="caption" color="muted">
                {activeBooking.hotel_name || (isWalkIn ? "Thai Akha Kitchen" : "Location not set")}
              </Typography>
              {isWalkIn && (
                <Typography variant="microLabel" color="secondary" className="mt-3 block font-bold">
                  Self Transport
                </Typography>
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
            <Typography variant="numericRegular" color="muted" className="bg-surface border border-border px-2 py-1 rounded text-xs font-bold">
              Finish
            </Typography>
            <Typography variant="paragraphS" color="sub" className="font-bold">Thai Akha Kitchen</Typography>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="[space-y:var(--space-fluid-s)] animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── BOOKING SELECTOR (horizontal chips, only when multiple bookings) ── */}
      {bookings.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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
                    : "bg-surface border-border hover:bg-surface-2",
                  isItemPast && !isSelected && "opacity-50"
                )}
              >
                <div className={cn(
                  "size-8 rounded-lg flex items-center justify-center shrink-0 font-black",
                  isSelected ? "bg-primary text-white" : "bg-surface-2 text-title"
                )}>
                  <Typography variant="numericRegular" color="inherit">{d.getDate()}</Typography>
                </div>
                <div className="text-left">
                  <Typography variant="paragraphS" className={cn("font-bold whitespace-nowrap", isSelected ? "text-title" : "text-sub")}>
                    {b.session_id ? (b.session_id.includes('morning') ? 'Morning Class' : 'Evening Feast') : '-'}
                  </Typography>
                  <Typography variant="numericRegular" color="muted" className="text-[10px] whitespace-nowrap">
                    {d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </Typography>
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
          hotelPending ? "bg-sys-notice/5" : "bg-surface-2/30"
        )}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge
                variant="solid"
                className={cn(
                  "text-white",
                  isPast        ? "bg-muted/20 !text-muted border-transparent" :
                  hasHotel      ? "bg-action border-action" :
                                  "bg-sys-notice border-sys-notice"
                )}
              >
                {isPast ? 'COMPLETED' : (hasHotel ? 'CONFIRMED' : 'ACTION REQUIRED')}
              </Badge>
              <Typography variant="numericRegular" color="muted" className="text-[10px] tracking-widest">#{bookingRef}</Typography>
            </div>
            <Typography variant="h2" color="title" className="italic leading-none">
              {isMorning ? "Morning Market Tour" : "Evening Sunset Feast"}
            </Typography>
            {hotelPending && (
              <div className="flex items-center gap-1.5 mt-2 text-sys-notice text-xs font-semibold">
                <Icon name="warning" size="sm" />
                Pickup location not set — please add your hotel
              </div>
            )}
          </div>
        </div>

        {/* Timeline body */}
        <div className="p-6 md:p-8">
          <Typography variant="microLabel" color="muted">
            {isPast ? "Journey Log" : "Live Logistics"}
          </Typography>
          {renderTimeline()}
        </div>

        {/* Footer Actions — 4-col grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-border">

          {/* Menu */}
          <button
            onClick={() => onChangeTab('menu')}
            className={cn(
              "group relative p-4 h-24 flex flex-col items-center justify-center gap-1.5 transition-all border-r border-border",
              "hover:bg-surface-2",
              !menuStatus && "bg-primary/5"
            )}
          >
            <div className={cn(
              "size-10 rounded-full flex items-center justify-center transition-all group-hover:scale-110",
              menuStatus
                ? "bg-surface-2 text-title border border-border"
                : "bg-primary text-white shadow-sm animate-pulse"
            )}>
              <Icon name="restaurant_menu" size="sm" />
            </div>
            <Typography variant="microLabel" className={cn(
              "font-black uppercase tracking-wider",
              menuStatus ? "text-sub" : "text-primary"
            )}>
              {menuStatus ? "My Menu" : "Select Menu"}
            </Typography>
          </button>

          {/* Pickup */}
          {!isPast ? (
            <button
              onClick={() => { localStorage.setItem('current_booking_id', activeBooking.internal_id); onNavigate('location'); }}
              className="group p-4 h-24 flex flex-col items-center justify-center gap-1.5 hover:bg-surface-2 transition-all border-r border-border"
            >
              <div className={cn(
                "size-10 rounded-full flex items-center justify-center transition-all group-hover:scale-110",
                hasHotel
                  ? "bg-surface-2 text-title border border-border"
                  : "bg-sys-notice text-white shadow-sm animate-pulse"
              )}>
                <Icon name="local_taxi" size="sm" />
              </div>
              <Typography variant="microLabel" className={cn(
                "font-black uppercase tracking-wider",
                hasHotel ? "text-sub" : "text-sys-notice"
              )}>
                {hasHotel ? "Pickup" : "Add Pickup"}
              </Typography>
            </button>
          ) : (
            <div className="p-4 h-24 flex flex-col items-center justify-center gap-1.5 opacity-30 border-r border-border">
              <Icon name="local_taxi" size="sm" color="muted" />
              <Typography variant="microLabel" color="muted">Transport</Typography>
            </div>
          )}

          {/* Certificate */}
          <button
            onClick={() => onShowCertificate?.()}
            className="group p-4 h-24 flex flex-col items-center justify-center gap-1.5 hover:bg-surface-2 transition-all border-r border-border"
          >
            <div className="size-10 rounded-full border border-border text-title flex items-center justify-center transition-all group-hover:border-quiz-p group-hover:text-quiz-p group-hover:scale-110">
              <Icon name="workspace_premium" size="sm" />
            </div>
            <Typography variant="microLabel" color="sub" className="group-hover:text-quiz-p">
              Certificate
            </Typography>
          </button>

          {/* Modify / Completed */}
          {!isPast ? (
            <button
              onClick={() => onNavigate('booking')}
              className="group p-4 h-24 flex flex-col items-center justify-center gap-1.5 hover:bg-surface-2 transition-all"
            >
              <div className="size-10 rounded-full border border-border text-title flex items-center justify-center transition-all group-hover:border-primary group-hover:scale-110">
                <Icon name="edit_calendar" size="sm" />
              </div>
              <Typography variant="microLabel" color="sub">Modify</Typography>
            </button>
          ) : (
            <div className="p-4 h-24 flex flex-col items-center justify-center gap-1.5 opacity-30">
              <Icon name="check_circle" size="sm" className="text-action" />
              <Typography variant="microLabel" color="action">Done</Typography>
            </div>
          )}
        </div>
      </div>

      {/* ── CERTIFICATE SECTION — nascosta ai visitor (F3: niente certificato) ── */}
      {!isActiveVisitor && (
        <div className="bg-surface/60 dark:bg-white/5 backdrop-blur-xl border border-border rounded-3xl [padding:var(--space-fluid-m)] mt-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="workspace_premium" className="text-quiz-p" />
            <Typography variant="h4" className="uppercase tracking-tight">Your Certificate</Typography>
          </div>
          <Typography variant="paragraphS" color="sub" className="mb-5 leading-relaxed">
            Once your class is complete and your menu is set, download your personalised Thai Akha certificate of participation.
          </Typography>
          <Button
            variant="outline"
            size="md"
            onClick={() => onShowCertificate?.()}
            className="border-quiz-p/40 text-quiz-p hover:bg-quiz-p/10 transition-all active:scale-95"
          >
            <Icon name="download" size="sm" />
            Download Certificate
          </Button>
        </div>
      )}

    </div>
  );
};

export default DashboardTab;
