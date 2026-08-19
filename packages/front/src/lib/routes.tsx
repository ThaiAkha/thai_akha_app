/* eslint-disable react-refresh/only-export-components -- tabella dati (route), non un modulo di componenti.
   Solo in DEV: modificare questo file ricrea i lazy() e rimonta la pagina corrente (HMR), e' atteso. */
/**
 * Tabella delle route del front (#87 parte 2).
 *
 * Prima: uno switch di 39 `case` dentro App.tsx, con la logica "questa pagina ha
 * un sotto-slug?" duplicata in `urlState` (una condizione con 13 confronti). Ora
 * ogni route dichiara UNA volta i suoi id (slug canonico inglese + alias legacy),
 * se accetta un sotto-slug e come si renderizza. App.tsx resta un router puro:
 * legge la tabella, non contiene piu' casi speciali.
 *
 * Regole:
 * - `ids[0]` e' lo slug canonico (quello di PAGE_SLUGS/site_metadata); gli altri
 *   sono alias interni/legacy che LEGACY_SLUG_MAP non copre.
 * - `hasSlug`: il secondo segmento URL e' un sotto-slug (recipe, news, categoria
 *   quiz...) e va passato alla pagina. Le altre route ignorano i segmenti extra.
 * - `gate: 'profile'`: la pagina dipende dal profilo e aspetta fetchUser()
 *   (mostra il loader finche' isInitialLoading e' true) - come prima.
 * - I chunk restano lazy: la tabella importa i componenti con React.lazy.
 */
import { lazy, type ReactNode } from 'react';
import type { UserProfile } from '../services/auth.service';

const HomePage = lazy(() => import('../pages/HomePage'));
const QuizPage = lazy(() => import('../pages/QuizPage'));
const QuizPageSingle = lazy(() => import('../pages/QuizPageSingle'));
const InfoClasses = lazy(() => import('../pages/ClassOverview'));
const MorningClassPage = lazy(() => import('../pages/ClassMorning'));
const EveningClassPage = lazy(() => import('../pages/ClassEvening'));
const MenuPage = lazy(() => import('../pages/UserMenu'));
const HistoryPage = lazy(() => import('../pages/HistoryPage'));
const IngredientsPage = lazy(() => import('../pages/IngredientsPage'));
const LocationPage = lazy(() => import('../pages/PickUpPage'));
const AuthPage = lazy(() => import('../pages/AuthPage'));
const UserPage = lazy(() => import('../pages/UserPage'));
const RecipesPage = lazy(() => import('../pages/Recipes'));
const RecipeSinglePage = lazy(() => import('../pages/RecipeSingle'));
const BookingPage = lazy(() => import('../pages/BookingPage'));
const JoinGroupPage = lazy(() => import('../pages/JoinGroupPage'));
// Galleria stile: strumento di sviluppo, fuori dal bundle di produzione (audit 2026-08, P8).
// Con import.meta.env.DEV=false Vite/Rollup eliminano il ramo e non emettono il chunk.
const StyleCards = import.meta.env.DEV ? lazy(() => import('../pages/ZZStyleCards')) : null;
const NewsPage = lazy(() => import('../pages/NewsPage'));
const TermsPage = lazy(() => import('../pages/TermsPage'));
const PrivacyPage = lazy(() => import('../pages/PrivacyPage'));
const AboutUsPage = lazy(() => import('../pages/AboutUsPage'));
const ContactUsPage = lazy(() => import('../pages/ContactUsPage'));
const FAQPage = lazy(() => import('../pages/FAQPage'));

export type NavigateFn = (targetPage: string, topic?: string, sectionId?: string) => void;

/** Cio' che una route riceve per renderizzarsi: stato dell'app, mai il router stesso. */
export interface RouteContext {
  /** Sotto-slug (secondo segmento) - solo se la route ha `hasSlug`. */
  slug: string | null;
  userProfile: UserProfile | null;
  onNavigate: NavigateFn;
  /** Rilegge il profilo (login/logout/aggiornamento preferenze). */
  refreshProfile: () => void;
}

