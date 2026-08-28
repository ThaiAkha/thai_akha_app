import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

interface MediaSectionProps {
    /** Icona gia' dimensionata e colorata dal chiamante (w-4 h-4 + colore di sezione). */
    icon: React.ReactNode;
    title: string;
    /** Colore del titolo (text-primary-600, text-blue-600...): ogni sezione ha il suo. */
    titleClassName: string;
    /** Classi extra del <section> (es. `opacity-80 group` delle proprieta' di sistema). */
    className?: string;
    children: React.ReactNode;
}

/**
 * Sezione dell'inspector media (task #93, B4): la riga di intestazione icona + h3 era
 * ripetuta sei volte alla lettera in MediaInspector. Stesso DOM e stesse classi di prima;
 * il colore resta a carico del chiamante, perche' ogni sezione ha la sua tinta.
 */
const MediaSection: React.FC<MediaSectionProps> = ({ icon, title, titleClassName, className, children }) => (
    <section className={cn('space-y-6', className)}>
        <div className="flex items-center gap-2 mb-2 p-1 border-b border-gray-100 dark:border-gray-800">
            {icon}
            <h3 className={cn('text-xs font-black uppercase tracking-[0.2em]', titleClassName)}>{title}</h3>
        </div>
        {children}
    </section>
);

export default MediaSection;
