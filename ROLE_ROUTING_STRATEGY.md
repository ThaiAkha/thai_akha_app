# Role Routing Strategy - Front App vs Admin App

## The Problem

Currently, both apps accept the same roles (admin, manager, driver, kitchen, agency) but should behave completely differently:

```
WRONG FLOW (Current):
┌─────────────────────┐        ┌──────────────────────┐
│   FRONT APP         │        │   ADMIN APP          │
│  (Customer UI)      │        │  (Operations UI)     │
├─────────────────────┤        ├──────────────────────┤
│ Login: admin        │        │ Login: admin         │
│ → AdminKitchen*     │        │ → Admin Dashboard ✓  │
│ (Confusing!)        │        │                      │
│                     │        │ Login: driver        │
│ Login: agency       │        │ → Driver Console ✓   │
│ → AgencyPortal*     │        │                      │
│ (Incomplete!)       │        │ Login: agency        │
│                     │        │ → Agency Portal ✓    │
│ Login: guest        │        │                      │
│ → UserPage ✓        │        │ (Staff can't access) │
└─────────────────────┘        └──────────────────────┘

*These are duplicates with partial features
```

**The Core Issue:**
1. **Separation of Concerns Broken**: Admin staff using front app as customer creates confusion
2. **Role Ambiguity**: Agency role appears in BOTH apps but with different purposes
3. **Duplicate Code**: AdminKitchen, AgencyDashboard exist in BOTH (wasting LOC)
4. **User Confusion**: If manager logs into front, they see UserPage (not what they expect)
5. **Data Visibility**: Agency sees all bookings in front (could be overwhelming)

---

## Proposed Architecture

### **Strategy: Separate Apps by User Type**

#### **FRONT APP** (Customer-Facing PWA)
**Purpose**: Booking, menu exploration, customer dashboard, payment

**Who Can Access:**
- `guest` - Browse-only customers
- `customer` - Registered customers (post-login)

**No Access:**
- ❌ admin, manager, driver, kitchen, logistics, agency
- ✅ If they log in → Redirect to ADMIN app

**Login Redirect Logic:**
```typescript
if (['admin', 'manager', 'driver', 'kitchen', 'logistics', 'agency'].includes(profile?.role)) {
  // Staff roles: redirect to admin app
  const adminUrl = import.meta.env.VITE_ADMIN_APP_URL || 'http://localhost:3001';
  window.location.href = `${adminUrl}?token=${user.id}&app=admin`;
} else {
  // guest or customer
  onNavigate('user');  // UserPage ✓
}
```

---

#### **ADMIN APP** (Operations Dashboard)
**Purpose**: Booking management, logistics, kitchen operations, reports

**Who Can Access:**
- `admin` - Full system access
- `manager` - Booking + logistics management
- `driver` - Route console
- `kitchen` - Kitchen orders
- `logistics` - Logistics management
- `agency_operator` - Manage own bookings, commissions, B2B portal

**No Access:**
- ❌ guest, customer, agency_customer (not staff)

**Login Behavior:**
- Each role sees appropriate dashboard (existing behavior ✓)
- No duplicate pages

---

## Role Matrix - Where Users Go

```
LOGIN LOCATION          ROLE                 DESTINATION              APP
─────────────────────────────────────────────────────────────────────────
FRONT (www.thaiakha.com)
                        guest                Browse-Only              Front
                        customer             UserPage (menu, profile) Front
                        admin ⚠️             → Redirect to ADMIN      Admin
                        manager              → Redirect to ADMIN      Admin
                        driver               → Redirect to ADMIN      Admin
                        kitchen              → Redirect to ADMIN      Admin
                        logistics            → Redirect to ADMIN      Admin
                        agency                → Redirect to ADMIN      Admin
─────────────────────────────────────────────────────────────────────────
ADMIN (admin.thaiakha.com)
                        admin                Admin Dashboard          Admin
                        manager              Manager Dashboard        Admin
                        driver               Driver Console           Admin
                        kitchen              Kitchen Orders           Admin
                        logistics            Logistics Dashboard      Admin
                        agency               Agency B2B Portal        Admin
                        customer ⚠️          → Error 403 (not staff)  Admin
                        guest                → Error 403 (not staff)  Admin
```