export interface RouteDef {
  /** Prima voce = slug canonico; le altre = alias legacy/interni. */
  ids: readonly string[];
  /** Il secondo segmento URL e' un sotto-slug da passare alla pagina. */
  hasSlug?: boolean;
  /** Override: come ricavare il sotto-slug dal secondo segmento (default: il segmento stesso). */
  slugOf?: (second: string | undefined) => string | null;
  /** 'profile' = aspetta fetchUser() (loader finche' isInitialLoading). */
  gate?: 'profile';
  /** La pagina agisce sul profilo attivo (useActiveProfile): al rientro si rileggono i managed. */
  usesActiveProfile?: boolean;
  render: (ctx: RouteContext) => ReactNode;
}

/** URL dell'app admin (CTA booking dello staff). */
export const ADMIN_URL: string = (import.meta.env.VITE_ADMIN_URL as string | undefined) ?? 'https://admin.thaiakha.com';
/** Ruoli staff CON pagina booking admin → la CTA booking apre l'app admin. */
export const ADMIN_ROLES: ReadonlySet<string> = new Set(['agency', 'admin', 'manager']);
/** Ruoli staff SENZA pagina booking → la CTA booking riporta alla home front. */
export const NO_BOOKING_ROLES: ReadonlySet<string> = new Set(['kitchen', 'logistics', 'driver']);
/** true se per questo profilo la pagina booking va deviata (admin o home). */
export const isBookingRedirectRole = (profile: UserProfile | null): boolean =>
  !!profile && (ADMIN_ROLES.has(profile.role) || NO_BOOKING_ROLES.has(profile.role));

