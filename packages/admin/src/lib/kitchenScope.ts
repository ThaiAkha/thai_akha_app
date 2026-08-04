// MULTI-KITCHEN (scope A) — regola di isolamento per kitchen in UN SOLO posto.
// Scelta A = isolamento via app (staff interno fidato); l'RLS resta invariata.
//
// Un utente con role='kitchen' È esso stesso una cucina: il suo profile.id coincide
// con bookings.kitchen_id. La teacher loggata deve vedere/usare solo i booking della
// propria kitchen; admin/manager vedono tutto (vista piena → null = nessun filtro).
import type { UserRole } from '@thaiakha/shared/types';

export function kitchenScope(
  user: { id: string; role: UserRole | string } | null | undefined,
): string | null {
  return user && user.role === 'kitchen' ? user.id : null;
}
