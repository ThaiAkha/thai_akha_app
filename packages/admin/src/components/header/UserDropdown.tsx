import { useState } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { LogOut, User } from "lucide-react";
import Tooltip from "../ui/Tooltip";
import { ThemeSwitcher } from "@thaiakha/shared";

export default function UserDropdown() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleSignOut = async () => {
    closeDropdown();
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="relative flex items-center h-full">
      <Tooltip content="Menu Utente" position="bottom">
        <button
          onClick={toggleDropdown}
          className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400 group h-full focus:outline-none"
        >
          {/* Desktop Name (Left of Avatar) */}
          <span className="hidden lg:block mr-3 font-black text-theme-sm text-gray-800 dark:text-white leading-none whitespace-nowrap">
            {user?.full_name || "User"}
          </span>

          {/* Avatar (Right in Desktop, Main in Mobile) */}
          <span className="shrink-0 overflow-hidden rounded-full h-10 w-10 border-2 border-brand-500/10 group-hover:border-brand-500/30 transition-all relative flex items-center justify-center bg-gray-50 dark:bg-gray-800 shadow-sm">
            <img
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=random`}
              alt="User"
              className="object-cover w-full h-full"
            />
          </span>
        </button>
      </Tooltip>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 top-full mt-3 flex w-[280px] flex-col rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-md p-2 shadow-2xl dark:border-gray-800 dark:bg-gray-900/95"
      >
        {/* Header Info */}
        <div className="px-4 py-4 mb-2 border-b border-gray-50 dark:border-gray-800/50">
          <span className="block font-black text-gray-900 text-base dark:text-white uppercase tracking-tighter leading-none">
            {user?.full_name || "User"}
          </span>
          <span className="mt-2 block text-theme-xs text-gray-400 dark:text-gray-500 truncate font-medium">
            {user?.email || ""}
          </span>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-1 px-1">
          <DropdownItem
            onItemClick={closeDropdown}
            tag="a"
            to="/profile"
            className="flex items-center gap-3 px-3 py-2.5 font-bold text-gray-600 rounded-xl group text-theme-sm hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400 transition-all"
            baseClassName="" // Clear defaults
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-brand-100 dark:group-hover:bg-brand-500/20 transition-colors">
              <User size={18} className="text-gray-400 group-hover:text-brand-500 transition-colors" />
            </div>
            <span className="flex-1">Edit profile</span>
          </DropdownItem>

          <div onClick={(e) => e.stopPropagation()}>
            <ThemeSwitcher
              isDarkMode={theme === 'dark'}
              onToggle={toggleTheme}
              variant="dropdown"
            />
          </div>
        </div>

        {/* Footer (Sign Out) */}
        <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800/50 px-1 pb-1">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 font-bold text-gray-500 rounded-xl group text-theme-sm hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 w-full text-left transition-all"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors">
              <LogOut size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
            </div>
            <span className="flex-1">Sign out</span>
          </button>
        </div>
      </Dropdown>
    </div>
  );
}
