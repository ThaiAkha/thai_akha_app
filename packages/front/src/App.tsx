import React, { lazy, Suspense, useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
// Importiamo supabase per la gestione sessione
import { supabase } from '@thaiakha/shared/lib/supabase';
import { useQueryClient } from '@thaiakha/shared/query';
// PAGINE: la tabella delle route (lazy, code splitting) vive in lib/routes.tsx (#87).
import { findRoute, routeSlug, isBookingRedirectRole, ADMIN_ROLES, NO_BOOKING_ROLES, ADMIN_URL, type NavigateFn } from './lib/routes';
// Recovery password: schermo a se', fuori dalla shell (non e' una route).
const ResetPasswordRecovery = lazy(() => import('./components/auth/ResetPasswordRecovery'));

// LAYOUT & NAVIGATION
import {
  Sidebar,
  SidebarMobile,
  SEOHead,
} from './components/layout/index';
import PageLoader from './components/layout/PageLoader';
import { AppErrorBoundary } from '@thaiakha/shared/components/AppErrorBoundary';
import PageErrorFallback from './components/layout/PageErrorFallback';
import { ChatBox, CherryProvider } from './components/chat/index';
import { authService, UserProfile } from './services/auth.service';
import { ActiveProfileProvider } from './context/ActiveProfileContext';



// Canonical SEO slugs — single source in lib/pageSlugs.ts, condivisa con SEOHead.
import { PAGE_SLUGS } from './lib/pageSlugs';
import { LEGACY_SLUG_MAP } from './lib/legacySlugMap';

// Alias interni → slug canonico inglese per handleNavigate. Nome esteso per non
// confondersi con `slugMap` del LanguageProvider (registro delle traduzioni).
const NAV_SLUG_ALIASES: Record<string, string> = {
  ...PAGE_SLUGS,
  'terms': 'booking-terms-conditions',
  'privacy': 'privacy-policy',
};
import { useLanguage } from './context/LanguageContext';
import { buildLangPath } from './lib/langRouting';

// Loader di pagina: UN componente (components/layout/PageLoader) per il fallback
// <Suspense> del chunk lazy, per il gate profilo e per PageLayout in attesa dei
// dati. Sono tre montaggi diversi dell'albero React, quindi "stesso elemento" da
// solo non basta: il box e' identico e la fioritura legge un orologio condiviso
// (AkhaPixelPattern), cosi' il loader che subentra riprende dalla stessa fase.
// Prima erano due componenti diversi che si concatenavano con salto di posizione,
// tinta e testo ("doppio AkhaLoader", chiuso 2026-09-05).

const App: React.FC = () => {
  // Hook per gestire l'altezza reale su mobile (100vh fix)

  const mainScrollRef = useRef<HTMLElement>(null);
  // Timestamp dell'ultimo fetch profilo: throttle del refresh su visibilitychange
  // per evitare chiamate (e re-render da nuova reference profilo) a ogni cambio-tab.
  const lastProfileFetchRef = useRef<number>(0);

  // --- STATO GLOBALE ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : true;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);


  // ── ROUTING ──────────────────────────────────────────────────────────────
  // I segmenti arrivano dal LanguageProvider GIÀ senza prefisso lingua e GIÀ
  // tradotti in inglese: da qui in giù l'app ragiona solo in slug inglesi, che
  // sono l'identità con cui si legge il DB. Chi naviga in spagnolo vede URL
  // spagnoli, ma `page` resta 'authentic-thai-akha-recipes' come sempre.
  const { lang, enSegments, slugMap } = useLanguage();

  const urlState = useMemo(() => {
    const parts = enSegments;
    const rawPage = parts[0] || 'home';
    const page = LEGACY_SLUG_MAP[rawPage] || rawPage;
    // La tabella dice se questa route ha un sotto-slug (recipe, news, categoria...):
    // niente piu' lista di 13 confronti qui.
    const rawSlug = routeSlug(findRoute(page), parts[1]);
    return {
      page,
      slug: rawSlug ? (LEGACY_SLUG_MAP[rawSlug] || rawSlug) : null,
    };
  }, [enSegments]);

  const page = urlState.page;
  const targetSection = urlState.slug;

  // targetSection è ora derivato da urlState.slug
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Gestione Tema
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.classList.toggle('light', !isDarkMode); // evita html:not(.light) override
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // --- FUNZIONE DI AGGIORNAMENTO PROFILO ---
  // useCallback: e' una dipendenza di handleNavigate e delle route (refreshProfile),
  // deve avere identita' stabile per non far ri-renderizzare le pagine a ogni tick.
  const fetchUser = useCallback(async () => {
    lastProfileFetchRef.current = Date.now();
    try {
      const profile = await authService.getCurrentUserProfile();

      if (profile && (profile.role as string) !== 'guest_virtual') {
        setUserProfile(profile);
      } else {
        // GUEST PERSISTENCE: Carica preferenze da localStorage senza simulare un login
        const localRaw = localStorage.getItem('thai_akha_guest_passport');
        if (localRaw) {
          try {
            const storedPassport = JSON.parse(localRaw);
            setUserProfile({
              id: 'guest',
              role: 'guest_virtual', // Role speciale per distinguere l'ospite con preferenze
              dietary_profile: storedPassport.dietary_profile || 'diet_regular',
              allergies: storedPassport.allergies || [],
              preferred_spiciness_id: storedPassport.preferred_spiciness_id || 2,
              full_name: 'Guest',
              // Virtual guest has no email: partial profile by design (only passport fields)
            } as unknown as UserProfile);
          } catch {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

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
  }, [fetchUser]);

  // --- ENERGY SAVING: Visibility API ---
  // Monitoriamo la visibilità per sospendere operazioni pesanti o polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh silenzioso del profilo, ma throttled: i cambi-tab rapidi
        // non rifanno la chiamata (evita re-render da nuova reference profilo).
        if (Date.now() - lastProfileFetchRef.current < 60_000) return;
        fetchUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchUser]);

  // --- NAVIGAZIONE ---
  // Memoizzata (#87): passa a Sidebar, ChatBox e a ogni pagina; senza useCallback
  // ogni render di App creava una funzione nuova e invalidava memo/effetti a valle.
  // Il ruolo staff si legge da un ref per non rimettere il profilo tra le dipendenze.
  const profileRoleRef = useRef<string | null>(null);
  useEffect(() => { profileRoleRef.current = userProfile?.role ?? null; }, [userProfile]);

  const handleNavigate = useCallback<NavigateFn>((targetPage, topic, sectionId) => {
    // Handle composite paths like 'news/slug' passed as a single string
    if (!sectionId && targetPage.includes('/')) {
      const slashIdx = targetPage.indexOf('/');
      return handleNavigate(targetPage.slice(0, slashIdx), topic, targetPage.slice(slashIdx + 1));
    }

    const role = profileRoleRef.current;
    if ((targetPage === 'booking' || targetPage === 'book-cooking-class-chiang-mai') && role) {
      // Staff with an admin booking page → open it; other staff → front home.
      if (ADMIN_ROLES.has(role)) {
        window.open(`${ADMIN_URL}/booking`, '_blank', 'noopener,noreferrer');
        return;
      }
      if (NO_BOOKING_ROLES.has(role)) {
        return handleNavigate('home');
      }
    }

    const urlPage = NAV_SLUG_ALIASES[targetPage] || targetPage;
    // I link nascono SEMPRE in slug inglesi; buildLangPath li localizza e mette
    // il prefisso lingua. In inglese (o a flag spento) restituisce esattamente il
    // path di prima — nessuna differenza rispetto a oggi.
    const enSegs = targetPage === 'home'
      ? []
      : (sectionId ? [urlPage, sectionId] : [urlPage]);
    const path = buildLangPath(lang, enSegs, slugMap);

    window.history.pushState({}, '', path);
    // Notify sub-page listeners (e.g. HistoryPage) that a root navigation occurred.
    // pushState does NOT fire popstate, so we dispatch it manually.
    // Il LanguageProvider ascolta lo stesso evento e ricalcola `enSegments`:
    // da lì `urlState` si aggiorna da solo (non c'è più uno stato duplicato).
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));

    if (topic) {
      window.dispatchEvent(new CustomEvent('trigger-chat-topic', { detail: { topic } }));
    }
  }, [lang, slugMap]);

  // ── Redirect staff su /booking (audit 2026-08 #87) ────────────────────────
  // Effetto, non render: aprire l'admin e riscrivere l'URL dentro renderPage()
  // era un side effect in render (doppio in StrictMode, invisibile ai test).
  // replaceState + popstate: il LanguageProvider ricalcola enSegments → page='home'.
  useEffect(() => {
    if (isInitialLoading || !userProfile) return;
    if (page !== 'booking' && page !== 'book-cooking-class-chiang-mai') return;
    if (!isBookingRedirectRole(userProfile)) return;
    if (ADMIN_ROLES.has(userProfile.role)) {
      window.open(`${ADMIN_URL}/booking`, '_blank', 'noopener,noreferrer');
    }
    window.history.replaceState({}, '', buildLangPath(lang, [], slugMap));
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  }, [page, isInitialLoading, userProfile, lang, slugMap]);

  // ── Scroll reset ──────────────────────────────────────────────────────────
  // useLayoutEffect fires synchronously BEFORE the browser paints, so the
  // scroll container is reset to 0 before the user ever sees the new page.
  // Anchor scrolling on the home page is still handled separately with useEffect.
  useLayoutEffect(() => {
    const container = mainScrollRef.current;
    if (!container) return;

    // On the home page, targetSection is a DOM anchor, not a page slug.
    // We only reset here; the anchor scroll is handled below in useEffect.
    container.scrollTop = 0;
  }, [page, targetSection]);

  // Anchor scroll on Home page (needs DOM to be painted first)
  useEffect(() => {
    if (page !== 'home' || !targetSection) return;
    setTimeout(() => {
      const element = document.getElementById(targetSection);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [page, targetSection]);

  // --- ROUTING ---
  // Router puro (#87): la route viene dalla tabella; qui solo il gate profilo.
  // Le pagine PUBBLICHE si renderizzano subito: non dipendono dal profilo, quindi
  // non aspettano fetchUser(). Le route con gate 'profile' (user/booking/menu/
  // join-group) mostrano <PageLoader/> finché isInitialLoading è true; booking
  // per lo staff resta sul loader finche' l'effetto di redirect non ha girato.
  const route = findRoute(page) ?? findRoute('home')!;
  const routeCtx = useMemo(() => ({
    slug: targetSection,
    userProfile,
    onNavigate: handleNavigate,
    refreshProfile: fetchUser,
  }), [targetSection, userProfile, handleNavigate, fetchUser]);

  const renderPage = () => {
    if (route.gate === 'profile' && isInitialLoading) return <PageLoader />;
    return route.render(routeCtx) ?? <PageLoader />;
  };

  const queryClient = useQueryClient();
  const handleLogout = useCallback(async () => {
    await authService.signOut();
    // Le query con dati dell'utente hanno chiave con prefisso 'user' (compagni, punteggio
    // quiz): si tolgono qui, come l'admin fa col clear() (CLAUDE.md #17). Non tutto:
    // menu, pagine e media sono pubblici e svuotarli farebbe sparire la sidebar un istante.
    queryClient.removeQueries({ queryKey: ['user'] });
    setUserProfile(null);
    handleNavigate('home');
  }, [handleNavigate, queryClient]);

  // Password recovery deep-link: the reset email lands on `/reset-password?token_hash=…&type=recovery`.
  // Render a dedicated full-screen recovery screen (verifyOtp + set new password), bypassing the app shell.
  const recoveryParams = new URLSearchParams(window.location.search);
  const recoveryTokenHash = recoveryParams.get('type') === 'recovery' ? recoveryParams.get('token_hash') : null;
  if (recoveryTokenHash) {
    return (
      <Suspense fallback={<div className="min-h-[calc(var(--vh,1vh)*100)] bg-background" />}>
        <ResetPasswordRecovery
          tokenHash={recoveryTokenHash}
          onDone={() => { window.history.replaceState({}, '', '/'); handleNavigate('auth'); }}
        />
      </Suspense>
    );
  }

  return (
    <div className="relative w-full lg:h-[calc(var(--vh,1vh)*100)] bg-background text-title transition-colors duration-700 flex lg:overflow-hidden">
      <SEOHead />

      {/* CherryProvider: 1 sola istanza di stato Cherry condivisa da ChatBox
          laterale e CherryInlineChat (FAQ) → sync live + memoria attiva.
          key sull'identità: al login/logout il provider si rimonta → sessione
          nuova, messaggi azzerati, greeting reset, voce chiusa (no leak tra utenti). */}
      <CherryProvider key={userProfile?.id ?? 'guest'} userProfile={userProfile}>

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
        className="flex-grow lg:h-full lg:overflow-y-auto overflow-x-hidden no-scrollbar relative z-10"
        id="main-scroll-container"
      >
        {/* Boundary di pagina (audit 2026-08, P5): un throw o un chunk lazy fallito non
            spegne piu' tutta l'app; resetKey=page rimonta al cambio route. */}
        <AppErrorBoundary
          resetKey={page}
          renderFallback={(p) => <PageErrorFallback {...p} />}
        >
          {/* ActiveProfileProvider a livello shell (#87): un solo stato "profilo attivo"
              per tutta la sessione (prima montato per-route su quiz/menu/user →
              una query managed_profiles a ogni cambio pagina). */}
          <ActiveProfileProvider host={userProfile} refreshKey={route.usesActiveProfile ? page : null}>
            <Suspense fallback={<PageLoader />}>
              {renderPage()}
            </Suspense>
          </ActiveProfileProvider>
        </AppErrorBoundary>
      </main>

      {/* Global Chat Assistant (Abilitato per TUTTI gli utenti ora!) */}
      <div className="no-print">
        <ChatBox
          isDarkMode={isDarkMode}
          onNavigate={handleNavigate}
          userProfile={userProfile}
        />
      </div>

      </CherryProvider>
    </div>
  );
};

export default App;