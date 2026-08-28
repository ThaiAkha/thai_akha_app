import type { HotelLocation, MeetingPoint, PickupZone, HotelFormData } from '../../../../hooks/useAdminHotels';

/**
 * Props dell'inspector hotel/meeting point. `saving` e `onSaveMeetingPoint` non sono
 * usati da nessun ramo, ma AdminHotels li passa ancora: restano nel contratto finche'
 * la pagina non li toglie.
 */
export interface HotelsInspectorProps {
    selectedHotel: HotelLocation | null;
    selectedMeetingPoint: MeetingPoint | null;
    isEditing: boolean;
    isCreating: boolean;
    saving: boolean;
    form: HotelFormData;
    zones: PickupZone[];
    onFormChange: (data: Partial<HotelFormData>) => void;
    onMapLinkChange: (value: string) => void;
    onManualGPSChange: (field: 'latitude' | 'longitude', value: string) => void;
    onSelectedMeetingPointChange: (mp: MeetingPoint | null) => void;
    onSaveMeetingPoint: () => void;
}

/** Ramo meeting point: campi disabilitati fuori da edit, ogni onChange ricostruisce l'oggetto intero. */
export interface MeetingPointFormProps {
    meetingPoint: MeetingPoint;
    isEditing: boolean;
    onChange: (mp: MeetingPoint | null) => void;
}

/** Ramo edit/create hotel: `selectedHotel` serve solo alla key del Switch (remount al cambio hotel). */
export interface HotelEditFormProps {
    selectedHotel: HotelLocation | null;
    form: HotelFormData;
    zones: PickupZone[];
    onFormChange: (data: Partial<HotelFormData>) => void;
    onMapLinkChange: (value: string) => void;
    onManualGPSChange: (field: 'latitude' | 'longitude', value: string) => void;
}

/** Ramo vista hotel: sola lettura, `zones` per la ZoneInfoCard in testa. */
export interface HotelViewProps {
    selectedHotel: HotelLocation | null;
    zones: PickupZone[];
}
