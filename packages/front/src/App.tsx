import React, { useState, useEffect, useRef } from 'react';
// IMPORT PAGINE PUBBLICHE
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import InfoClasses from './pages/InfoClasses';
import MenuPage from './pages/Menu';
import HistoryPage from './pages/HistoryPage';
import LocationPage from './pages/LocationPage';
import AuthPage from './pages/AuthPage';
import UserPage from './pages/UserPage';
import RecipesPage from './pages/Recipes';
import BookingPage from './pages/BookingPage';
import DisplayPage from './pages/DisplayPage';

// PORTALI OPERATIVI & ADMIN
import AdminKitchenDashboard from './pages/AdminKitchenDashboard';
import AdminStoreFront from './pages/AdminStoreFront';
import AdminStoreManager from './pages/AdminStoreManager';
import AdminMarketShop from './pages/AdminMarketShop'; 
import AdminMarketRunner from './pages/AdminMarketRunner'; // 👈 NUOVO
import AdminDriverDashboard from './pages/AdminDriverDashboard';
import AdminLogistics from './pages/AdminLogistics';
import AgencyDashboard from './pages/AgencyDashboard';
import AdminCalendar from './pages/AdminCalendar';

// LAYOUT & NAVIGATION
import {
  Sidebar,
  SidebarMobile,
  AdminSidebar,
  AdminSidebarMobile
} from './components/layout/index';
import { ChatBox } from './components/chat/index';
import { authService, UserProfile } from './services/authService';
import { useViewportHeight } from './hooks/useViewportHeight';

type Page = string;

const App: React.FC = () => {
  // Hook per gestire l'altezza reale su mobile (100vh fix)
  useViewportHeight();
  
  const mainScrollRef = useRef<HTMLElement>(null);

  // --- STATO GLOBALE ---
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [page, setPage] = useState<Page>('home');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [targetSection, setTargetSection] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Gestione Tema
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // --- FUNZIONE DI AGGIORNAMENTO PROFILO ---
  const fetchUser = async () => {
    try {
      const profile = await authService.getCurrentUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // --- NAVIGAZIONE ---
  const handleNavigate = (targetPage: string, topic?: string, sectionId?: string) => {
    setPage(targetPage);
    if (sectionId) setTargetSection(sectionId);
    else setTargetSection(null);
    
    if (topic) {
      window.dispatchEvent(new CustomEvent('trigger-chat-topic', { detail: { topic } }));
    }
  };

  // Reset scroll
  useEffect(() => {
    if (!mainScrollRef.current) return;
    if (!targetSection) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [page, targetSection]);

  // --- ROUTING ---
  const renderPage = () => {
    if (isInitialLoading) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-background">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    switch (page) {
      // Pagine Pubbliche
      case 'home': return <HomePage onNavigate={handleNavigate} />;
      case 'quiz': return <QuizPage onNavigate={handleNavigate} />;
      case 'classes': return <InfoClasses onNavigate={handleNavigate} />;
      case 'recipes': return <RecipesPage onNavigate={handleNavigate} userProfile={userProfile}/> ;
      case 'history': return <HistoryPage onNavigate={handleNavigate} />;
      case 'location': return <LocationPage onNavigate={handleNavigate} />;
      case 'display': return <DisplayPage onNavigate={handleNavigate} />;
      
      // Flows Operativi Utente
      case 'booking': 
        return <BookingPage onNavigate={handleNavigate} userProfile={userProfile} onAuthSuccess={fetchUser} />;
      case 'menu': 
        return <MenuPage onNavigate={handleNavigate} userProfile={userProfile} onAuthSuccess={fetchUser} sectionId={targetSection} />;
      case 'auth': 
        return <AuthPage onNavigate={handleNavigate} onAuthSuccess={fetchUser} />;
      case 'user': 
        return <UserPage onNavigate={handleNavigate} userProfile={userProfile} onProfileRefresh={fetchUser} sectionId={targetSection} />;

      // --- ADMIN CONSOLE ---
      case 'admin-kitchen': return <AdminKitchenDashboard onNavigate={handleNavigate} />;
      case 'admin-logistics': return <AdminLogistics onNavigate={handleNavigate} />;
      case 'admin-store': return <AdminStoreFront onNavigate={handleNavigate} />;
      case 'admin-store-manager': return <AdminStoreManager />;
      case 'admin-market-plan': return <AdminMarketShop />; // (Planner)
      case 'admin-market-run': return <AdminMarketRunner />; // (Runner) 👈 NUOVO
      case 'admin-driver': return <AdminDriverDashboard onNavigate={handleNavigate} />;
      case 'admin-calendar': return <AdminCalendar onNavigate={handleNavigate} />;

      // --- B2B PORTAL ---
      case 'agency-portal': return <AgencyDashboard onNavigate={handleNavigate} userProfile={userProfile} />;

      default: return <HomePage onNavigate={handleNavigate} />;
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    setUserProfile(null);
    handleNavigate('home');
  };

  // 👇 LOGICA SIDEBAR: I Driver ora vedono il layout Admin (ma filtrato internamente)
  const isUserAdmin = ['admin', 'manager', 'driver', 'kitchen'].includes(userProfile?.role || '');

  return (
    <div className="relative w-full h-[calc(var(--vh,1vh)*100)] bg-background text-desc transition-colors duration-700 flex overflow-hidden">
      
      {/* --- SIDEBAR SWITCH BASATO SUL RUOLO --- */}
      {isUserAdmin ? (
        // 🔴 ADMIN MODE (Admin + Driver + Kitchen)
        <>
          <div className="hidden lg:flex h-full no-print z-50">
            <AdminSidebar 
              currentPage={page} 
              onNavigate={handleNavigate} 
              isOpen={isSidebarOpen} 
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
              onLogout={handleLogout}
              userProfile={userProfile} 
            />
          </div>
          <div className="no-print z-50">
            <AdminSidebarMobile 
              currentPage={page}
              onNavigate={handleNavigate}
              onExit={() => handleNavigate('home')}
              userProfile={userProfile} 
            />
          </div>
        </>
      ) : (
        // 🟢 PUBLIC MODE (Guest + Agency)
        <>
          <div className="hidden lg:flex h-full no-print z-50">
            <Sidebar 
              currentPage={page} 
              onNavigate={handleNavigate} 
              isOpen={isSidebarOpen} 
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
              userProfile={userProfile}
              onLogout={handleLogout}
            />
          </div>
          <div className="no-print z-50">
            <SidebarMobile 
              currentPage={page} 
              onNavigate={handleNavigate} 
              isDarkMode={isDarkMode} 
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
              userProfile={userProfile}
              onLogout={handleLogout}
            />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main 
        ref={mainScrollRef}
        className="flex-grow h-full overflow-y-auto overflow-x-hidden no-scrollbar relative z-10"
        id="main-scroll-container"
      >
        {renderPage()}
      </main>

      {/* Global Chat Assistant (Abilitato per TUTTI gli utenti ora!) */}
      <div className="no-print">
        <ChatBox 
          isDarkMode={isDarkMode} 
          onNavigate={handleNavigate} 
          userProfile={userProfile}
        />
      </div>
    </div>
  );
};

export default App;