/**
 * Tipi della dashboard utente front (UserPage + user-dashboard/*).
 * Shape delle select Supabase fatte da UserPage: bookings + join class_sessions,
 * menu_selections + join ricette, fermate della rotta pickup.
 */
import type { Tables } from './database.types';

/** Booking dell'utente con il join `class_sessions ( display_name, start_time )`. */
export type UserDashboardBooking = Tables<'bookings'> & {
  class_sessions: Pick<Tables<'class_sessions'>, 'display_name' | 'start_time'> | null;
};

/** Ricetta minima nel join di menu_selections (curry/soup/stirfry). */
export interface MenuSelectionDish {
  name: string;
  image?: string | null;
}

/** menu_selections con i join `curry`/`soup`/`stirfry` (recipes!curry_id(name, image) ...). */
export type DashboardMenuSelection = Tables<'menu_selections'> & {
  curry: MenuSelectionDish | null;
  soup: MenuSelectionDish | null;
  stirfry: MenuSelectionDish | null;
};

/** Fermata della rotta pickup: bookings della stessa data+sessione (UserPage.fetchRouteData). */
export type PickupRouteStop = Pick<
  Tables<'bookings'>,
  'internal_id' | 'hotel_name' | 'route_order' | 'transport_status' | 'pickup_time'
>;
