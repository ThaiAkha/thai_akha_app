/**
 * useSessionConfig
 * Fetches cooking class configuration from DB and builds the SessionInfo map.
 * Data layer unico (CLAUDE.md #17): era `useEffect + useState`, ora una useQuery in cache
 * (configurazione statica: prezzo, capacita', market tour); la mappa si costruisce dai dati.
 */

import { useMemo } from 'react';
import { useQuery } from '@thaiakha/shared/query';
import { contentService } from '@thaiakha/shared/services';
import { t } from '../../../i18n';
import type { SessionInfo } from '../booking.types';

export interface UseSessionConfigResult {
  sessionConfig: Record<string, SessionInfo>;
  loading: boolean;
}

/** Vuoto stabile: `{}` inline sarebbe un riferimento nuovo a ogni render (configReady a valle). */
const NO_CONFIG: Record<string, SessionInfo> = {};

export const classSessionsQueryKey = ['class_sessions', 'config'] as const;

/**
 * `enabled: false` quando la prenotazione online e' in pausa: la pagina mostra
 * solo un cartello, e senza questo interruttore chiedeva comunque le sessioni di
 * classe e poi la disponibilita' di tre giorni per una schermata mai disegnata.
 */
export function useSessionConfig(options: { enabled?: boolean } = {}): UseSessionConfigResult {
  const enabled = options.enabled ?? true;
  const query = useQuery({
    queryKey: classSessionsQueryKey,
    // Fonte di verità BOOKING = class_sessions (prezzo/capacità/market tour),
    // NON cooking_classes (marketing). Fix has_market_tour (vive qui).
    queryFn: () => contentService.getClassSessions(),
    enabled,
  });

  const sessionConfig = useMemo(() => {
    if (!query.data) return NO_CONFIG;
    const config: Record<string, SessionInfo> = {};
    query.data.forEach((s) => {
      const isMorning = s.id.includes('morning');
      config[s.id] = {
        id:          s.id,
        label:       s.display_name,
        shortLabel:  isMorning ? t('booking:morningSession') : t('booking:eveningSession'),
        basePrice:   s.price_thb,
        icon:        isMorning ? 'wb_sunny' : 'dark_mode',
        color:       isMorning ? 'text-primary' : 'text-secondary',
        pickupTime:  isMorning ? '08:30 - 09:00' : '16:30 - 17:00',
        classTime:   isMorning ? '09:00 - 14:30' : '17:00 - 21:00',
        marketTour:  s.has_market_tour,
      };
    });
    return config;
  }, [query.data]);

  // `enabled &&`: una query spenta e senza dati resta per sempre in attesa, e chi
  // legge questo flag ci resterebbe appeso.
  return { sessionConfig, loading: enabled && query.isPending };
}
