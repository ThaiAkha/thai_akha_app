/**
 * Manager Reports - componenti UI condivisi dai 4 report (avatar, heading, loading, vuoto archivio).
 * Estratto da ManagerReports.tsx (#16) a comportamento invariato.
 */
import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { SectionTitle } from '../../../components/typography';
import { Clock, Archive } from 'lucide-react';
import type { DriverView } from './shared';

export const Avatar: React.FC<{ src: string | null; name: string; className?: string; textClassName?: string }> = ({ src, name, className = 'size-[72px]', textClassName = 'text-xl' }) => (
    src
        ? <img src={src} alt={name} className={cn(className, 'rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-700')} />
        : <span className={cn(className, textClassName, 'rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black shrink-0')}>{name.charAt(0).toUpperCase()}</span>
);

export const DriverHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="text-xl font-bold text-gray-900 dark:text-white truncate">{children}</span>
);

/** Centro colonna in caricamento (stesso markup dei vecchi rami `=== null`). */
export const LoadingCenter: React.FC<{ label: string }> = ({ label }) => (
    <div className="p-8 text-center"><SectionTitle className="text-gray-400">{label}</SectionTitle></div>
);

/** Vuoto "In progress" / "Archive" (identico per market e agency). */
export const ArchiveEmpty: React.FC<{ view: DriverView; pendingLabel: string; archiveLabel: string }> = ({ view, pendingLabel, archiveLabel }) => (
    <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 py-20">
        {view === 'active' ? <Clock className="w-10 h-10 opacity-40" /> : <Archive className="w-10 h-10 opacity-40" />}
        <SectionTitle className="text-gray-400">{view === 'active' ? pendingLabel : archiveLabel}</SectionTitle>
    </div>
);
