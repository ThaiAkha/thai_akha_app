import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { PageHeaderProvider } from "../context/PageHeaderContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const LayoutContent: React.FC = () => {
  const { isExpanded } = useSidebar();

  return (
    <div className="min-h-screen lg:flex">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isExpanded ? "lg:ml-80" : "lg:ml-[108px]"
        }`}
      >
        <AppHeader />
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <PageHeaderProvider>
        <LayoutContent />
      </PageHeaderProvider>
    </SidebarProvider>
  );
};

export default AppLayout;
