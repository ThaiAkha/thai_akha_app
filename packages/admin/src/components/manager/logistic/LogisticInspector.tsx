import React, { useState, useMemo, useRef, useEffect } from 'react';
import Badge from '../../ui/badge/Badge';
import SelectField from '../../form/input/SelectField';
import InputField from '../../form/input/InputField';
import {
    MapPin, Search, Building2,
    Clock, Truck, User
} from 'lucide-react';
import {
    LogisticsItem,
    DriverProfile,
    HotelOption,
    MeetingPointOption,
    PickupZoneOption,
} from '../../../hooks/useManagerLogistic';

// ---------- Searchable Hotel Select ----------
interface SearchableHotelSelectProps {
    label: string;
    value: string;
    hotels: HotelOption[];
    zones: PickupZoneOption[];
    placeholder?: string;
    onChange: (hotelName: string, zoneId: string | null) => void;
}

const SearchableHotelSelect: React.FC<SearchableHotelSelectProps> = ({
    label, value, hotels, zones, placeholder = 'Search hotel...', onChange,
}) => {
    const [query, setQuery] = useState(value || '');
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => { setQuery(value || ''); }, [value]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = useMemo(() => {
        if (!query.trim()) return hotels.slice(0, 40);
        const q = query.toLowerCase();
        return hotels.filter(h => h.name.toLowerCase().includes(q)).slice(0, 40);
    }, [query, hotels]);

    const zoneColor = (zoneId: string | null) => {
        const z = zones.find(z => z.id === zoneId);
        return z?.color_code || '#6B7280';
    };

    const zoneLabel = (zoneId: string | null) => {
        const z = zones.find(z => z.id === zoneId);
        return z?.name || '';
    };

    return (
        <div className="space-y-1" ref={ref}>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    <Building2 className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent pl-9 pr-4 py-2.5 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white dark:bg-gray-900"
                    placeholder={placeholder}
                    value={query}
                    onChange={e => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                />
                {open && filtered.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl">
                        {filtered.map(h => (
                            <button
                                key={h.id}
                                type="button"
                                className="w-full flex items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => {
                                    setQuery(h.name);
                                    setOpen(false);
                                    onChange(h.name, h.zone_id);
                                }}
                            >
                                <span className="text-gray-900 dark:text-white font-medium">{h.name}</span>
                                {h.zone_id && (
                                    <span
                                        className="ml-2 flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                                        style={{ backgroundColor: zoneColor(h.zone_id) }}
                                    >
                                        {zoneLabel(h.zone_id)}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ---------- Zone + Time Badge ----------
interface ZoneTimeBadgeProps {
    zone: PickupZoneOption | undefined;
    sessionId: string;
}
const ZoneTimeBadge: React.FC<ZoneTimeBadgeProps> = ({ zone, sessionId }) => {
    if (!zone) return null;
    const time = sessionId === 'morning_class' ? zone.morning_pickup_time : zone.evening_pickup_time;
    return (
        <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-black"
            style={{ backgroundColor: zone.color_code || '#6B7280' }}
        >
            <Clock className="w-3.5 h-3.5" />
            <span>{zone.name}</span>
            {time && <span className="opacity-80">· {time.slice(0, 5)}</span>}
        </div>
    );
};

// ---------- Main Inspector ----------
interface LogisticInspectorProps {
    selectedBooking: LogisticsItem | null;
    drivers: DriverProfile[];
    hotels: HotelOption[];
    meetingPoints: MeetingPointOption[];
    pickupZones: PickupZoneOption[];
    onAssign: (bookingId: string, driverId: string | null) => void;
    onUpdateLocal: (id: string, updates: Partial<LogisticsItem>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const LogisticInspector: React.FC<LogisticInspectorProps> = ({
    selectedBooking,
    drivers,
    hotels,
    meetingPoints,
    pickupZones,
    onAssign,
    onUpdateLocal,
    onSubmit,
}) => {
    if (!selectedBooking) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <Search className="w-12 h-12 mb-4 opacity-50" />
                <h5 className="uppercase font-bold text-sm text-gray-900 dark:text-white">Select a Passenger</h5>
                <p className="text-xs mt-2 text-gray-500">Click any card to inspect and manage details.</p>
            </div>
        );
    }

    const currentZone = pickupZones.find(z => z.id === selectedBooking.pickup_zone);
    const zoneDefaultTime = selectedBooking.session_id === 'morning_class'
        ? currentZone?.morning_pickup_time
        : currentZone?.evening_pickup_time;

    const handleHotelChange = (hotelName: string, zoneId: string | null) => {
        const updates: Partial<LogisticsItem> = { hotel_name: hotelName };
        if (zoneId) {
            updates.pickup_zone = zoneId;
            // Auto-fill time from zone
            const zone = pickupZones.find(z => z.id === zoneId);
            if (zone) {
                const zoneTime = selectedBooking.session_id === 'morning_class'
                    ? zone.morning_pickup_time
                    : zone.evening_pickup_time;
                if (zoneTime) updates.pickup_time = zoneTime;
            }
        }
        onUpdateLocal(selectedBooking.id, updates);
    };

    const handleDropoffHotelChange = (hotelName: string, zoneId: string | null) => {
        onUpdateLocal(selectedBooking.id, {
            dropoff_hotel: hotelName,
            ...(zoneId && { dropoff_zone: zoneId }),
        });
    };

    return (
        <form onSubmit={onSubmit} className="flex-1 flex flex-col animate-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 space-y-3 bg-gray-50/30 dark:bg-gray-800/20">
                <div className="space-y-1">
                    <Badge variant="light" color="primary">{selectedBooking.pax} PAX</Badge>
                    <h3 className="text-xl font-black uppercase tracking-tight leading-none text-gray-900 dark:text-white mt-2">
                        {selectedBooking.guest_name}
                    </h3>
                </div>
                {/* Zone Badge */}
                {currentZone && (
                    <ZoneTimeBadge zone={currentZone} sessionId={selectedBooking.session_id} />
                )}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">

                {/* ── Route Assignment ── */}
                <div className="p-6 space-y-4 border-b border-gray-100 dark:border-gray-800">
                    <h6 className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> Route Assignment
                    </h6>
                    <SelectField
                        label="Pickup Driver"
                        value={selectedBooking.pickup_driver_uid || ''}
                        onChange={(e) => onAssign(selectedBooking.id, e.target.value || null)}
                    >
                        <option value="">-- UNASSIGNED --</option>
                        {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                    </SelectField>
                </div>

                {/* ── Pickup Details ── */}
                <div className="p-6 space-y-4 border-b border-gray-100 dark:border-gray-800">
                    <h6 className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> Pickup Details
                    </h6>

                    {/* Pickup / Walk-in toggle */}
                    <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => onUpdateLocal(selectedBooking.id, { meeting_point: null })}
                            className={`flex-1 py-2 text-xs font-bold transition-colors ${!selectedBooking.meeting_point
                                ? 'bg-brand-500 text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            Pickup at Hotel
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const updates: Partial<LogisticsItem> = {
                                    meeting_point: '',
                                    hotel_name: '',
                                    pickup_zone: 'walk-in',
                                };
                                // Auto-fill pickup time from meeting point if one is set
                                onUpdateLocal(selectedBooking.id, updates);
                            }}

                            className={`flex-1 py-2 text-xs font-bold transition-colors ${selectedBooking.meeting_point
                                ? 'bg-brand-500 text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            Walk-in / Meeting Point
                        </button>
                    </div>

                    {/* Hotel Search — only when Pickup at Hotel */}
                    {selectedBooking.meeting_point === null && (
                        <SearchableHotelSelect
                            label="Hotel / Location"
                            value={selectedBooking.hotel_name || ''}
                            hotels={hotels}
                            zones={pickupZones}
                            onChange={handleHotelChange}
                        />
                    )}

                    {/* Meeting Point — only when Walk-in */}
                    {selectedBooking.meeting_point !== null && (
                        <SelectField
                            label="Meeting Point"
                            value={selectedBooking.meeting_point || ''}
                            onChange={(e) => {
                                const mpId = e.target.value;
                                const mp = meetingPoints.find(m => m.id === mpId);
                                const updates: Partial<LogisticsItem> = { meeting_point: mpId };
                                if (mp) {
                                    const mpTime = selectedBooking.session_id === 'morning_class'
                                        ? mp.morning_pickup_time
                                        : mp.evening_pickup_time;
                                    if (mpTime) updates.pickup_time = mpTime;
                                }
                                onUpdateLocal(selectedBooking.id, updates);
                            }}
                        >
                            <option value="">-- Select meeting point --</option>
                            {meetingPoints.map(mp => (
                                <option key={mp.id} value={mp.id}>
                                    {mp.name}{mp.morning_pickup_time ? ` · ${selectedBooking.session_id === 'morning_class' ? mp.morning_pickup_time.slice(0, 5) : (mp.evening_pickup_time?.slice(0, 5) ?? '')}` : ''}
                                </option>
                            ))}
                        </SelectField>
                    )}

                    {/* Pickup Time */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Pickup Time</span>
                            {zoneDefaultTime && (
                                <button
                                    type="button"
                                    className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
                                    onClick={() => onUpdateLocal(selectedBooking.id, { pickup_time: zoneDefaultTime })}
                                >
                                    Reset to zone ({zoneDefaultTime.slice(0, 5)})
                                </button>
                            )}
                        </div>
                        <InputField
                            type="time"
                            value={selectedBooking.pickup_time || ''}
                            onChange={e => onUpdateLocal(selectedBooking.id, { pickup_time: e.target.value })}
                        />
                    </div>
                </div>


                {/* ── Drop-off Management ── */}
                <div className="p-6 space-y-4">
                    <h6 className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5" /> Drop-off
                    </h6>

                    {/* Same / Different Location toggle */}
                    <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => onUpdateLocal(selectedBooking.id, { dropoff_hotel: null, dropoff_zone: null, dropoff_driver_uid: null })}
                            className={`flex-1 py-2 text-xs font-bold transition-colors ${!selectedBooking.dropoff_hotel
                                ? 'bg-brand-500 text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            Same Location
                        </button>
                        <button
                            type="button"
                            onClick={() => onUpdateLocal(selectedBooking.id, { dropoff_hotel: selectedBooking.hotel_name || '' })}
                            className={`flex-1 py-2 text-xs font-bold transition-colors ${selectedBooking.dropoff_hotel
                                ? 'bg-brand-500 text-white'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            Different Location
                        </button>
                    </div>

                    {selectedBooking.dropoff_hotel !== null && selectedBooking.dropoff_hotel !== undefined && (
                        <>
                            {/* Drop-off Hotel */}
                            <SearchableHotelSelect
                                label="Drop-off Hotel / Location"
                                value={selectedBooking.dropoff_hotel || ''}
                                hotels={hotels}
                                zones={pickupZones}
                                onChange={handleDropoffHotelChange}
                            />

                            {/* Drop-off Driver */}
                            <SelectField
                                label="Drop-off Driver"
                                value={selectedBooking.dropoff_driver_uid || ''}
                                onChange={(e) => onUpdateLocal(selectedBooking.id, { dropoff_driver_uid: e.target.value || null })}
                            >
                                <option value="">-- Same as pickup --</option>
                                {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                            </SelectField>
                        </>
                    )}
                </div>
            </div>

        </form>
    );
};

export default LogisticInspector;
