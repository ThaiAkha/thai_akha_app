import { useState, useEffect, useMemo } from 'react';

export type TransportMode = 'pickup' | 'self';
export type ActiveField   = 'pickup' | 'dropoff';
export type DropoffType   = 'hotel' | 'other';
export type PickupType    = 'hotel' | 'airport' | 'train';

export interface LocationState {
  type: 'db_hotel' | 'meeting_point' | 'custom_pin';
  name: string;
  lat: number;
  lng: number;
  zoneId?: string;
  isUnknown?: boolean;
}

export interface UseLocationStateResult {
  // Selectors
  selectedClass: 'morning' | 'evening';
  setSelectedClass: (c: 'morning' | 'evening') => void;
  transportMode: TransportMode;
  setTransportMode: (m: TransportMode) => void;
  pickupType: PickupType;
  setPickupType: (t: PickupType) => void;
  dropoffType: DropoffType;
  setDropoffType: (t: DropoffType) => void;

  // Locations
  pickupLoc: LocationState | null;
  setPickupLoc: (l: LocationState | null) => void;
  dropoffLoc: LocationState | null;
  setDropoffLoc: (l: LocationState | null) => void;
  isDropoffSame: boolean;
  setIsDropoffSame: (v: boolean) => void;

  // Map focus
  activeField: ActiveField;
  setActiveField: (f: ActiveField) => void;
  isPinningMode: boolean;
  setIsPinningMode: (v: boolean) => void;

  // Outside zone
  outsideZoneMode: boolean;
  setOutsideZoneMode: (v: boolean) => void;
  outsideHotelCoords: { lat: number; lng: number } | null;
  setOutsideHotelCoords: (c: { lat: number; lng: number } | null) => void;
  isOutsideZone: boolean;

  // Drop-off
  isDropoffOutsideZone: boolean;
  setIsDropoffOutsideZone: (v: boolean) => void;

  // Convenience resets
  resetPickupType: (type: PickupType) => void;
  resetForTransportMode: (mode: TransportMode) => void;
  resetDropoff: () => void;
}

export function useLocationState(): UseLocationStateResult {
  const [selectedClass, setSelectedClass] = useState<'morning' | 'evening'>('morning');
  const [transportMode, setTransportMode] = useState<TransportMode>('pickup');
  const [pickupType, setPickupType] = useState<PickupType>('hotel');
  const [dropoffType, setDropoffType] = useState<DropoffType>('hotel');

  const [pickupLoc, setPickupLoc] = useState<LocationState | null>(null);
  const [dropoffLoc, setDropoffLoc] = useState<LocationState | null>(null);
  const [isDropoffSame, setIsDropoffSame] = useState(true);

  const [activeField, setActiveField] = useState<ActiveField>('pickup');
  const [isPinningMode, setIsPinningMode] = useState(false);

  const [outsideZoneMode, setOutsideZoneMode] = useState(false);
  const [outsideHotelCoords, setOutsideHotelCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isDropoffOutsideZone, setIsDropoffOutsideZone] = useState(false);

  // When transport mode changes, reset pickup + dropoff state
  useEffect(() => {
    setPickupLoc(null);
    setPickupType('hotel');
    setOutsideZoneMode(false);
    setOutsideHotelCoords(null);
    setDropoffType('hotel');
    setIsDropoffOutsideZone(false);
    if (transportMode === 'self') {
      setIsDropoffSame(true);
      setDropoffLoc(null);
    }
  }, [transportMode]);

  const isOutsideZone = useMemo(
    () => outsideZoneMode && transportMode === 'pickup',
    [outsideZoneMode, transportMode],
  );

  const resetPickupType = (type: PickupType) => {
    setPickupType(type);
    setPickupLoc(null);
    setOutsideZoneMode(false);
    setOutsideHotelCoords(null);
  };

  const resetForTransportMode = (mode: TransportMode) => {
    setTransportMode(mode);
    // side effects handled by useEffect above
  };

  const resetDropoff = () => {
    setDropoffLoc(null);
    setIsDropoffOutsideZone(false);
  };

  return {
    selectedClass, setSelectedClass,
    transportMode, setTransportMode,
    pickupType, setPickupType,
    dropoffType, setDropoffType,
    pickupLoc, setPickupLoc,
    dropoffLoc, setDropoffLoc,
    isDropoffSame, setIsDropoffSame,
    activeField, setActiveField,
    isPinningMode, setIsPinningMode,
    outsideZoneMode, setOutsideZoneMode,
    outsideHotelCoords, setOutsideHotelCoords,
    isOutsideZone,
    isDropoffOutsideZone, setIsDropoffOutsideZone,
    resetPickupType,
    resetForTransportMode,
    resetDropoff,
  };
}
