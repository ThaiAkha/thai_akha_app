import React, { useMemo } from 'react';
import { Users, Sun, Moon } from 'lucide-react';
import BadgePaxNumber from '../../ui/badge/BadgePaxNumber';
import { DataExplorerSidebar } from '../../../components/data-explorer';
import { Guest } from '../../../hooks/useManagerPos';

interface PosSidebarProps {
    filteredGuests: Guest[];
    activeGuestId: string | null;
    onSelectGuest: (id: string) => void;
}

const PosSidebar: React.FC<PosSidebarProps> = ({
    filteredGuests,
    activeGuestId,
    onSelectGuest,
}) => {
    const getSessionIcon = (sessionId?: string) => {
        if (!sessionId) return <Users className="w-5 h-5" />;
        if (sessionId.includes('morning')) {
            return <Sun className="w-5 h-5 text-yellow-500" />;
        } else if (sessionId.includes('evening')) {
            return <Moon className="w-5 h-5 text-indigo-400" />;
        }
        return <Users className="w-5 h-5" />;
    };

    const sidebarItems = useMemo(() => {
        // Ordina gli ospiti: prima morning, poi evening, poi chi non ha sessione
        const sorted = [...filteredGuests].sort((a, b) => {
            const getSessionPriority = (sessionId?: string): number => {
                if (!sessionId) return 2; // Nessuna sessione per ultimo
                if (sessionId.includes('morning')) return 0; // Morning primo
                if (sessionId.includes('evening')) return 1; // Evening secondo
                return 2; // Altro per ultimo
            };

            const priorityA = getSessionPriority(a.session_id);
            const priorityB = getSessionPriority(b.session_id);

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            // A parità di sessione, ordina per nome
            return a.full_name.localeCompare(b.full_name);
        });

        return sorted.map(g => ({
            id: g.internal_id,
            label: g.full_name,
            icon: getSessionIcon(g.session_id),
            badge: <BadgePaxNumber paxCount={g.pax_count} size="md" />
        }));
    }, [filteredGuests]);

    return (
        <DataExplorerSidebar
            title="Guests"
            titleIcon={<Users className="w-5 h-5" />}
            items={sidebarItems}
            selectedId={activeGuestId || ''}
            onSelect={onSelectGuest}
        />
    );
};

export default PosSidebar;