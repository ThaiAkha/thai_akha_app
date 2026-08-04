import React from 'react';
import { Tabs } from '../ui/index';
import { cn } from '@thaiakha/shared/lib/utils';

interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: string;
  badge?: string | number;
  activeColor?: 'primary' | 'secondary' | 'action';
}

interface StickyTabNavProps {
  items: TabItem[];
  value: string;
  onChange: (val: string) => void;
  /** Tailwind top offset class, e.g. "top-[12px]". Defaults to top-[12px] md:top-[28px] */
  topOffset?: string;
  /** Extra bottom margin class. Defaults to mb-3 md:mb-12 */
  bottomMargin?: string;
}

/**
 * StickyTabNav — sticky glass pill wrapper for page-level navigation.
 * Uses pointer-events trick so only the pill itself intercepts clicks.
 */
const StickyTabNav: React.FC<StickyTabNavProps> = ({
  items,
  value,
  onChange,
  topOffset = 'top-[20px]',
  bottomMargin = 'mb-6 md:mb-8',
}) => {
  const [isSticky, setIsSticky] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the sentinel is NOT intersecting, it means the sticky component 
        // has reached the top and is now sticky.
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: [1], rootMargin: '-1px 0px 0px 0px' }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* 
         SENTINEL: Invisible pixel to detect when the tab hits the top.
         Must be placed before the sticky container in the DOM flow.
      */}
      <div ref={sentinelRef} className="h-px w-full absolute pointer-events-none md:hidden" style={{ top: '-1px' }} />

      {/* --- MOBILE NAVIGATION (Sticky Top) --- */}
      <div className="md:hidden sticky top-0 z-[100] w-full flex flex-col items-center pointer-events-none">
        {/* 
           Softened Gradient Overlay 
           - Fades in only when isSticky is true
        */}
        <div className={cn(
          "absolute inset-x-0 top-0 h-32 pointer-events-none transition-opacity duration-700 ease-in-out",
          "bg-gradient-to-b from-surface via-surface/80 to-transparent dark:from-black dark:via-black/60",
          isSticky ? "opacity-100" : "opacity-0"
        )} />
        
        <div className="relative z-10 w-full flex justify-center py-2 px-4 pointer-events-auto">
          <Tabs
            items={items}
            value={value}
            onChange={onChange}
            variant="pills"
            compact={true}
            containerClass={cn(
              "shadow-xl border-white/10 bg-white/90 dark:bg-black/90 backdrop-blur-xl py-1 transition-all duration-500",
              isSticky ? "scale-95" : "scale-100"
            )}
          />
        </div>
      </div>

      {/* 
         DESKTOP NAV (Sticky Top)
         - Mantiene l'attuale comportamento a pillola sticky 
      */}
      <div
        className={cn(
          "hidden md:flex sticky z-[100] w-full justify-center [margin-bottom:var(--space-fluid-l)] px-2 pointer-events-none",
          topOffset,
          bottomMargin
        )}
      >
        <div className="pointer-events-auto bg-white/90 dark:bg-black/90 backdrop-blur-xl [padding:var(--space-fluid-2xs)] rounded-full shadow-lg max-w-full overflow-x-auto no-scrollbar md:scale-110 md:origin-top transition-transform">
          <Tabs
            items={items}
            value={value}
            onChange={onChange}
            variant="pills"
          />
        </div>
      </div>
    </>
  );
};

export default StickyTabNav;
