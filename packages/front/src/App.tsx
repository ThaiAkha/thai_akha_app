import React, { lazy, Suspense, useState, useEffect, useLayoutEffect, useRef } from 'react';
// Importiamo supabase per la gestione sessione
import { supabase } from '@thaiakha/shared/lib/supabase';
// PAGINE — lazy loaded per code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const QuizPageSingle = lazy(() => import('./pages/QuizPageSingle'));
const InfoClasses = lazy(() => import('./pages/ClassOverview'));
const MorningClassPage = lazy(() => import('./pages/ClassMorning'));
const EveningClassPage = lazy(() => import('./pages/ClassEvening'));
const MenuPage = lazy(() => import('./pages/UserMenu'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const IngredientsPage = lazy(() => import('./pages/IngredientsPage'));
const LocationPage = lazy(() => import('./pages/PickUpPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ResetPasswordRecovery = lazy(() => import('./components/auth/ResetPasswordRecovery'));
const UserPage = lazy(() => import('./pages/UserPage'));
const RecipesPage = lazy(() => import('./pages/Recipes'));
const RecipeSinglePage = lazy(() => import('./pages/RecipeSingle'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const JoinGroupPage = lazy(() => import('./pages/JoinGroupPage'));
// Galleria stile: strumento di sviluppo, fuori dal bundle di produzione (audit 2026-08, P8).
// Con import.meta.env.DEV=false Vite/Rollup eliminano il ramo e non emettono il chunk.
const StyleCards = import.meta.env.DEV ? lazy(() => import('./pages/ZZStyleCards')) : null;
const NewsPage = lazy(() => import('./pages/NewsPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));



// LAYOUT & NAVIGATION
import {
  Sidebar,
  SidebarMobile,
  SEOHead,
} from './components/layout/index';
import { AkhaLoader } from './components/ui/index';
import { AppErrorBoundary } from '@thaiakha/shared/components/AppErrorBoundary';
import PageErrorFallback from './components/layout/PageErrorFallback';
import { ChatBox, CherryProvider } from './components/chat/index';
import { authService, UserProfile } from './services/auth.service';
import { ActiveProfileProvider } from './context/ActiveProfileContext';


// Staff roles that HAVE an admin booking page → booking CTA opens the admin app.
const ADMIN_ROLES = new Set(['agency', 'admin', 'manager']);
// Staff roles with NO booking page → booking CTA just redirects to the front home.
const NO_BOOKING_ROLES = new Set(['kitchen', 'logistics', 'driver']);
const ADMIN_URL = (import.meta as any).env?.VITE_ADMIN_URL ?? 'https://admin.thaiakha.com';

// Canonical SEO slugs — single source in lib/pageSlugs.ts, condivisa con SEOHead.
import { PAGE_SLUGS } from './lib/pageSlugs';
import { useLanguage } from './context/LanguageContext';
import { buildLangPath } from './lib/langRouting';

// Loader unico dell'app: identico come fallback <Suspense> (download chunk lazy)
// e come gate dei flussi che aspettano il profilo. Stesso elemento ⇒ nessuno
// swap visivo tra i due stati ("doppio AkhaLoader") quando si concatenano.
const PageLoader: React.FC = () => (
  <div className="h-full w-full flex items-center justify-center bg-background">
    <AkhaLoader variant="bloom" size={10} />
  </div>
);

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

  const LEGACY_SLUG_MAP: Record<string, string> = {
    // Top-level canonical pages — shared single source.
    ...PAGE_SLUGS,
    'terms-and-conditions': 'booking-terms-conditions',
    'policy-and-privacy': 'privacy-policy',
    // History Sections
    'living-tradition': 'akha-village-living-traditions',
    'akha-men': 'akha-mens-new-year-traditions',
    'food-as-medicine': 'akha-food-as-medicine-healing',
    'learn-basic-survival': 'akha-jungle-survival-medicine',
    'spirit-gate': 'sacred-akha-spirit-gate-meaning',
    'music-folklore': 'traditional-akha-music-folklore',
    'religion-taboo': 'akha-religious-taboos-beliefs',
    'communal-dining': 'akha-communal-dining-etiquette',
    'spice-philosophy': 'akha-sapi-thong-spice-philosophy',
    'thai-akha-fusion': 'thai-akha-culinary-fusion',
    'religion-cosmos-belief': 'akha-cosmos-animist-beliefs',
    'modern-borders': 'akha-diaspora-southeast-asia',
    'hani-akha': 'hani-akha-shared-ancestry',
    'the-high-plateau': 'tibetan-plateau-akha-origins',
    'hill-tribes-overview': 'northern-thailand-hill-tribes-guide',
    'historical-roots': 'akha-migration-history-routes',
    'jungle-bounty': 'akha-jungle-foraging-pantry',
    'traditional-dress': 'traditional-akha-dress-silver',
    'threads-of-origin': 'akha-subgroups-migration-history',
    'woven-stories': 'akha-textile-embroidery-traditions',
    'swing-festival': 'akha-swing-festival-yehkuja',
    // Recipes
    'akha-salad': 'authentic-akha-mountain-salad-recipe',
    'akha-herbal-soup': 'akha-spirit-detox-soup-recipe',
    'akha-sapi-thong': 'traditional-akha-sapi-thong-recipe',
    'papaya-salad': 'authentic-som-tum-papaya-salad-recipe',
    'fried-spring-rolls': 'crispy-thai-spring-rolls-recipe',
    'thai-red-curry': 'authentic-thai-red-curry-recipe',
    'thai-green-curry': 'authentic-thai-green-curry-recipe',
    'thai-panang-curry': 'authentic-thai-panang-curry-recipe',
    'thai-massaman-curry': 'authentic-thai-massaman-curry-recipe',
    'tom-kha-coconut-milk': 'authentic-tom-kha-gai-recipe',
    'tom-yum-hot-and-sour': 'authentic-tom-yum-goong-recipe',
    'clear-soup-egg-tofu': 'thai-clear-soup-egg-tofu-recipe',
    'pad-thai': 'authentic-pad-thai-recipe-chiang-mai',
    'stir-fry-cashew-nuts': 'thai-chicken-cashew-nuts-recipe',
    'stir-fry-holy-basil': 'authentic-pad-kra-pao-recipe',
    'sweet-and-sour-vegetables': 'thai-sweet-and-sour-vegetable-recipe',
    'mango-sticky-rice': 'authentic-mango-sticky-rice-recipe',
    'pumpkin-in-coconut-milk': 'thai-pumpkin-coconut-milk-recipe',
    // News Articles
    'the-art-of-thai-akha-spice-soft-to-warrior': 'thai-spice-levels-guide',
    'how-to-prepare-cooking-class-chiang-mai': 'prepare-thai-cooking-class-chiang-mai',
    'how-the-class-works': 'how-thai-cooking-class-works',
    'dietary-styles-and-customization': 'vegan-vegetarian-thai-cooking-guide',
    'cooking-with-food-allergies': 'allergy-safe-thai-cooking-protocols',
    'art-of-mortar-pestle': 'mortar-vs-blender-thai-curry-paste',
    'local-market-tour-experience': 'chiang-mai-local-market-tour-guide',
    'free-pickup-zones-chiang-mai': 'cooking-class-chiang-mai-pickup-map',
    'niti-muelaeku-akha-chef': 'chef-niti-muelaeku-akha-heritage',
    '6-reasons-to-join-thai-akha-kitchen': 'best-cooking-school-chiang-mai-reasons',
    'reducing-plastic-consumption-chiang-mai': 'sustainable-cooking-zero-plastic-chiang-mai',
    'how-to-use-dry-spices-curry-paste': 'how-to-use-thai-dry-spices-guide',
    'akha-thai-languages-guide': 'essential-thai-akha-market-phrases',
    'vegan-akha-cooking': 'authentic-vegan-thai-cooking-chiang-mai',
    'cookbook-and-certificate': 'thai-cooking-class-certificate-cookbook'
  };

  // ── ROUTING ──────────────────────────────────────────────────────────────
  // I segmenti arrivano dal LanguageProvider GIÀ senza prefisso lingua e GIÀ
  // tradotti in inglese: da qui in giù l'app ragiona solo in slug inglesi, che
  // sono l'identità con cui si legge il DB. Chi naviga in spagnolo vede URL
  // spagnoli, ma `page` resta 'authentic-thai-akha-recipes' come sempre.
  const { lang, enSegments, slugMap } = useLanguage();

  const urlState = React.useMemo(() => {
    const parts = enSegments;
    const rawPage = parts[0] || 'home';
    const rawSlug = (parts[0] === 'home' || !parts[0] || parts[0] === 'history' || parts[0] === 'akha-culture-highland-heritage' || parts[0] === 'menu' || parts[0] === 'user' || parts[0] === 'quiz' || parts[0] === 'akha-wisdom-path-quiz' || parts[0] === 'recipes' || parts[0] === 'authentic-thai-akha-recipes' || parts[0] === 'news' || parts[0] === 'thai-cooking-tips-news' || parts[0] === 'ingredients' || parts[0] === 'thai-cooking-ingredients')
      ? (parts[0] === 'history' || parts[0] === 'akha-culture-highland-heritage' ? (parts[1] === 'category' ? null : parts[1] || null) : parts[1] || null)
      : null;

    return {
      page: LEGACY_SLUG_MAP[rawPage] || rawPage,
      slug: rawSlug ? (LEGACY_SLUG_MAP[rawSlug] || rawSlug) : null,
    };
    // LEGACY_SLUG_MAP è una costante letterale ricreata a ogni render: dipendere
    // da `enSegments` è sufficiente e corretto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const fetchUser = async () => {
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
            } as any);
          } catch (e) {
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
  }, []);

  // --- NAVIGAZIONE ---
  const handleNavigate = (targetPage: string, topic?: string, sectionId?: string) => {
    // Handle composite paths like 'news/slug' passed as a single string
    if (!sectionId && targetPage.includes('/')) {
      const slashIdx = targetPage.indexOf('/');
      return handleNavigate(targetPage.slice(0, slashIdx), topic, targetPage.slice(slashIdx + 1));
    }

    if ((targetPage === 'booking' || targetPage === 'book-cooking-class-chiang-mai') && userProfile) {
      // Staff with an admin booking page → open it; other staff → front home.
      if (ADMIN_ROLES.has(userProfile.role)) {
        window.open(`${ADMIN_URL}/booking`, '_blank', 'noopener,noreferrer');
        return;
      }
      if (NO_BOOKING_ROLES.has(userProfile.role)) {
        return handleNavigate('home');
      }
    }

    // Alias interni → slug canonico inglese. Nome esteso per non confondersi con
    // `slugMap` del LanguageProvider, che è tutt'altro: il registro delle traduzioni.
    const slugMapPages: Record<string, string> = {
      ...PAGE_SLUGS,
      'terms': 'booking-terms-conditions',
      'privacy': 'privacy-policy'
    };

    const urlPage = slugMapPages[targetPage] || targetPage;
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
  };

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
  // Le pagine PUBBLICHE si renderizzano subito: non dipendono dal profilo, quindi
  // non aspettano fetchUser(). I flussi che dipendono dal profilo (user/booking/
  // menu/join-group) mostrano <PageLoader/> finché isInitialLoading è true.
  const renderPage = () => {
    switch (page) {
      // Pagine Pubbliche
      case 'home': return <HomePage onNavigate={handleNavigate} />;
      case 'akha-wisdom-path-quiz':
      case 'quiz':
        return (
          <ActiveProfileProvider host={userProfile}>
            {targetSection
              ? <QuizPageSingle categoryId={targetSection} onNavigate={handleNavigate} />
              : <QuizPage onNavigate={handleNavigate} />}
          </ActiveProfileProvider>
        );
      case 'thai-cooking-classes-chiang-mai':
      case 'classes': return <InfoClasses onNavigate={handleNavigate} />;
      case 'morning-cooking-class-market-tour':
      case 'morning-class': return <MorningClassPage onNavigate={handleNavigate} />;
      case 'evening-cooking-class-dinner':
      case 'evening-class': return <EveningClassPage onNavigate={handleNavigate} />;
      case 'authentic-thai-akha-recipes':
      case 'recipes':
        if (targetSection) return <RecipeSinglePage slug={targetSection} onNavigate={handleNavigate} userProfile={userProfile} />;
        return <RecipesPage onNavigate={handleNavigate} userProfile={userProfile} onProfileUpdate={fetchUser} />;
      case 'akha-culture-highland-heritage':
      case 'history': return <HistoryPage key={targetSection || '__list__'} onNavigate={handleNavigate} targetSection={targetSection} />;
      case 'thai-cooking-ingredients':
      case 'ingredients': return <IngredientsPage key={targetSection || '__list__'} onNavigate={handleNavigate} targetSection={targetSection} />;
      case 'thai-cooking-tips-news':
      case 'news': return <NewsPage key={targetSection || '__list__'} onNavigate={handleNavigate} targetSection={targetSection} />;
      case 'free-pickup-location-chiang-mai':
      case 'location': return <LocationPage key='location' onNavigate={handleNavigate} />;
      case 'booking-terms-conditions':
      case 'terms-and-conditions': return <TermsPage onNavigate={handleNavigate} />;
      case 'privacy':
      case 'privacy-policy':
      case 'policy-and-privacy': return <PrivacyPage onNavigate={handleNavigate} />;
      case 'about-thai-akha-kitchen':
      case 'about-us': return <AboutUsPage onNavigate={handleNavigate} />;
      case 'contact-cooking-school-chiang-mai':
      case 'contact':
      case 'contact-us': return <ContactUsPage onNavigate={handleNavigate} />;
      case 'cooking-class-faq-chiang-mai':
      case 'faq': return <FAQPage onNavigate={handleNavigate} />;
      case 'style': return StyleCards ? <StyleCards /> : <HomePage onNavigate={handleNavigate} />;

      // Flows Operativi Utente — dipendono dal profilo: attendono fetchUser()
      // per non lampeggiare lo stato sbagliato (es. redirect staff su booking).
      case 'book-cooking-class-chiang-mai':
      case 'booking':
        if (isInitialLoading) return <PageLoader />;
        if (userProfile && ADMIN_ROLES.has(userProfile.role)) {
          window.open(`${ADMIN_URL}/booking`, '_blank', 'noopener,noreferrer');
          window.history.replaceState({}, '', '/');
          return <HomePage onNavigate={handleNavigate} />;
        }
        // Staff without a booking page (kitchen/logistics/driver) → front home (no B2C booking).
        if (userProfile && NO_BOOKING_ROLES.has(userProfile.role)) {
          window.history.replaceState({}, '', '/');
          return <HomePage onNavigate={handleNavigate} />;
        }
        return <BookingPage onNavigate={handleNavigate} userProfile={userProfile} onAuthSuccess={fetchUser} />;
      case 'menu':
        if (isInitialLoading) return <PageLoader />;
        return (
          <ActiveProfileProvider host={userProfile}>
            <MenuPage onNavigate={handleNavigate} userProfile={userProfile} onAuthSuccess={fetchUser} sectionId={targetSection} />
          </ActiveProfileProvider>
        );
      case 'auth':
        return <AuthPage onNavigate={handleNavigate} onAuthSuccess={fetchUser} />;
      case 'join-group':
        if (isInitialLoading) return <PageLoader />;
        return <JoinGroupPage onNavigate={handleNavigate} userProfile={userProfile} onAuthSuccess={fetchUser} />;
      case 'user':
        if (isInitialLoading) return <PageLoader />;
        return <UserPage onNavigate={handleNavigate} userProfile={userProfile} onProfileRefresh={fetchUser} sectionId={targetSection} />;

      default: return <HomePage onNavigate={handleNavigate} />;
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    setUserProfile(null);
    handleNavigate('home');
  };

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
          <Suspense fallback={<PageLoader />}>
            {renderPage()}
          </Suspense>
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