import React, { useState, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Typography, Icon, Button } from '../ui/index';
import { UserProfile } from '../../services/authService';

interface AdminSidebarMobileProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onExit: () => void;
  userProfile?: UserProfile | null;
}

const ADMIN_MENU = [
  // Core Operations
  { id: 'calendar', label: 'Master Calendar', icon: 'calendar_month', page: 'admin-calendar' },
  { id: 'kitchen', label: 'Kitchen Prep', icon: 'skillet', page: 'admin-kitchen' },
  { id: 'market-plan', label: 'Market Reports (T/L)', icon: 'description', page: 'admin-market-plan' },
  { id: 'market-run', label: 'Start Shopping', icon: 'shopping_cart', page: 'admin-market-run' },
  { id: 'logistics', label: 'Logistics Manager', icon: 'local_shipping', page: 'admin-logistics' },
  { id: 'store', label: 'POS Store', icon: 'storefront', page: 'admin-store' },
  { id: 'inventory', label: 'Store Manager', icon: 'inventory_2', page: 'admin-store-manager' },
  { id: 'driver', label: 'Driver App', icon: 'local_taxi', page: 'admin-driver' },
  
  // Quick Actions
  { id: 'booking', label: 'New Booking', icon: 'calendar_add_on', page: 'booking' },
  { id: 'location', label: 'Location Map', icon: 'map', page: 'location' },
  
  // B2B
  { id: 'agency', label: 'Agency Portal', icon: 'business_center', page: 'agency-portal' },
];

const AdminSidebarMobile: React.FC<AdminSidebarMobileProps> = ({ currentPage, onNavigate, onExit, userProfile }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 🛡️ FILTRO MOBILE SMART
  const visibleItems = useMemo(() => {
    if (!userProfile) return [];

    const role = userProfile.role;

    if (role === 'driver') {
      return ADMIN_MENU.filter(item => item.id === 'driver' || item.id === 'market-run');
    }
    
    if (role === 'kitchen') {
      return ADMIN_MENU.filter(item => 
        item.id === 'kitchen' || 
        item.id === 'store' || 
        item.id === 'market-plan' || 
        item.id === 'inventory'
      );
    }

    // Admin e Manager vedono tutto
    return ADMIN_MENU;
  }, [userProfile]);

  const handleNav = (page: string) => {
    setIsOpen(false);
    onNavigate(page);
  };

  return (
    <div className="lg:hidden no-print">
      {/* FLOATING FAB BUTTON */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-[1] size-14 rounded-2xl bg-[#0a0a0a] border border-white/20 text-action shadow-[0_0_30px_rgba(0,0,0,0.6)] flex items-center justify-center animate-in zoom-in duration-300 hover:scale-110 active:scale-95 transition-all"
      >
        <Icon name="grid_view" size="md" />
      </button>

      {/* FULLSCREEN DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-[1001] bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="size-2 rounded-full bg-action animate-pulse" />
                <Typography variant="h4" className="text-white italic leading-none">
                  {userProfile?.role?.toUpperCase()} <span className="text-action">APP</span>
                </Typography>
              </div>
              <Typography variant="caption" className="text-white/40 tracking-widest">System 4.8 Operations</Typography>
            </div>
            <button onClick={() => setIsOpen(false)} className="size-12 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10 active:bg-white/20">
              <Icon name="close" />
            </button>
          </div>

          {/* Menu Grid */}
          <div className="flex-1 p-6 grid grid-cols-2 gap-4 content-start overflow-y-auto custom-scrollbar">
            {visibleItems.map(item => {
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.page)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border transition-all active:scale-95",
                    isActive 
                      ? "bg-white text-black border-white shadow-lg" 
                      : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                  )}
                >
                  <Icon 
                    name={item.icon} 
                    size="lg" 
                    className={cn("transition-colors", isActive ? "text-action" : "text-white/80")} 
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-white/5 pb-10">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="mineral" 
                fullWidth 
                size="lg" 
                icon="home" 
                onClick={() => handleNav('home')}
              >
                Public
              </Button>
              <Button 
                variant="mineral" 
                fullWidth 
                size="lg" 
                icon="logout" 
                onClick={onExit} 
                className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white"
              >
                Exit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebarMobile;