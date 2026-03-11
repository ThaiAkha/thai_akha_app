// @/components/ui/Tooltip.tsx
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface TooltipProps {
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  children: React.ReactNode;
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  // Fix: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> to resolve type errors in non-Node environments
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: '-translate-y-full -top-2 left-1/2 -translate-x-1/2',
    right: 'translate-x-full top-1/2 -translate-y-1/2 right-0',
    bottom: 'translate-y-full bottom-0 left-1/2 -translate-x-1/2',
    left: '-translate-x-full top-1/2 -translate-y-1/2 left-0',
  };

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none"
            style={{ left: coords.x, top: coords.y }}
          >
            <div
              className={`absolute ${positionClasses[position]} bg-slate-900 text-white text-sm font-accent px-4 py-3 rounded-2xl whitespace-nowrap backdrop-blur-sm border border-white/10 shadow-2xl`}
            >
              {content}
              <div
                className={`absolute w-3 h-3 bg-slate-900 transform rotate-45 border border-white/10 ${
                  position === 'top'
                    ? 'bottom-[-6px] left-1/2 -translate-x-1/2 border-t-transparent border-l-transparent'
                    : position === 'right'
                    ? 'left-[-6px] top-1/2 -translate-y-1/2 border-r-transparent border-b-transparent'
                    : position === 'bottom'
                    ? 'top-[-6px] left-1/2 -translate-x-1/2 border-b-transparent border-r-transparent'
                    : 'right-[-6px] top-1/2 -translate-y-1/2 border-l-transparent border-t-transparent'
                }`}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Tooltip;