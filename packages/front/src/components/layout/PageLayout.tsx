import React, { useEffect, useState } from 'react';
import { Header, CinematicBackground } from './index';
import { contentService } from '@thaiakha/shared/services';
import { HeaderMetadata } from './Header';
import { cn } from '@thaiakha/shared/lib/utils';
import { AkhaLoader, Typography } from '../ui/index';
import { SkeletonHeader } from '../skeleton';
import { AkhaTheme } from '../divider/AkhaPixelPattern';

interface PageLayoutProps {
  slug: string;
  children: React.ReactNode;
  loading?: boolean;
  customMetadata?: HeaderMetadata & { imageUrl: string };
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
  const [metadata, setMetadata] = useState<HeaderMetadata & { imageUrl: string } | null>(customMetadata || null);
  // instantContent: parent owns loading → no internal blocking state, no self-fetch.
  const [isInternalLoading, setIsInternalLoading] = useState(instantContent ? false : !customMetadata);

  useEffect(() => {
    // Progressive mode: parent supplies metadata (when ready) + the loading flag.
    // Mirror metadata as it arrives, never self-fetch (avoids a duplicate roundtrip).
    if (instantContent) {
      if (customMetadata) setMetadata(customMetadata);
      return;
    }

    if (customMetadata) {
      setMetadata(customMetadata);
      setIsInternalLoading(false);
      return;
    }

    let isMounted = true;
    const load = async () => {
      setIsInternalLoading(true);
      const data = await contentService.getPageMetadata(slug);
      
      if (isMounted) {
        if (data) setMetadata(data);
        setIsInternalLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [slug, customMetadata, instantContent]);

  const isLoading = isInternalLoading || externalLoading;

  const safeMetadata = metadata || {
    titleMain: 'Thai Akha',
    titleHighlight: 'Kitchen',
    description: 'Loading content...',
    badge: 'System',
    icon: 'hourglass_empty',
    imageUrl: 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/og-default.jpg'
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
          imageUrl={safeMetadata.imageUrl}
          showPatterns={showPatterns}
        />
      </div>

      {/* 2. CONTENT (Layer 10) */}
      <div className="relative z-10 flex flex-col flex-grow w-full">
        {/* Progressive mode (instantContent) salta lo spinner full-screen: la pagina
            si rivela come UN solo stato continuo (header skeleton + corpo skeleton). */}
        {!instantContent && isLoading ? (
          <div className="flex-grow flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in duration-700">
             <AkhaLoader variant="bloom" size={10} className="opacity-90" />
             <Typography variant="microLabel" className="mt-8 text-gray-700/40 dark:text-gray-300/40 animate-pulse">
               Pick Ingredients...
             </Typography>
          </div>
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