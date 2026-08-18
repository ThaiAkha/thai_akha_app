import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ResetPassword from "./pages/auth/ResetPassword";
import NotFound from "./pages/common/NotFound";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AkhaPixelPattern from "./components/ui/AkhaPixelPattern";
import { ConfirmProvider } from "./components/ui/confirm/ConfirmProvider";
import { AppErrorBoundary } from "@thaiakha/shared/components/AppErrorBoundary";
import PageErrorFallback from "./components/common/PageErrorFallback";

// Lazy-loaded pages — loaded only when navigated to
const DriverRoute = lazy(() => import("./pages/driver/DriverRoute"));
const DriverHome = lazy(() => import("./pages/driver/DriverHome"));
const DriverPayout = lazy(() => import("./pages/driver/DriverPayout"));
const DriverReports = lazy(() => import("./pages/driver/DriverReports"));
const ManagerReservation = lazy(() => import("./pages/manager/ManagerReservation"));
const AdminCalendar = lazy(() => import("./pages/admin/AdminCalendar"));
const ManagerLogistic = lazy(() => import("./pages/manager/ManagerLogistic"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const ManagerPos = lazy(() => import("./pages/manager/ManagerPos"));
const ManagerHome = lazy(() => import("./pages/manager/ManagerHome"));
const MarketShop = lazy(() => import("./pages/market/MarketShop"));
const MarketRunner = lazy(() => import("./pages/market/MarketRunner"));
const AgencyReservations = lazy(() => import("./pages/agency/AgencyReservations"));
const ManagerBooking = lazy(() => import("./pages/manager/ManagerBooking"));
const ManagerReports = lazy(() => import("./pages/manager/ManagerReports"));
const AgencyBooking = lazy(() => import("./pages/agency/AgencyBooking"));
const AgencyReports = lazy(() => import("./pages/agency/AgencyReports"));
const AgencyNews = lazy(() => import("./pages/agency/AgencyNews"));
const AgencyRates = lazy(() => import("./pages/agency/AgencyRates"));
const AgencyTerms = lazy(() => import("./pages/agency/AgencyTerms"));
const AgencyPrivacy = lazy(() => import("./pages/agency/AgencyPrivacy"));
const AgencyAssets = lazy(() => import("./pages/agency/AgencyAssets"));
const AdminReport = lazy(() => import("./pages/admin/AdminReport"));
const AdminDatabase = lazy(() => import("./pages/admin/AdminDatabase"));
const AdminNews = lazy(() => import("./pages/admin/AdminNews"));
const AdminStorage = lazy(() => import("./pages/admin/AdminStorage"));
const AdminHotels = lazy(() => import("./pages/admin/AdminHotels"));
const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const AgencyHome = lazy(() => import("./pages/agency/AgencyHome"));
const AgencyDashboard = lazy(() => import("./pages/agency/AgencyDashboard"));
const KitchenHome = lazy(() => import("./pages/kitchen/KitchenHome"));
const KitchenBookings = lazy(() => import("./pages/kitchen/KitchenBookings"));
const KitchenPos = lazy(() => import("./pages/kitchen/KitchenPos"));
const LogisticHome = lazy(() => import("./pages/logistics/LogisticHome"));
const LogisticReports = lazy(() => import("./pages/logistics/LogisticReports"));
const Home = lazy(() => import("./pages/common/Home"));
const UserProfiles = lazy(() => import("./pages/common/UserProfiles"));
const ManualsPage = lazy(() => import("./pages/common/ManualsPage"));
const ComponentShowcase = lazy(() => import("./pages/admin/ComponentShowcase"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
      <AkhaPixelPattern variant="logo" size={10} speed={30} />
    </div>
  );
}

function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <ConfirmProvider>
        {/* Boundary radice: copre le route pubbliche fuori da AppLayout (signin, signup, reset). */}
        <AppErrorBoundary renderFallback={(p) => <PageErrorFallback {...p} />}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<AppLayout />}>
              {/* Admin & Manager Pages */}
              <Route path="/manager-reservation" element={<ProtectedRoute allowedRoles={['manager']}><ManagerReservation onNavigate={() => { }} /></ProtectedRoute>} />
              <Route path="/driver-home" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency', 'driver']}><DriverHome /></ProtectedRoute>} />
              <Route path="/driver-payout" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'driver']}><DriverPayout /></ProtectedRoute>} />
              <Route path="/driver-reports" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'driver']}><DriverReports /></ProtectedRoute>} />
              <Route path="/admin-reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReport /></ProtectedRoute>} />
              <Route path="/admin-hotels" element={<ProtectedRoute allowedRoles={['admin']}><AdminHotels /></ProtectedRoute>} />
              <Route path="/admin-database" element={<ProtectedRoute allowedRoles={['admin']}><AdminDatabase /></ProtectedRoute>} />
              <Route path="/admin-news" element={<ProtectedRoute allowedRoles={['admin']}><AdminNews /></ProtectedRoute>} />
              <Route path="/admin-storage" element={<ProtectedRoute allowedRoles={['admin']}><AdminStorage /></ProtectedRoute>} />
              <Route path="/admin-media" element={<ProtectedRoute allowedRoles={['admin']}><AdminMedia /></ProtectedRoute>} />
              <Route path="/admin/showcase" element={<ProtectedRoute allowedRoles={['admin']}><ComponentShowcase /></ProtectedRoute>} />

              <Route path="/agency-reservations" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyReservations /></ProtectedRoute>} />
              <Route path="/agency-booking" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyBooking /></ProtectedRoute>} />
              <Route path="/agency-reports" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyReports /></ProtectedRoute>} />
              <Route path="/agency-news" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyNews /></ProtectedRoute>} />
              <Route path="/agency-rates" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyRates /></ProtectedRoute>} />
              <Route path="/agency-terms" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyTerms /></ProtectedRoute>} />
              <Route path="/agency-privacy" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyPrivacy /></ProtectedRoute>} />
              <Route path="/agency-assets" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'agency']}><AgencyAssets /></ProtectedRoute>} />
              <Route path="/agency-home" element={<ProtectedRoute allowedRoles={['agency']}><AgencyHome /></ProtectedRoute>} />
              <Route path="/agency-dashboard" element={<ProtectedRoute allowedRoles={['agency']}><AgencyDashboard /></ProtectedRoute>} />
              <Route path="/manager-booking" element={<ProtectedRoute allowedRoles={['manager']}><ManagerBooking /></ProtectedRoute>} />
              <Route path="/manager-reports" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ManagerReports /></ProtectedRoute>} />
              <Route path="/manager-home" element={<ProtectedRoute allowedRoles={['manager']}><ManagerHome /></ProtectedRoute>} />
              <Route path="/manager-logistics" element={<ProtectedRoute allowedRoles={['manager', 'logistics']}><ManagerLogistic onNavigate={() => { }} /></ProtectedRoute>} />
              <Route path="/driver" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'driver']}><DriverRoute /></ProtectedRoute>} />
              <Route path="/market-shop" element={<ProtectedRoute allowedRoles={['manager', 'kitchen', 'logistics']}><MarketShop /></ProtectedRoute>} />
              <Route path="/admin-market-plan" element={<ProtectedRoute allowedRoles={['manager', 'kitchen', 'logistics']}><MarketShop /></ProtectedRoute>} />
              <Route path="/market-run" element={<ProtectedRoute allowedRoles={['logistics']}><MarketRunner /></ProtectedRoute>} />
              <Route path="/manager-pos" element={<ProtectedRoute allowedRoles={['manager']}><ManagerPos /></ProtectedRoute>} />

              <Route path="/admin-calendar" element={<ProtectedRoute allowedRoles={['admin']}><AdminCalendar /></ProtectedRoute>} />
              <Route path="/admin-inventory" element={<ProtectedRoute allowedRoles={['admin']}><AdminInventory /></ProtectedRoute>} />
              <Route path="/admin-home" element={<ProtectedRoute allowedRoles={['admin']}><AdminHome /></ProtectedRoute>} />

              {/* New B2B Slugs (Placeholders - using AdminHome as temporary view if specific page missing) */}
              <Route path="/admin-recipes" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AdminHome /></ProtectedRoute>} />
              <Route path="/admin-classes" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AdminHome /></ProtectedRoute>} />
              <Route path="/admin-transport" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><AdminHome /></ProtectedRoute>} />

              {/* Kitchen & Logistics Home */}
              <Route path="/kitchen-home" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen']}><KitchenHome /></ProtectedRoute>} />
              <Route path="/kitchen-shop" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen']}><MarketShop /></ProtectedRoute>} />
              <Route path="/kitchen-bookings" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen']}><KitchenBookings /></ProtectedRoute>} />
              <Route path="/kitchen-purchases" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen']}><KitchenPos /></ProtectedRoute>} />
              <Route path="/logistic-home" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'logistics']}><LogisticHome /></ProtectedRoute>} />
              <Route path="/logistic-reports" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'logistics']}><LogisticReports /></ProtectedRoute>} />

              {/* User Profile — shared across all roles */}
              <Route path="/profile" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen', 'agency', 'driver', 'logistics']}><UserProfiles /></ProtectedRoute>} />

              {/* Manuals (in-app wiki) — shared across all roles */}
              <Route path="/manuals" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen', 'agency', 'driver', 'logistics']}><ManualsPage /></ProtectedRoute>} />

              {/* Home Route — redirects each role to their own home */}
              <Route path="/" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen', 'agency', 'driver', 'logistics']}><Home /></ProtectedRoute>} />
            </Route >

            {/* Auth Layout */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes >
        </Suspense>
        </AppErrorBoundary>
        </ConfirmProvider>
      </Router >
    </>
  );
}

export default App;
