import { useEffect, useCallback } from "react";
import { useSidebar } from "../context/SidebarContext";
import UserDropdown from "../components/header/UserDropdown";
import { usePageHeader } from "../context/PageHeaderContext";
import { useLocation } from "react-router";
import { contentService } from "@thaiakha/shared/services";
import { Menu, X, ExternalLink } from "lucide-react";
import Tooltip from "../components/ui/Tooltip";
import { supabase } from "@thaiakha/shared/lib/supabase";

const FRONT_APP_URL = import.meta.env.VITE_FRONT_APP_URL || 'http://localhost:3000';

const AppHeader: React.FC = () => {
  const { title, titleHighlight, setPageHeader } = usePageHeader();
  const location = useLocation();

  useEffect(() => {
    const fetchMetadata = async () => {
      const slug = location.pathname.substring(1) || "home";
      const metadata = await contentService.getPageMetadata(slug, 'site_metadata_admin');
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

  /**
   * Hand-off the current Supabase session to the front app via URL tokens.
   * The front app will pick up #access_token&refresh_token and call setSession().
   */
  const handleGoToLiveWeb = useCallback(async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && session?.refresh_token) {
        // Pass tokens in the URL fragment (never in query string — it looks cleaner & avoids server logs)
        const url = `${FRONT_APP_URL}#access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}&token_type=bearer`;
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        // No active session — just open the front app normally
        window.open(FRONT_APP_URL, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.open(FRONT_APP_URL, '_blank', 'noopener,noreferrer');
    }
  }, []);

  return (
    <header className="sticky top-0 w-full h-[65px] flex items-center bg-white border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900 z-40 shadow-sm px-4 lg:px-6">
      <div className="flex items-center justify-between w-full h-full gap-2">

        {/* Left: Hamburger + Live Web Link */}
        <div className="flex items-center justify-start min-w-[40px] lg:w-64 shrink-0 h-full gap-2">
          <Tooltip content="Toggle Menu" position="bottom">
            <button
              className="flex items-center justify-center w-10 h-10 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg dark:text-gray-400 transition-colors"
              onClick={handleToggle}
              aria-label="Toggle Sidebar"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </Tooltip>

          {/* Go to Live web */}
          <Tooltip content="Open Live Website" position="bottom">
            <a
              href={FRONT_APP_URL}
              onClick={handleGoToLiveWeb}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-bold text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-full border border-gray-200 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400 transition-all no-underline shrink-0"
            >
              <ExternalLink size={13} className="shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Live web</span>
            </a>
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