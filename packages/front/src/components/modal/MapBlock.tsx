import React, { useState } from 'react';
import { Card, Icon } from '../ui';
import { t } from '../../i18n';

interface MapBlockProps {
  url: string;
  title?: string;
  height?: number;
}

/**
 * MapBlock — handles its own interaction state (scroll lock/unlock)
 * Used within ContentRenderer and potentially elsewhere.
 */
const MapBlock: React.FC<MapBlockProps> = ({ url, title, height }) => {
  const [isMapActive, setIsMapActive] = useState(false);

  return (
    <Card variant="glass" padding="none" rounded="2xl" className="overflow-hidden border-white/20">
      <div className="relative w-full aspect-[15/9]" style={{ height: height || 'auto' }}>
        <iframe
          src={url}
          className={`absolute inset-0 w-full h-full border-0 grayscale-[0.2] contrast-[1.1] hover:grayscale-0 transition-all duration-700 ${!isMapActive ? 'pointer-events-none' : 'pointer-events-auto'}`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={title || t('components:map.locationTitle')}
        />

        {/* Scroll Lock Overlay */}
        {!isMapActive && (
          <div
            className="absolute inset-0 bg-black/5 flex flex-col items-center justify-center cursor-pointer group/map z-10"
            onClick={() => setIsMapActive(true)}
          >
            <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/20 text-white text-sm font-medium opacity-0 group-hover/map:opacity-100 transition-opacity duration-300 flex items-center gap-2 shadow-xl">
              <Icon name="mouse_pointer_click" size="xl" className="text-primary" />
              {t('components:map.enableInteraction')}
            </div>
          </div>
        )}

        {/* Active State Hint — High contrast for Light/Dark Mode */}
        {isMapActive && (
          <button
            className="absolute top-2 right-3 p-2 px-4 bg-[var(--surface-elevated)] dark:bg-black/80 backdrop-blur-md rounded-full border border-white/20 text-[var(--color-title)] dark:text-white cursor-pointer hover:bg-primary hover:text-white transition-all shadow-xl z-20 animate-in fade-in zoom-in-90 active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              setIsMapActive(false);
            }}
            title={t('components:map.lockScroll')}
          >
            <Icon name="lock" size="sm" />
          </button>
        )}

        {/* Overlay gradient to blend bottom edge */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>
    </Card>
  );
};

export default MapBlock;
