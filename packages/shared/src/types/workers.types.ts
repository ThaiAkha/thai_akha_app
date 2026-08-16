/**
 * Staff workers (campaign Staff_Workers_2027).
 * `profiles` = WHO CAN (login, permissions, RLS) · `authors` = WHO IS (the person).
 * A person can wear several hats: one `worker_roles` row per role.
 * Sensitive pay data lives in `staff_details` (admin/manager only via RLS),
 * NEVER in `authors` (public read). Legacy columns not to be used in new code:
 * authors.app_role, authors.staff_group, authors.salary_thb, profiles.base_salary.
 */
export const WORKER_ROLES = ['teacher', 'helper', 'extra', 'setup', 'logistics', 'driver', 'manager', 'admin'] as const;
export type WorkerRole = typeof WORKER_ROLES[number];

export interface Worker {
  /** authors.id */
  id: string;
  name: string;
  avatarAssetId: string | null;
  avatarUrl: string | null;
  /** True when one of the requested roles is this person's primary hat. */
  isPrimary: boolean;
  /** Roles matched by the query (subset of the person's hats when filtered). */
  roles: WorkerRole[];
  displayOrder: number;
  /** profiles.id when the person has a personal login (auto-bypass in selectors). */
  profileId: string | null;
}
