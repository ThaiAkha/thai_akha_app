/**
 * useSessionConfig
 * Fetches cooking class configuration from DB and builds the SessionInfo map.
 * Runs once on mount.
 */

import { useState, useEffect } from 'react';
import { contentService } from '@thaiakha/shared/services';
import { t } from '../../../i18n';
import type { SessionInfo } from '../booking.types';

export interface UseSessionConfigResult {
  sessionConfig: Record<string, SessionInfo>;
  loading: boolean;
}

export function useSessionConfig(): UseSessionConfigResult {
  const [sessionConfig, setSessionConfig] = useState<Record<string, SessionInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Fonte di verità BOOKING = class_sessions (prezzo/capacità/market tour),
        // NON cooking_classes (marketing). Fix has_market_tour (vive qui).
        const sessions = await contentService.getClassSessions();
        const config: Record<string, SessionInfo> = {};

        sessions.forEach((s) => {
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

        setSessionConfig(config);
      } catch (e) {
        console.error('SessionConfig load error:', e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  return { sessionConfig, loading };
}
