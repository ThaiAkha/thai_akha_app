import React, { useEffect, useRef, useState } from 'react';
import { meetingPointIconDataUri } from '@thaiakha/shared/data';
import type { MeetingPoint, PickupGeoJsonCollection, PickupGeoJsonFeature } from '@thaiakha/shared/types';

// Minimal typing of the Google Maps JS SDK surface used here (no @types/google.maps in the repo).
type GmLatLng = { lat: number; lng: number };
interface GmListener { remove(): void }
interface GmMarker {
  map: GmMap | null;
  addListener(event: string, handler: () => void): GmListener;
}
interface GmDataFeature {
  getGeometry(): { getType(): string };
  getProperty(name: string): unknown;
}
interface GmMapMouseEvent {
  placeId?: string;
  latLng: { lat(): number; lng(): number };
  stop(): void;
}
interface GmMap {
  data: {
    forEach(cb: (feature: GmDataFeature) => void): void;
    remove(feature: GmDataFeature): void;
    addGeoJson(geoJson: PickupGeoJsonCollection): void;
    setStyle(cb: (feature: GmDataFeature) => Record<string, unknown>): void;
  };
  setOptions(opts: Record<string, unknown>): void;
  addListener(event: string, handler: (e: GmMapMouseEvent) => void): GmListener;
  panTo(pos: GmLatLng): void;
}
interface GmMapsGlobal {
  importLibrary(name: string): Promise<{
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => GmMap;
    AdvancedMarkerElement: new (opts: Record<string, unknown>) => GmMarker;
    PinElement: new (opts: Record<string, unknown>) => unknown;
  }>;
  event: { removeListener(listener: GmListener): void };
}

declare global {
  interface Window {
    google: { maps: GmMapsGlobal };
  }
}

// Lo script Maps e' `async defer` e lo inietta la route (lib/googleMaps.ts, dal
// 2026-09-05: prima stava nel <head> di index.html, cioe' su ogni pagina): puo'
// eseguire DOPO il mount di questa pagina, e altri script possono aver gia'
// creato un `window.google` parziale. Chiamare importLibrary alla cieca dava "importLibrary is not a
// function" in prod (2026-08-31) oppure una mappa morta in silenzio. Qui si
// attende il caricamento vero: polling leggero finche' importLibrary non esiste.
const MAPS_POLL_MS = 150;
const MAPS_TIMEOUT_MS = 10000;
const waitForMaps = (): Promise<GmMapsGlobal | null> =>
  new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      // cast locale: il tipo globale dichiara window.google sempre presente, qui serve il caso "non ancora"
      const maps = (window as { google?: { maps?: Partial<GmMapsGlobal> } }).google?.maps;
      if (typeof maps?.importLibrary === 'function') return resolve(maps as GmMapsGlobal);
      if (Date.now() - started > MAPS_TIMEOUT_MS) return resolve(null);
      window.setTimeout(tick, MAPS_POLL_MS);
    };
    tick();
  });

interface PickupMapBackgroundProps {
  geoJsonData: PickupGeoJsonCollection;
  selectedLocation?: { lat: number; lng: number } | null;
  /** Drop-off location — shown as a second amber pin alongside the pickup pin */
  secondaryLocation?: { lat: number; lng: number } | null;
  onPointSelect?: (point: { name: string; lat: number; lng: number; type: string }) => void;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  selectionMode?: boolean;
  /** Meeting points da mostrare sulla mappa (outside zone mode) */
  meetingPointsOverlay?: MeetingPoint[];
  /** ID del meeting point selezionato — viene evidenziato con scala maggiore */
  selectedMeetingPointId?: string | null;
}

