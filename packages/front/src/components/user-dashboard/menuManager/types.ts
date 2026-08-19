/**
 * MenuManager - props del componente (condivise con l'hook useMenuManager).
 * Estratte da MenuManager.tsx (#16 split monstre).
 */
import type { UserDashboardBooking, DashboardMenuSelection } from '@thaiakha/shared/types';

export interface MenuManagerProps {
  bookingId: string | null;
  bookings: UserDashboardBooking[];
  onSelectBooking: (id: string) => void;
  menuSelection: DashboardMenuSelection | null;
  onNavigate: (page: string, topic?: string, sectionId?: string) => void;
}

// content_categories.id / recipes.category are SLUGS (e.g. 'authentic-akha-recipes').
// Normalize them to the short keys the UI logic uses (akha_specialty/appetizer/dessert…).