export const ROUTES: readonly RouteDef[] = [
  // ── Pagine pubbliche: si renderizzano subito, non aspettano il profilo ──
  { ids: ['home'], hasSlug: true, render: ({ onNavigate }) => <HomePage onNavigate={onNavigate} /> },
  {
    ids: ['akha-wisdom-path-quiz', 'quiz'], hasSlug: true, usesActiveProfile: true,
    render: ({ slug, onNavigate }) => slug
      ? <QuizPageSingle categoryId={slug} onNavigate={onNavigate} />
      : <QuizPage onNavigate={onNavigate} />,
  },
  { ids: ['thai-cooking-classes-chiang-mai', 'classes'], render: ({ onNavigate }) => <InfoClasses onNavigate={onNavigate} /> },
  { ids: ['morning-cooking-class-market-tour', 'morning-class'], render: ({ onNavigate }) => <MorningClassPage onNavigate={onNavigate} /> },
  { ids: ['evening-cooking-class-dinner', 'evening-class'], render: ({ onNavigate }) => <EveningClassPage onNavigate={onNavigate} /> },
  {
    ids: ['authentic-thai-akha-recipes', 'recipes'], hasSlug: true,
    render: ({ slug, onNavigate, userProfile, refreshProfile }) => slug
      ? <RecipeSinglePage slug={slug} onNavigate={onNavigate} userProfile={userProfile} />
      : <RecipesPage onNavigate={onNavigate} userProfile={userProfile} onProfileUpdate={refreshProfile} />,
  },
  {
    ids: ['akha-culture-highland-heritage', 'history'], hasSlug: true,
    // `/history/category/...` non e' un articolo: la lista gestisce la categoria da sola.
    slugOf: second => (second === 'category' ? null : second || null),
    render: ({ slug, onNavigate }) => <HistoryPage key={slug || '__list__'} onNavigate={onNavigate} targetSection={slug} />,
  },
  {
    ids: ['thai-cooking-ingredients', 'ingredients'], hasSlug: true,
    render: ({ slug, onNavigate }) => <IngredientsPage key={slug || '__list__'} onNavigate={onNavigate} targetSection={slug} />,
  },
  {
    ids: ['thai-cooking-tips-news', 'news'], hasSlug: true,
    render: ({ slug, onNavigate }) => <NewsPage key={slug || '__list__'} onNavigate={onNavigate} targetSection={slug} />,
  },
  { ids: ['free-pickup-location-chiang-mai', 'location'], render: ({ onNavigate }) => <LocationPage key="location" onNavigate={onNavigate} /> },
  { ids: ['booking-terms-conditions', 'terms-and-conditions'], render: ({ onNavigate }) => <TermsPage onNavigate={onNavigate} /> },
  { ids: ['privacy-policy', 'privacy', 'policy-and-privacy'], render: ({ onNavigate }) => <PrivacyPage onNavigate={onNavigate} /> },
  { ids: ['about-thai-akha-kitchen', 'about-us'], render: ({ onNavigate }) => <AboutUsPage onNavigate={onNavigate} /> },
  { ids: ['contact-cooking-school-chiang-mai', 'contact', 'contact-us'], render: ({ onNavigate }) => <ContactUsPage onNavigate={onNavigate} /> },
  { ids: ['cooking-class-faq-chiang-mai', 'faq'], render: ({ onNavigate }) => <FAQPage onNavigate={onNavigate} /> },
  { ids: ['style'], render: ({ onNavigate }) => (StyleCards ? <StyleCards /> : <HomePage onNavigate={onNavigate} />) },

  // ── Flussi utente: dipendono dal profilo, aspettano fetchUser() ──
  {
    ids: ['book-cooking-class-chiang-mai', 'booking'], gate: 'profile',
    // Staff: il redirect (window.open / replaceState) vive nell'effetto di App.tsx,
    // non nel render. Qui si rende null finche' l'effetto non ha girato: App mostra il loader.
    render: ({ onNavigate, userProfile, refreshProfile }) => isBookingRedirectRole(userProfile)
      ? null
      : <BookingPage onNavigate={onNavigate} userProfile={userProfile} onAuthSuccess={refreshProfile} />,
  },
  {
    ids: ['menu'], hasSlug: true, gate: 'profile', usesActiveProfile: true,
    render: ({ slug, onNavigate, userProfile, refreshProfile }) =>
      <MenuPage onNavigate={onNavigate} userProfile={userProfile} onAuthSuccess={refreshProfile} sectionId={slug} />,
  },
  { ids: ['auth'], render: ({ onNavigate, refreshProfile }) => <AuthPage onNavigate={onNavigate} onAuthSuccess={refreshProfile} /> },
  {
    ids: ['join-group'], gate: 'profile',
    render: ({ onNavigate, userProfile, refreshProfile }) =>
      <JoinGroupPage onNavigate={onNavigate} userProfile={userProfile} onAuthSuccess={refreshProfile} />,
  },
  {
    ids: ['user'], hasSlug: true, gate: 'profile', usesActiveProfile: true,
    render: ({ slug, onNavigate, userProfile, refreshProfile }) =>
      <UserPage onNavigate={onNavigate} userProfile={userProfile} onProfileRefresh={refreshProfile} sectionId={slug} />,
  },
];

/** id → route (canonico e alias). Costruito una volta. */
const ROUTE_BY_ID: ReadonlyMap<string, RouteDef> = new Map(
  ROUTES.flatMap(r => r.ids.map(id => [id, r] as const)),
);

/** Route per id; undefined = sconosciuta (App rende la home, come prima). */
export const findRoute = (id: string): RouteDef | undefined => ROUTE_BY_ID.get(id);

/** Sotto-slug grezzo per una route (null se la route non ne prevede). */
export const routeSlug = (route: RouteDef | undefined, second: string | undefined): string | null => {
  if (!route?.hasSlug) return null;
  return route.slugOf ? route.slugOf(second) : (second || null);
};