const PickupMapBackground: React.FC<PickupMapBackgroundProps> = ({
  geoJsonData,
  selectedLocation,
  secondaryLocation,
  onPointSelect,
  onMapClick,
  selectionMode = false,
  meetingPointsOverlay,
  selectedMeetingPointId,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<GmMap | null>(null);

  // Refs per gestire la pulizia della memoria
  const userMarkerRef = useRef<GmMarker | null>(null);
  const dropoffMarkerRef = useRef<GmMarker | null>(null);
  const pointMarkersRef = useRef<GmMarker[]>([]);
  const overlayMarkersRef = useRef<GmMarker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // 1. INIZIALIZZAZIONE MAPPA
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      // Attende lo script Maps (async defer); se non arriva entro il timeout
      // la pagina resta usabile, solo senza sfondo mappa.
      const maps = await waitForMaps();
      if (!maps || !mapRef.current) return;
      
      // Importa librerie necessarie (Maps + Marker Avanzati)
      const { Map } = await maps.importLibrary("maps");
      
      if (!googleMapRef.current) {
        const map = new Map(mapRef.current, {
          center: { lat: 18.7883, lng: 98.9853 }, // Centro su Old City
          zoom: 13,
          disableDefaultUI: true, // UI Pulita
          mapId: 'bf9368020a320601', // ⚠️ NECESSARIO per Advanced Markers
          backgroundColor: '#1d1d1d',
          clickableIcons: false, // Disabilita click sui POI di Google
          gestureHandling: 'greedy',
        });

        googleMapRef.current = map;
        setMapReady(true);
      }
    };

    initMap();
  }, []);

  // 2. RENDERING DATI (Zone & Punti)
  useEffect(() => {
    const renderData = async () => {
      if (!googleMapRef.current || !geoJsonData || !window.google) return;
      const map = googleMapRef.current;
      const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");

      // --- A. GESTIONE ZONE (POLIGONI) ---
      // Usiamo il Data Layer nativo per i poligoni (veloce ed efficiente)
      map.data.forEach((feature) => map.data.remove(feature)); // Pulizia
      map.data.addGeoJson(geoJsonData);

      map.data.setStyle((feature) => {
        const geometryType = feature.getGeometry().getType();
        
        // Disegna SOLO i Poligoni (Zone Colorate)
        if (geometryType === 'Polygon') {
          const color = (feature.getProperty('color') as string | undefined) || '#ff7597';
          return {
            fillColor: color,
            fillOpacity: 0.15, // Trasparenza elegante
            strokeColor: color,
            strokeWeight: 2,
            clickable: false // Le zone sono passive, il click lo gestiamo noi
          };
        }
        
        // ⛔ NASCONDI i Punti dal Data Layer automatico
        // (Li disegniamo manualmente sotto per avere icone custom)
        return { visible: false };
      });

      // --- B. GESTIONE PUNTI (ICONE CUSTOM) ---
      // 1. Pulisci vecchi marker
      pointMarkersRef.current.forEach(m => m.map = null);
      pointMarkersRef.current = [];

      // 2. Itera sulle feature per creare Marker Avanzati
      if (geoJsonData.features) {
        geoJsonData.features.forEach((feature: PickupGeoJsonFeature) => {
          if (feature.geometry.type === 'Point') {
            const [lng, lat] = feature.geometry.coordinates as [number, number]; // GeoJSON è [Lon, Lat]
            const props = feature.properties;
            
            // Creazione Contenuto Marker
            let markerContent;

            if (props.icon) {
              // A. ICONA PNG CUSTOM (Aeroporto, Stazione, Scuola)
              const img = document.createElement('img');
              img.src = props.icon;
              img.style.width = '40px';
              img.style.height = '40px';
              img.style.objectFit = 'contain';
              img.className = 'drop-shadow-xl hover:scale-125 transition-transform duration-300 cursor-pointer';
              markerContent = img;
            } else {
              // B. PIN STANDARD (Cerchio Colorato)
              const pin = new PinElement({
                background: props['marker-color'] || '#FF0000',
                borderColor: '#FFFFFF',
                glyphColor: '#FFFFFF',
                scale: 0.9,
              });
              // ✅ FIX 1: Passiamo direttamente l'istanza pin, non pin.element
              markerContent = pin;
            }

            // Crea il Marker sulla Mappa
            const marker = new AdvancedMarkerElement({
              map: map,
              position: { lat, lng },
              title: props.name,
              content: markerContent,
              zIndex: props.zIndex || 10,
              gmpClickable: true,
            });

            // ✅ FIX 2: Usiamo 'gmp-click' invece di 'click' per AdvancedMarkerElement
            marker.addListener('gmp-click', () => {
              if (onPointSelect) {
                map.panTo({ lat, lng }); // Zoom fluido sul punto
                onPointSelect({
                  name: props.name ?? '',
                  lat, lng,
                  type: props.type ?? ''
                });
              }
            });

            pointMarkersRef.current.push(marker);
          }
        });
      }
    };

    renderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onPointSelect intentionally excluded: markers rebuild only on data/map change
  }, [geoJsonData, mapReady]); // Riesegue se cambiano i dati o la mappa è pronta

  // 3. GESTIONE CLICK MAPPA (Pin Manuale Utente)
  useEffect(() => {
    if (!googleMapRef.current || !window.google) return;
    const map = googleMapRef.current;

    // Cursore
    map.setOptions({ draggableCursor: selectionMode ? 'crosshair' : 'grab' });

    // Listener (Il click sulla mappa usa ancora l'evento standard 'click')
    const listener = map.addListener('click', (e) => {
      if (selectionMode && onMapClick) {
        // Ignora click se è su un POI di Google Maps (es. un ristorante)
        if (e.placeId) {
          e.stop(); 
          return;
        }
        onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      }
    });

    return () => window.google.maps.event.removeListener(listener);
  }, [selectionMode, onMapClick, mapReady]);

  // 4. MARKER UTENTE (Il Pin che salta)
  useEffect(() => {
    const updateUserMarker = async () => {
      if (!googleMapRef.current || !selectedLocation || !window.google) return;
      
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");

      // Rimuovi precedente
      if (userMarkerRef.current) userMarkerRef.current.map = null;

      // Crea Pin HTML Personalizzato (Animato)
      const pinContainer = document.createElement("div");
      pinContainer.className = "relative flex items-center justify-center -translate-y-full cursor-pointer";
      pinContainer.innerHTML = `
        <div style="
          width: 40px; height: 40px; 
          background: #ff7597; 
          border: 3px solid white; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg);
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        ">
          <div style="width: 14px; height: 14px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
        </div>
        <div style="
          position: absolute; bottom: -10px; 
          width: 20px; height: 6px; 
          background: rgba(0,0,0,0.3); 
          border-radius: 50%; 
          filter: blur(2px);
        "></div>
      `;

      // Posiziona Marker
      userMarkerRef.current = new AdvancedMarkerElement({
        position: selectedLocation,
        map: googleMapRef.current,
        content: pinContainer,
        zIndex: 999, // Sempre sopra tutto
      });

      // Pan verso il marker
      googleMapRef.current.panTo(selectedLocation);
    };

    updateUserMarker();
  }, [selectedLocation, mapReady]);

  // 5. MARKER DROP-OFF SECONDARIO (Pin ambra)
  useEffect(() => {
    const updateDropoffMarker = async () => {
      if (!googleMapRef.current || !window.google) return;
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');

      // Rimuovi precedente
      if (dropoffMarkerRef.current) dropoffMarkerRef.current.map = null;

      if (!secondaryLocation) return;

      // Pin HTML ambra per drop-off
      const pinContainer = document.createElement('div');
      pinContainer.className = 'relative flex items-center justify-center -translate-y-full cursor-pointer';
      pinContainer.innerHTML = `
        <div style="
          width: 40px; height: 40px;
          background: #f59e0b;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        ">
          <div style="width: 14px; height: 14px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
        </div>
        <div style="
          position: absolute; bottom: -10px;
          width: 20px; height: 6px;
          background: rgba(0,0,0,0.3);
          border-radius: 50%;
          filter: blur(2px);
        "></div>
      `;

      dropoffMarkerRef.current = new AdvancedMarkerElement({
        position: secondaryLocation,
        map: googleMapRef.current,
        content: pinContainer,
        zIndex: 998,
      });
    };

    updateDropoffMarker();
  }, [secondaryLocation, mapReady]);

  // 6. OVERLAY MEETING POINTS (outside zone mode)
  useEffect(() => {
    const renderOverlay = async () => {
      if (!googleMapRef.current || !window.google || !mapReady) return;
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');

      // Pulisci overlay precedente
      overlayMarkersRef.current.forEach(m => m.map = null);
      overlayMarkersRef.current = [];

      if (!meetingPointsOverlay || meetingPointsOverlay.length === 0) return;

      meetingPointsOverlay.forEach(mp => {
        const isSelected = mp.id === selectedMeetingPointId;

        // Pin HTML custom: cerchio colorato con icona/lettera
        const pin = document.createElement('div');
        pin.style.cssText = `
          width: ${isSelected ? '48px' : '36px'};
          height: ${isSelected ? '48px' : '36px'};
          background: ${isSelected ? '#f59e0b' : '#1d4ed8'};
          border: 3px solid white;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          transition: transform 0.2s ease;
          cursor: pointer;
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        `;

        // Icona: kit standard in codice (glifo bianco) → icon_url DB → fallback
        const kitIconUri = meetingPointIconDataUri(mp.id, { color: '#FFFFFF' });
        if (kitIconUri) {
          const img = document.createElement('img');
          img.src = kitIconUri;
          img.style.cssText = 'width: 20px; height: 20px; object-fit: contain;';
          pin.appendChild(img);
        } else if (mp.icon_url) {
          const img = document.createElement('img');
          img.src = mp.icon_url;
          img.style.cssText = 'width: 20px; height: 20px; object-fit: contain; filter: brightness(10);';
          pin.appendChild(img);
        } else {
          pin.style.color = 'white';
          pin.style.fontSize = '16px';
          pin.textContent = '📍';
        }

        const marker = new AdvancedMarkerElement({
          map: googleMapRef.current,
          position: { lat: mp.latitude, lng: mp.longitude },
          title: mp.name,
          content: pin,
          zIndex: isSelected ? 200 : 100,
          gmpClickable: true,
        });

        marker.addListener('gmp-click', () => {
          if (onPointSelect) {
            googleMapRef.current?.panTo({ lat: mp.latitude, lng: mp.longitude });
            onPointSelect({ name: mp.name, lat: mp.latitude, lng: mp.longitude, type: mp.id });
          }
        });

        overlayMarkersRef.current.push(marker);
      });
    };

    renderOverlay();
  }, [meetingPointsOverlay, selectedMeetingPointId, mapReady, onPointSelect]);

  return <div ref={mapRef} className="w-full h-full bg-map-bg" />;
};

export default PickupMapBackground;