import React from 'react';
import { Header, CinematicBackground } from './index';
import { usePageMetadata } from '../../hooks/usePageMetadata';
import { HeaderMetadata } from './Header';
import { cn } from '@thaiakha/shared/lib/utils';
import PageLoader from './PageLoader';
import { SkeletonHeader } from '../skeleton';
import { AkhaTheme } from '../divider/AkhaPixelPattern';

interface PageLayoutProps {
  slug: string;
  children: React.ReactNode;
  loading?: boolean;
  customMetadata?: HeaderMetadata & { imageUrl?: string };
  customHeader?: React.ReactNode;
  hideDefaultHeader?: boolean;
  isFullScreen?: boolean;
  showPatterns?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  patternTheme?: AkhaTheme;
  /**
   * Modern progressive-loading mode. When true PageLayout never shows the
   * full-screen spinner: it renders the header (skeleton while loading) and the
   * children (which carry their own skeletons) immediately, so the page reveals
   * as a single continuous state. The parent owns metadata (via `customMetadata`)
   * and the loading flag (via `loading`); PageLayout does NOT self-fetch.
   */
  instantContent?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  slug,
  children,
  loading: externalLoading = false,
  customMetadata,
  customHeader,
  hideDefaultHeader = true,
  isFullScreen = false,
  showPatterns = false,
  gradientFrom,
  gradientTo,
  patternTheme,
  instantContent = false
}) => {
  // Data layer (#86): self-fetch SOLO quando il padre non passa customMetadata e non
  // e' in modalita' progressiva (instantContent: il padre possiede metadata + loading).
  // Stessa query/cache di usePageSections({ metadataSlug }) e degli altri lettori dello slug.
  //
  // In piu' (2026-09-05) il layout interroga lo slug solo se quel dato verra' MOSTRATO:
  // con l'header di default nascosto e nessun header custom, l'unica cosa che ne usciva
  // era l'`imageUrl` dello sfondo, e sette pagine chiedevano righe che in site_metadata
  // non esistono nemmeno (`recipes`, `recipe-<slug>`, `menu`, `user`, `quiz`, ...):
  // un round trip a vuoto che teneva ferma tutta la pagina, perche' finche' e' in volo
  // i figli non vengono montati e le LORO query non partono.
  const selfFetch = !instantContent && !customMetadata && (!hideDefaultHeader || !!customHeader);
  const { metadata: fetched, loading: fetchLoading } = usePageMetadata(slug, { enabled: selfFetch });
  const metadata: (HeaderMetadata & { imageUrl?: string }) | null = customMetadata ?? (selfFetch ? fetched : null);
  const isInternalLoading = selfFetch && fetchLoading;

  const isLoading = isInternalLoading || externalLoading;

  const safeMetadata = metadata || {
    titleMain: 'Thai Akha',
    titleHighlight: 'Kitchen',
    description: 'Loading content...',
    badge: 'System',
    icon: 'hourglass_empty',
    // Vuoto di proposito: durante il fallback lo sfondo e' comunque spento
    // (isLoaded false) e nessuno deve scaricare og-default.jpg per non mostrarla.
    imageUrl: ''
  };

  return (
    // 🔧 FIX 1: Rimosso 'overflow-x-hidden'. Questo permette allo sticky interno di funzionare.
    <div className="relative min-h-screen w-full bg-background flex flex-col">
      {/* Skip-to-content — visually hidden until focused; lets keyboard/screen-reader users
          bypass navigation and jump directly to the page body. Fixes A04. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-surface focus:text-title focus:rounded-xl focus:border focus:border-primary focus:shadow-xl"
      >
        Skip to main content
      </a>

      {/* 1. BACKGROUND (Layer 0) */}
      <div className="fixed inset-0 z-0">
        <CinematicBackground 
          isLoaded={!isLoading} 
          imageUrl={safeMetadata.imageUrl ?? ""}
          showPatterns={showPatterns}
        />
      </div>

      {/* 2. CONTENT (Layer 10) */}
      <div className="relative z-10 flex flex-col flex-grow w-full">
        {/* Progressive mode (instantContent) salta lo spinner full-screen: la pagina
            si rivela come UN solo stato continuo (header skeleton + corpo skeleton). */}
        {!instantContent && isLoading ? (
          <PageLoader />
        ) : (
          <div className="flex flex-col w-full h-full">

            {/* HEADER ZONE */}
            <div className="relative z-50 w-full animate-in fade-in slide-in-from-top-4 duration-700 ease-cinematic">
              {hideDefaultHeader ? (
                customHeader
              ) : isLoading ? (
                <div className="w-full max-w-[var(--container-page)] mx-auto [padding-block:var(--space-fluid-s)] [padding-inline:var(--space-fluid-m)]">
                  <SkeletonHeader variant="hero" align="center" />
                </div>
              ) : (
                <div className="w-full max-w-[var(--container-page)] mx-auto [padding-block:var(--space-fluid-s)] [padding-inline:var(--space-fluid-m)]">
                  <Header
                    data={safeMetadata}
                    gradientFrom={gradientFrom}
                    gradientTo={gradientTo}
                    patternTheme={patternTheme}
                  />
                </div>
              )}
            </div>

            {/* 
               🔧 FIX 2: STICKY SAFE ZONE
               - Rimosso 'animate-fade-slide-up' (transform) che rompeva position:sticky.
               - Usiamo solo 'animate-in fade-in' per l'entrata.
               - Se vuoi l'effetto slide, devi applicarlo a un div INTERNO a main, non al main stesso.
            */}
            <main
              id="main-content"
              tabIndex={-1}
              className={cn(
                "relative z-30 flex-grow w-full mx-auto animate-in fade-in duration-700 delay-100 flex flex-col [gap:var(--space-fluid-xl)]",
                isFullScreen ? "p-0 max-w-none" : "max-w-[var(--container-page)] [padding-inline:var(--space-fluid-m)] [padding-bottom:var(--space-fluid-section)]"
              )}
            >
              {children}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageLayout;