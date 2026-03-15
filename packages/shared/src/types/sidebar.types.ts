/**
 * Sidebar Type Definitions
 * Shared interfaces for database structures and component props
 */

/**
 * Menu item from database
 * Matches site_metadata table structure
 */
export interface SidebarMenuItem {
  id: string;
  page_slug: string;
  menu_label: string;
  header_icon: string;
  menu_order: number;
  access_level: 'public' | 'user' | 'admin' | 'agency';
  header_badge?: string;
  is_highlighted?: boolean;
}

/**
 * Internal NavItem structure for admin app
 * Used after transforming database items
 */
export interface AdminNavItem {
  name: string;
  icon: string;
  path: string;
  allowedRoles?: string[];
}

/**
 * Convert database MenuItem to admin NavItem
 */
export function menuItemToAdminNavItem(item: SidebarMenuItem): AdminNavItem {
  return {
    name: item.menu_label,
    icon: item.header_icon || 'LayoutDashboard',
    path: `/${item.page_slug}`,
    allowedRoles: item.access_level ? [item.access_level] : [],
  };
}

/**
 * Access level permissions
 * Maps database access_level to role-based filtering
 */
export const ACCESS_LEVELS = {
  PUBLIC: 'public',
  USER: 'user',
  ADMIN: 'admin',
  AGENCY: 'agency',
} as const;

export type AccessLevel = typeof ACCESS_LEVELS[keyof typeof ACCESS_LEVELS];

/**
 * Check if user role can access menu item
 */
export function canAccessMenuItem(
  itemAccessLevel: AccessLevel,
  userRole?: string
): boolean {
  // No access level specified = always visible (public)
  if (!itemAccessLevel || itemAccessLevel === ACCESS_LEVELS.PUBLIC) {
    return true;
  }

  // Specific access level = user must be logged in with matching role
  if (!userRole) {
    return false;
  }

  return userRole.toLowerCase() === itemAccessLevel.toLowerCase();
}

/**
 * Filter menu items by user role
 */
export function filterMenuItemsByRole(
  items: SidebarMenuItem[],
  userRole?: string
): SidebarMenuItem[] {
  return items.filter((item) => {
    const level = (item.access_level || 'public') as AccessLevel;
    return canAccessMenuItem(level, userRole);
  });
}
