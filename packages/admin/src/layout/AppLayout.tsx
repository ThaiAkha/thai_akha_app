import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { PageHeaderProvider } from "../context/PageHeaderContext";
import { CherryProvider } from "../providers/CherryProvider";
import { AdminChatBox } from "../components/chat/AdminChatBox";
import { Suspense } from "react";
import { Outlet, useLocation } from "react-router";
import { AppErrorBoundary } from "@thaiakha/shared/components/AppErrorBoundary";
import AkhaPixelPattern from "../components/ui/AkhaPixelPattern";
import PageErrorFallback from "../components/common/PageErrorFallback";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

// Loader dell'area contenuto: sidebar e header restano visibili durante il download
// del chunk lazy (prima il Suspense unico in App.tsx svuotava tutta la pagina).
const ContentLoader: React.FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <AkhaPixelPattern variant="logo" size={10} speed={30} />
  </div>
);

const LayoutContent: React.FC = () => {
  const { isExpanded } = useSidebar();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen lg:flex">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 min-w-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isExpanded ? "lg:ml-80" : "lg:ml-[108px]"
        }`}
      >
        <AppHeader />
        <div>
          {/* Boundary di pagina (audit 2026-08, P5): un throw o un chunk fallito non
              spegne l'app; resetKey=pathname rimonta al cambio route. */}
          <AppErrorBoundary
            resetKey={pathname}
            renderFallback={(p) => <PageErrorFallback {...p} />}
          >
            <Suspense fallback={<ContentLoader />}>
              <Outlet />
            </Suspense>
          </AppErrorBoundary>
        </div>
      </div>
      <AdminChatBox />
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <PageHeaderProvider>
        <CherryProvider>
          <LayoutContent />
        </CherryProvider>
      </PageHeaderProvider>
    </SidebarProvider>
  );
};

export default AppLayout;
