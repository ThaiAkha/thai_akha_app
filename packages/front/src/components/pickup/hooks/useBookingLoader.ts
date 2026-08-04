import { useEffect } from 'react';
import { supabase } from '@thaiakha/shared/lib/supabase';
import type { UseLocationStateResult } from './useLocationState';

interface Options {
  bookingId: string | null;
  state: UseLocationStateResult;
  setPickupSearchQuery: (q: string) => void;
  onLoaded: () => void;
}

/**
 * Restores existing booking state when editing (edit mode).
 * Reads the booking from DB and populates useLocationState setters.
 * Calls onLoaded() when done so the parent can stop its loading indicator.
 */
export function useBookingLoader({
  bookingId,
  state,
  setPickupSearchQuery,
  onLoaded,
}: Options): void {
  useEffect(() => {
    if (!bookingId) {
      onLoaded();
      return;
    }

    const restore = async () => {
      try {
        const { data: booking } = await supabase
          .from('bookings')
          .select('*')
          .eq('internal_id', bookingId)
          .single();

        if (!booking) return;

        // Session
        state.setSelectedClass(
          booking.session_id?.includes('evening') ? 'evening' : 'morning',
        );

        if (booking.pickup_zone === 'walk-in') {
          state.setTransportMode('self');
          state.setPickupLoc({
            type: 'meeting_point',
            name: booking.hotel_name,
            lat: 0,
            lng: 0,
            zoneId: 'meeting_point',
          });
        } else {
          state.setTransportMode('pickup');
          if (booking.hotel_name) {
            state.setPickupLoc({
              type: 'db_hotel',
              name: booking.hotel_name,
              lat: booking.pickup_lat,
              lng: booking.pickup_lng,
              zoneId: booking.pickup_zone,
            });
            setPickupSearchQuery(booking.hotel_name);
          }
          if (
            booking.requires_dropoff &&
            booking.dropoff_hotel &&
            booking.dropoff_hotel !== booking.hotel_name
          ) {
            state.setIsDropoffSame(false);
            state.setDropoffLoc({
              type: 'db_hotel',
              name: booking.dropoff_hotel,
              lat: booking.dropoff_lat,
              lng: booking.dropoff_lng,
              zoneId: booking.dropoff_zone,
            });
          }
        }
      } finally {
        onLoaded();
      }
    };

    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);
}
