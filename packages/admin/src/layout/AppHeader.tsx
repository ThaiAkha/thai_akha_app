import { useEffect } from "react";
import { useSidebar } from "../context/SidebarContext";
import UserDropdown from "../components/header/UserDropdown";
import { usePageHeader } from "../context/PageHeaderContext";
import { useLocation } from "react-router";
import { contentService } from "../services/content.service";
import { Menu, X } from "lucide-react";
import Tooltip from "../components/ui/Tooltip";

const AppHeader: React.FC = () => {
  const { title, titleHighlight, setPageHeader } = usePageHeader();
  const location = useLocation();

  useEffect(() => {
    const fetchMetadata = async () => {
      const slug = location.pathname.substring(1) || "home";
      const metadata = await contentService.getPageMetadata(slug);
      if (metadata) {
        setPageHeader(
          metadata.titleMain || metadata.badge || "Dashboard",
          metadata.titleHighlight || ""
        );
      } else {
        console.warn(`⚠️ No metadata found in database for route: /${slug}`);
      }
    };
    fetchMetadata();
  }, [location.pathname, setPageHeader]);

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 w-full h-[65px] flex items-center bg-white border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900 z-40 shadow-sm px-4 lg:px-6">
      <div className="flex items-center justify-between w-full h-full gap-2">

        {/* Left: Hamburger (Fixed width to balance center title) */}
        <div className="flex items-center justify-start min-w-[40px] lg:w-64 shrink-0 h-full">
          <Tooltip content="Toggle Menu" position="bottom">
            <button
              className="flex items-center justify-center w-10 h-10 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg dark:text-gray-400 transition-colors"
              onClick={handleToggle}
              aria-label="Toggle Sidebar"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </Tooltip>
        </div>

        {/* Center: Title (Always centered) */}
        <div className="flex-1 flex justify-center min-w-0">
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-tighter text-gray-800 dark:text-white leading-tight truncate text-center">
            {title} {titleHighlight && <span className="text-brand-600 font-black">{titleHighlight}</span>}
          </h1>
        </div>

        {/* Right: User Avatar Dropdown (Fixed width to balance center title) */}
        <div className="flex items-center justify-end min-w-[40px] lg:w-64 shrink-0 h-full">
          <UserDropdown />
        </div>

      </div>
    </header>
  );
};

export default AppHeader;