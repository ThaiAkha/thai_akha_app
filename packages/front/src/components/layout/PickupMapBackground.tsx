import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

interface PickupMapBackgroundProps {
  geoJsonData: any;
  selectedLocation?: { lat: number; lng: number } | null;
  onPointSelect?: (point: { name: string; lat: number; lng: number; type: string }) => void;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  selectionMode?: boolean;
}

const PickupMapBackground: React.FC<PickupMapBackgroundProps> = ({ 
  geoJsonData, 
  selectedLocation,
  onPointSelect,
  onMapClick,
  selectionMode = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  
  // Refs per gestire la pulizia della memoria
  const userMarkerRef = useRef<any>(null);
  const pointMarkersRef = useRef<any[]>([]); 
  const [mapReady, setMapReady] = useState(false);

  // 1. INIZIALIZZAZIONE MAPPA
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || !window.google) return;
      
      // Importa librerie necessarie (Maps + Marker Avanzati)
      const { Map } = await window.google.maps.importLibrary("maps");
      
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
      map.data.forEach((feature: any) => map.data.remove(feature)); // Pulizia
      map.data.addGeoJson(geoJsonData);

      map.data.setStyle((feature: any) => {
        const geometryType = feature.getGeometry().getType();
        
        // Disegna SOLO i Poligoni (Zone Colorate)
        if (geometryType === 'Polygon') {
          const color = feature.getProperty('color') || '#ff7597';
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
        geoJsonData.features.forEach((feature: any) => {
          if (feature.geometry.type === 'Point') {
            const [lng, lat] = feature.geometry.coordinates; // GeoJSON è [Lon, Lat]
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
                  name: props.name,
                  lat, lng,
                  type: props.type
                });
              }
            });

            pointMarkersRef.current.push(marker);
          }
        });
      }
    };

    renderData();
  }, [geoJsonData, mapReady]); // Riesegue se cambiano i dati o la mappa è pronta

  // 3. GESTIONE CLICK MAPPA (Pin Manuale Utente)
  useEffect(() => {
    if (!googleMapRef.current || !window.google) return;
    const map = googleMapRef.current;

    // Cursore
    map.setOptions({ draggableCursor: selectionMode ? 'crosshair' : 'grab' });

    // Listener (Il click sulla mappa usa ancora l'evento standard 'click')
    const listener = map.addListener('click', (e: any) => {
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

  return <div ref={mapRef} className="w-full h-full bg-[#1d1d1d]" />;
};

export default PickupMapBackground;