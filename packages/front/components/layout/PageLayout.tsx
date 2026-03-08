import React, { useEffect, useState } from 'react';
import { Header, CinematicBackground } from './index';
import { contentService } from '../../services/contentService';
import { HeaderMetadata } from './Header';
import { cn } from '../../lib/utils';
import { AkhaLoader } from '../ui/index';

interface PageLayoutProps {
  slug: string;
  children: React.ReactNode;
  loading?: boolean;
  customMetadata?: HeaderMetadata & { imageUrl: string };
  customHeader?: React.ReactNode;
  hideDefaultHeader?: boolean;
  isFullScreen?: boolean;
  showPatterns?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  slug,
  children,
  loading: externalLoading = false,
  customMetadata,
  customHeader,
  hideDefaultHeader = false,
  isFullScreen = false,
  showPatterns = false
}) => {
  const [metadata, setMetadata] = useState<HeaderMetadata & { imageUrl: string } | null>(customMetadata || null);
  const [isInternalLoading, setIsInternalLoading] = useState(!customMetadata);

  useEffect(() => {
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
        setTimeout(() => setIsInternalLoading(false), 200);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [slug, customMetadata]);

  const isLoading = isInternalLoading || externalLoading;

  const safeMetadata = metadata || {
    titleMain: 'Thai Akha',
    titleHighlight: 'Kitchen',
    description: 'Loading content...',
    badge: 'System',
    icon: 'hourglass_empty',
    imageUrl: 'https://mtqullobcsypkqgdkaob.supabase.co/storage/v1/object/public/showcase/Akha01.jpg'
  };

  return (
    // 🔧 FIX 1: Rimosso 'overflow-x-hidden'. Questo permette allo sticky interno di funzionare.
    <div className="relative min-h-screen w-full bg-background flex flex-col">
      
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
        {isLoading ? (
          <div className="flex-grow flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in duration-700">
             <AkhaLoader variant="bloom" size={10} className="opacity-90" />
             <p className="mt-8 text-sm font-black uppercase tracking-[0.3em] text-desc/40 animate-pulse">
               Pick Ingredients...
             </p>
          </div>
        ) : (
          <div className="flex flex-col w-full h-full">
            
            {/* HEADER ZONE */}
            <div className="relative z-20 w-full animate-in fade-in slide-in-from-top-4 duration-700 ease-cinematic">
              {hideDefaultHeader ? (
                customHeader
              ) : (
                <div className="pt-4 md:pt-8 pb-4 px-6">
                  <Header data={safeMetadata} />
                </div>
              )}
            </div>

            {/* 
               🔧 FIX 2: STICKY SAFE ZONE
               - Rimosso 'animate-fade-slide-up' (transform) che rompeva position:sticky.
               - Usiamo solo 'animate-in fade-in' per l'entrata.
               - Se vuoi l'effetto slide, devi applicarlo a un div INTERNO a main, non al main stesso.
            */}
            <main className={cn(
              "relative z-10 flex-grow w-full mx-auto animate-in fade-in duration-700 delay-100",
              isFullScreen ? "p-0 max-w-none" : "max-w-[85rem] px-4 md:px-8 lg:px-12 pb-32"
            )}>
              {children}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageLayout;