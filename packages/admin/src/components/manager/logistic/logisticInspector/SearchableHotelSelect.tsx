import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import type { HotelOption, PickupZoneOption } from '../../../../hooks/useManagerLogistic';

interface SearchableHotelSelectProps {
    label: string;
    value: string;
    hotels: HotelOption[];
    zones: PickupZoneOption[];
    placeholder?: string;
    onChange: (hotelName: string, zoneId: string | null) => void;
}

/**
 * Select hotel con ricerca (estratto da LogisticInspector, task #93 B7, a comportamento
 * invariato). Il listener mousedown sul document chiude la tendina al click fuori.
 */
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
            <label className="block text-sm font-medium text-body">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-sub">
                    <Building2 className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent pl-9 pr-4 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white dark:bg-gray-900"
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
                                <span className="text-title font-medium">{h.name}</span>
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

export default SearchableHotelSelect;
