import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@thaiakha/shared/lib/supabase';
import { GEOJSON_MASTER } from '@thaiakha/shared/data';
import { isPointInPolygon } from '@thaiakha/shared/lib/geoUtils';
import type { HotelLocation, HotelFormData, MeetingPoint, PickupZone } from '@thaiakha/shared/types';
export type { HotelLocation, HotelFormData, MeetingPoint, PickupZone };

const emptyForm: HotelFormData = {
    name: '',
    zone_id: '',
    latitude: null,
    longitude: null,
    address: '',
    phone_number: '',
    map_link: '',
    website: '',
    google_place_id: '',
    is_active: true,
};

// ─── HELPERS ────────────────────────────────────────────────────────────────────

function extractGPS(url: string): { lat: number; lng: number } | null {
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    return null;
}

export function useAdminHotels() {
    const { t } = useTranslation('hotels');
    // ✅ AppHeader handles metadata loading automatically

    // Data State
    const [hotels, setHotels] = useState<HotelLocation[]>([]);
    const [zones, setZones] = useState<PickupZone[]>([]);
    const [meetingPoints, setMeetingPoints] = useState<MeetingPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // UI State
    const [activeTab, setActiveTab] = useState<'hotels' | 'meeting_points'>('hotels');
    const [selectedZone, setSelectedZone] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // Inspector State
    const [selectedHotel, setSelectedHotel] = useState<HotelLocation | null>(null);
    const [selectedMeetingPoint, setSelectedMeetingPoint] = useState<MeetingPoint | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState<HotelFormData>({ ...emptyForm });

    // ── Auto-Zoning Logic ─────────────────────────────────────────────────────
    const detectZone = useCallback((lat: number, lng: number): string | null => {
        // Map GEOJSON feature IDs (e.g. 'AREA_AZURE_001') to DB zone IDs ('azure')
        const geoIdToZoneId: Record<string, string> = {
            'AREA_AZURE_001':  'azure',
            'AREA_PINK_001':   'pink',
            'AREA_GREEN_001':  'green',
            'AREA_YELLOW_001': 'yellow',
        };
        const priority = ['azure', 'pink', 'green', 'yellow'];
        for (const zoneId of priority) {
            const geoId = Object.keys(geoIdToZoneId).find(k => geoIdToZoneId[k] === zoneId);
            const feature = GEOJSON_MASTER.features.find((f: any) => f.properties.id === geoId);
            if (feature && feature.geometry.type === 'Polygon') {
                const polygonRing = feature.geometry.coordinates[0];
                if (isPointInPolygon({ lat, lng }, polygonRing)) {
                    return zoneId;
                }
            }
        }
        return null;
    }, []);

    // ── Fetch Data ────────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const fetchAllHotels = async () => {
                let allData: any[] = [];
                let from = 0;
                const step = 1000;
                while (true) {
                    const { data, error } = await supabase
                        .from('hotel_locations')
                        .select('*')
                        .order('name')
                        .range(from, from + step - 1);

                    if (error) throw error;
                    if (!data || data.length === 0) break;

                    allData = [...allData, ...data];
                    if (data.length < step) break;
                    from += step;
                }
                return allData;
            };

            const [hotelsData, zonesRes, meetingPointsRes] = await Promise.all([
                fetchAllHotels(),
                supabase.from('pickup_zones').select('*').order('display_order', { ascending: true }),
                supabase.from('meeting_points').select('*, cover:media_assets!image_asset_id(image_url, alt_text)').order('name'),
            ]);

            if (zonesRes.data) setZones(zonesRes.data as unknown as PickupZone[]);
            // Resolve image_asset_id → media_assets; keep image_url alias for display.
            if (meetingPointsRes.data) setMeetingPoints(meetingPointsRes.data.map(mp => {
                const cover = (mp as Record<string, unknown>).cover as { image_url?: string } | null;
                return { ...mp, image_url: cover?.image_url ?? null };
            }) as unknown as MeetingPoint[]);

            if (hotelsData && zonesRes.data) {
                const enriched = hotelsData.map((h: any) => {
                    const zone = (zonesRes.data as any[]).find((z: any) => z.id === h.zone_id);
                    return {
                        ...h,
                        zone_name: zone?.name || 'No Zone',
                        zone_color: zone?.color_code || '#9CA3AF',
                    };
                });
                setHotels(enriched);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleMapLinkChange = (value: string) => {
        const updatedFromLink: Partial<HotelFormData> = { map_link: value };
        const gps = extractGPS(value);

        if (gps) {
            updatedFromLink.latitude = gps.lat;
            updatedFromLink.longitude = gps.lng;
            const detected = detectZone(gps.lat, gps.lng);
            if (detected) updatedFromLink.zone_id = detected;
        }
        setForm(prev => ({ ...prev, ...updatedFromLink }));
    };

    const handleManualGPSChange = (field: 'latitude' | 'longitude', value: string) => {
        const numVal = value ? parseFloat(value) : null;
        setForm(prev => {
            const next = { ...prev, [field]: numVal };
            if (next.latitude && next.longitude) {
                const detected = detectZone(next.latitude, next.longitude);
                if (detected) next.zone_id = detected;
            }
            return next;
        });
    };

    const handleSidebarSelect = (id: string) => {
        if (id === 'all_mps') {
            setActiveTab('meeting_points');
            setSelectedZone('all');
        } else {
            setActiveTab('hotels');
            setSelectedZone(id);
        }
        setSelectedHotel(null);
        setSelectedMeetingPoint(null);
        setIsEditing(false);
        setIsCreating(false);
    };

    const selectHotel = (hotel: HotelLocation) => {
        setSelectedHotel(hotel);
        setSelectedMeetingPoint(null);
        setIsCreating(false);
        setIsEditing(false);
        setForm({
            name: hotel.name,
            zone_id: hotel.zone_id || '',
            latitude: hotel.latitude,
            longitude: hotel.longitude,
            address: hotel.address || '',
            phone_number: hotel.phone_number || '',
            map_link: hotel.map_link || '',
            website: hotel.website || '',
            google_place_id: hotel.google_place_id || '',
            is_active: hotel.is_active,
        });
    };

    const selectMeetingPoint = (mp: MeetingPoint) => {
        setSelectedMeetingPoint(mp);
        setSelectedHotel(null);
        setIsCreating(false);
        setIsEditing(false);
    };

    const startCreate = () => {
        setSelectedHotel(null);
        setSelectedMeetingPoint(null);
        setIsCreating(true);
        setIsEditing(true);
        setForm({ ...emptyForm, zone_id: zones[0]?.id || '' });
    };

    const startCreateMeetingPoint = () => {
        setSelectedHotel(null);
        setSelectedMeetingPoint({
            id: `new-${Date.now()}`,
            name: '',
            latitude: 18.7883,
            longitude: 98.9853,
            description: '',
            google_maps_link: '',
            image_asset_id: null,
            icon_url: '',
            active: true,
            morning_pickup_time: '08:00',
            morning_pickup_end: '08:30',
            evening_pickup_time: '16:00',
            evening_pickup_end: '16:30',
        });
        setIsCreating(true);
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            alert(t('alerts.nameRequired'));
            return;
        }
        setSaving(true);
        const payload = {
            name: form.name.trim(),
            zone_id: form.zone_id || null,
            latitude: form.latitude,
            longitude: form.longitude,
            address: form.address || null,
            phone_number: form.phone_number || null,
            map_link: form.map_link || null,
            website: form.website || null,
            google_place_id: form.google_place_id || null,
            is_active: form.is_active,
        };

        const { error } = selectedHotel
            ? await supabase.from('hotel_locations').update(payload).eq('id', selectedHotel.id)
            : await supabase.from('hotel_locations').insert([payload]);

        if (error) {
            console.error('Save error:', error);
            alert(t('alerts.saveFailed'));
        } else {
            setIsEditing(false);
            setIsCreating(false);
            await fetchData();
        }
        setSaving(false);
    };

    const handleSaveMeetingPoint = async () => {
        if (!selectedMeetingPoint || !selectedMeetingPoint.name) return;
        setSaving(true);
        const payload = {
            name: selectedMeetingPoint.name,
            latitude: selectedMeetingPoint.latitude,
            longitude: selectedMeetingPoint.longitude,
            google_maps_link: selectedMeetingPoint.google_maps_link,
            description: selectedMeetingPoint.description,
            image_asset_id: selectedMeetingPoint.image_asset_id ?? null,
            icon_url: selectedMeetingPoint.icon_url,
            active: selectedMeetingPoint.active,
            morning_pickup_time: selectedMeetingPoint.morning_pickup_time,
            morning_pickup_end: selectedMeetingPoint.morning_pickup_end,
            evening_pickup_time: selectedMeetingPoint.evening_pickup_time,
            evening_pickup_end: selectedMeetingPoint.evening_pickup_end,
        };

        const { error } = selectedMeetingPoint.id.startsWith('new-')
            ? await supabase.from('meeting_points').insert([payload as any])
            : await supabase.from('meeting_points').update(payload as any).eq('id', selectedMeetingPoint.id);

        if (error) {
            console.error('Save MP error:', error);
            alert(t('alerts.saveMPFailed'));
        } else {
            setSelectedMeetingPoint(null);
            setIsEditing(false);
            await fetchData();
        }
        setSaving(false);
    };

    const closeInspector = () => {
        setSelectedHotel(null);
        setSelectedMeetingPoint(null);
        setIsEditing(false);
        setIsCreating(false);
    };

    // ── Derived State ─────────────────────────────────────────────────────────
    const filteredHotels = useMemo(() => hotels.filter(h => {
        const matchesZone = selectedZone === 'all' || h.zone_id === selectedZone;
        const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesZone && matchesSearch;
    }), [hotels, selectedZone, searchQuery]);

    const filteredMeetingPoints = useMemo(() => meetingPoints.filter(mp => {
        const matchesSearch = mp.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    }), [meetingPoints, searchQuery]);

    return {
        // Core Data
        data: {
            hotels,
            zones,
            meetingPoints,
            filteredHotels,
            filteredMeetingPoints,
            loading,
            fetchData,
        },

        // UI & Navigation
        ui: {
            activeTab,
            setActiveTab,
            selectedZone,
            setSelectedZone,
            searchQuery,
            setSearchQuery,
            viewMode,
            setViewMode,
            handleSidebarSelect,
        },

        // Inspector & Editing
        inspector: {
            selectedHotel,
            selectedMeetingPoint,
            setSelectedMeetingPoint,
            isEditing,
            setIsEditing,
            isCreating,
            saving,
            form,
            setForm,
            selectHotel,
            selectMeetingPoint,
            startCreate,
            startCreateMeetingPoint,
            handleSave,
            handleSaveMeetingPoint,
            closeInspector,
            handleMapLinkChange,
            handleManualGPSChange,
        }
    };
}