---

## Implementation Plan

### Phase 1: Update FRONT App Auth

**File: `packages/front/src/components/auth/AuthForm.tsx`**

Replace lines 48-55 with:

```typescript
if (activeTab === 'login') {
  const { user } = await authService.signIn(email, password);
  if (user) {
    const profile = await authService.getCurrentUserProfile();
    onSuccess();

    // Separate routing: staff → admin app, customers → front app
    if (['admin', 'manager', 'driver', 'kitchen', 'logistics', 'agency_operator'].includes(profile?.role)) {
      // Redirect to admin app
      const adminUrl = import.meta.env.VITE_ADMIN_APP_URL || 'http://localhost:3001';
      window.location.href = `${adminUrl}?token=${user.id}&app=admin`;
    } else if (profile?.role === 'agency_customer') {
      onNavigate('agency_booking_portal');  // NEW: Agency customer portal
    } else {
      // guest or customer
      onNavigate('user');
    }
  }
}
```

**Add to `.env.example`:**
```
VITE_ADMIN_APP_URL=http://localhost:3001
```

### Phase 2: Delete Admin Pages from FRONT

**Delete these files completely:**
```bash
# Pages (9 files)
rm packages/front/src/pages/AdminCalendar.tsx
rm packages/front/src/pages/AdminDriverDashboard.tsx
rm packages/front/src/pages/AdminKitchenDashboard.tsx
rm packages/front/src/pages/AdminLogistics.tsx
rm packages/front/src/pages/AdminMarketRunner.tsx
rm packages/front/src/pages/AdminMarketShop.tsx
rm packages/front/src/pages/AdminStoreFront.tsx
rm packages/front/src/pages/AdminStoreManager.tsx
rm packages/front/src/pages/AgencyDashboard.tsx

# Components (9+ files)
rm -rf packages/front/src/components/admin/
rm packages/front/src/components/layout/AdminPageLayout.tsx
rm packages/front/src/components/layout/AdminSidebar.tsx
rm packages/front/src/components/layout/AdminSidebarMobile.tsx
rm packages/front/src/components/layout/AdminThreeColumnLayout.tsx
```

**Update `packages/front/src/App.tsx`:**
```typescript
// REMOVE these imports (lines 16-24)
// import AdminKitchenDashboard from './pages/AdminKitchenDashboard';
// import AdminStoreFront from './pages/AdminStoreFront';
// ... etc

// REMOVE these imports (lines 30-31)
// import {
//   AdminSidebar,
//   AdminSidebarMobile
// } from './components/layout/index';

// KEEP ONLY these (lines 28-32 become 28-30):
import {
  Sidebar,
  SidebarMobile,
} from './components/layout/index';

// REMOVE these cases from switch (lines 124-134)
// case 'admin-kitchen': ...
// case 'admin-logistics': ...
// ... etc

// SIMPLIFY isUserAdmin logic (line 147):
// Remove: const isUserAdmin = ['admin', 'manager', 'driver', 'kitchen'].includes(userProfile?.role || '');
// Admin staff won't reach here anymore, so no need to show AdminSidebar
// Just use regular Sidebar for everyone
```

---

## Role Type - Simplified Model

In `packages/shared/src/types/auth.types.ts`, the existing role enum is already correct:

```typescript
export type UserRole =
  // Staff Roles (Admin App only)
  | 'admin'
  | 'manager'
  | 'driver'
  | 'kitchen'
  | 'logistics'
  | 'agency'      // B2B partner managing bookings (staff level)

  // Customer Roles (Front App only)
  | 'customer'    // Individual booking
  | 'guest';      // Browse-only

// The distinction is handled by APP ROUTING:
// - Staff roles (including 'agency') → ADMIN app
// - Customer roles → FRONT app (with RLS filtering for data visibility)
```

