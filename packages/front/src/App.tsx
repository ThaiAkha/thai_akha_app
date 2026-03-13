import React, { useState, useEffect, useRef, useMemo } from 'react';
// Importiamo supabase per la gestione sessione
import { supabase } from '@thaiakha/shared/lib/supabase';
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



// LAYOUT & NAVIGATION
import {
  Sidebar,
  SidebarMobile,
  SEOHead,
} from './components/layout/index';
import { ChatBox } from './components/chat/index';
import { authService, UserProfile } from './services/auth.service';
import { useViewportHeight } from './hooks/useViewportHeight';

type Page = string;

const App: React.FC = () => {
  // Hook per gestire l'altezza reale su mobile (100vh fix)
  useViewportHeight();

  const mainScrollRef = useRef<HTMLElement>(null);

  // --- STATO GLOBALE ---
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Deriviamo 'page' dall'URL o dallo stato iniziale
  const getPageFromPath = () => {
    const path = window.location.pathname.split('/')[1];
    return path || 'home';
  };

  const [page, setPage] = useState<Page>(getPageFromPath());

  // Ascoltiamo i tasti Avanti/Indietro del browser
  useEffect(() => {
    const handlePopState = () => {
      setPage(getPageFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
    const bootstrap = async () => {
      // --- SESSION HAND-OFF (from Admin App) ---
      // If the admin app passed tokens in the URL fragment, restore the session first.
      const hash = window.location.hash;
      if (hash.includes('access_token=')) {
        try {
          const params = new URLSearchParams(hash.slice(1)); // strip the leading '#'
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        } catch (e) {
          console.warn('[Front] Session hand-off failed:', e);
        } finally {
          // Clean the tokens from the URL so they aren't accidentally shared
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
      // --- NORMAL PROFILE FETCH ---
      await fetchUser();
    };
    bootstrap();
  }, []);

  // --- NAVIGAZIONE ---
  const handleNavigate = (targetPage: string, topic?: string, sectionId?: string) => {
    const path = targetPage === 'home' ? '/' : `/${targetPage}`;
    window.history.pushState({}, '', path);
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
      case 'recipes': return <RecipesPage onNavigate={handleNavigate} userProfile={userProfile} />;
      case 'history': return <HistoryPage onNavigate={handleNavigate} />;
      case 'location': return <LocationPage onNavigate={handleNavigate} />;

      // Flows Operativi Utente
      case 'booking':
        return <BookingPage onNavigate={handleNavigate} userProfile={userProfile} onAuthSuccess={fetchUser} />;
      case 'menu':
        return <MenuPage onNavigate={handleNavigate} userProfile={userProfile} onAuthSuccess={fetchUser} sectionId={targetSection} />;
      case 'auth':
        return <AuthPage onNavigate={handleNavigate} onAuthSuccess={fetchUser} />;
      case 'user':
        return <UserPage onNavigate={handleNavigate} userProfile={userProfile} onProfileRefresh={fetchUser} sectionId={targetSection} />;

      default: return <HomePage onNavigate={handleNavigate} />;
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    setUserProfile(null);
    handleNavigate('home');
  };

  return (
    <div className="relative w-full h-[calc(var(--vh,1vh)*100)] bg-background text-desc transition-colors duration-700 flex overflow-hidden">
      <SEOHead />

      {/* --- SIDEBAR --- */}
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