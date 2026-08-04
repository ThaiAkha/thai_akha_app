import React, { useState, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@thaiakha/shared/lib/utils';

interface TooltipProps {
    children: ReactNode;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

// Render via portal su document.body con position:fixed → il tooltip NON viene tagliato
// da antenati con overflow-hidden/auto (es. liste scrollabili, card). Posizione calcolata
// dal bounding rect del trigger al momento dell'hover.
const Tooltip: React.FC<TooltipProps> = ({
    children,
    content,
    position = 'top',
    className
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    const show = () => {
        const el = triggerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const GAP = 8;
        let top = r.top + r.height / 2;
        let left = r.left + r.width / 2;
        if (position === 'top') top = r.top - GAP;
        else if (position === 'bottom') top = r.bottom + GAP;
        else if (position === 'left') left = r.left - GAP;
        else if (position === 'right') left = r.right + GAP;
        setCoords({ top, left });
        setIsVisible(true);
    };

    const transform = {
        top: 'translate(-50%, -100%)',
        bottom: 'translate(-50%, 0)',
        left: 'translate(-100%, -50%)',
        right: 'translate(0, -50%)',
    }[position];

    return (
        <div
            ref={triggerRef}
            className={cn('relative inline-block', className)}
            onMouseEnter={show}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && createPortal(
                <div
                    style={{ position: 'fixed', top: coords.top, left: coords.left, transform }}
                    className="z-[99999] whitespace-nowrap px-2 py-1 text-xs font-bold text-white bg-gray-900 rounded shadow-xl pointer-events-none animate-in fade-in zoom-in duration-200"
                >
                    {content}
                </div>,
                document.body
            )}
        </div>
    );
};

export default Tooltip;