**Key Principle:**
- **Agency role** is a **staff role** - they log into the ADMIN app to manage B2B bookings
- Customers never get 'agency' role; they get 'customer' or 'guest'
- Data visibility is controlled by **Supabase RLS policies**, not role names

---

## Benefits of This Approach

| Aspect | Before | After |
|--------|--------|-------|
| **Code Duplication** | 3,200 LOC admin pages in front | ✓ Removed completely |
| **User Confusion** | Admin/agency staff sees UserPage | ✓ Redirected to Admin App |
| **Role Clarity** | 'agency' role ambiguous | ✓ Clear: agency = staff role |
| **Separation of Concerns** | Mixed customer + staff UI | ✓ Each app has single responsibility |
| **Scale** | Hard to maintain 2 admin UIs | ✓ Single source of truth in Admin App |
| **Security** | Staff can access customer pages | ✓ Role-based app access |
| **Database RLS** | No need for complex role splits | ✓ App routing + RLS policies handle access |

---

## Migration Checklist

**Phase 1: Update Routing**
- [ ] Update `.env.example` with VITE_ADMIN_APP_URL
- [ ] Update AuthForm.tsx with redirect logic

**Phase 2: Delete Admin Pages from Front**
- [ ] Delete 9 admin pages from packages/front/src/pages/
- [ ] Delete 9 admin-only components from packages/front/src/components/
- [ ] Update App.tsx to remove admin routes and imports

**Phase 3: Verify & Test**
- [ ] Build admin app: `pnpm --filter admin build`
- [ ] Build front app: `pnpm --filter front build`
- [ ] Test front:
  - [ ] guest login → UserPage ✓
  - [ ] customer login → UserPage ✓
  - [ ] admin login → Redirect to ADMIN_APP_URL ✓
  - [ ] agency login → Redirect to ADMIN_APP_URL ✓
- [ ] Test admin:
  - [ ] admin login → Admin Dashboard ✓
  - [ ] agency login → Agency B2B Portal ✓
- [ ] Verify no broken imports or dead code

**Phase 4: Cleanup & Commit**
- [ ] Delete ADMIN_PAGES_CLEANUP.md (no longer needed)
- [ ] Update documentation (README, guides)
- [ ] Commit with detailed message
- [ ] Deploy both apps together

---

## Implementation Notes

1. **Agency Access**:
   - Agencies are **staff users** with 'agency' role
   - They log into **ADMIN app** for B2B bookings and commission management
   - They do NOT access FRONT app (no 'agency_customer' role exists)
   - If needed in future, create separate 'customer' profiles for their own team members

2. **Authentication Method**:
   - Using simple redirect: detect staff role → redirect to ADMIN_APP_URL
   - Pass auth token in URL query param for SSO
   - Alternative: Use shared session between apps (same domain, shared cookies)

3. **Database Structure**:
   - Single Supabase project shared by both apps
   - Single `profiles` table with role enum
   - RLS policies control data visibility per app
   - No role name split needed

4. **Backwards Compatibility**:
   - Existing 'agency' users continue working as-is
   - They redirect to ADMIN app on login (no breaking change)
   - All B2B features work in ADMIN app as before

---

## Recommended Next Steps

**Execute in order:**
1. Make decision on Option A vs B (roles)
2. Decide agency handling (both apps or admin only)
3. Execute Phase 1 (AuthForm update)
4. Execute Phase 2 (Delete admin pages)
5. Execute Phase 3 (New agency portal if needed)
6. Test thoroughly
7. Deploy together

This will result in:
- ✅ **FRONT**: Pure customer experience, no staff confusion
- ✅ **ADMIN**: Pure operations experience, staff only
- ✅ **3,200 LOC removed** from front app
- ✅ **Clear role boundaries**
- ✅ **Better UX** for all users
