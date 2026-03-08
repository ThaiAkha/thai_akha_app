import React, { useMemo, useCallback } from 'react';
import { Sun, Moon, Calendar } from 'lucide-react';
import { DataExplorerSidebar } from '../../../components/data-explorer';
import { SessionType } from '../../common/ClassPicker';
import { SessionSummary } from '../../../hooks/useManagerLogistic';

interface LogisticSidebarProps {
    upcomingSessions: SessionSummary[];
    selectedDate: string;
    selectedSessionId: SessionType;
    onSelectSession: (date: string, sessionId: SessionType) => void;
}

const SESSION_CONFIG = {
    morning: {
        label: 'Morning Class',
        icon: Sun,
        iconColor: 'text-yellow-500' // Colore per morning
    },
    evening: {
        label: 'Evening Class',
        icon: Moon,
        iconColor: 'text-indigo-400' // Colore per evening
    }
} as const;

const LogisticSidebar: React.FC<LogisticSidebarProps> = ({
    upcomingSessions,
    selectedDate,
    selectedSessionId,
    onSelectSession,
}) => {
    const sidebarItems = useMemo(() => {
        const sessionsForDate = upcomingSessions
            .filter(s => s.date === selectedDate)
            .sort((a, b) => {
                // Ordina: morning prima, evening dopo
                if (a.session_id.includes('morning') && !b.session_id.includes('morning')) return -1;
                if (!a.session_id.includes('morning') && b.session_id.includes('morning')) return 1;
                return 0;
            });

        return sessionsForDate.map((s) => {
            const isMorning = s.session_id.includes('morning');
            const config = isMorning ? SESSION_CONFIG.morning : SESSION_CONFIG.evening;

            return {
                id: `${s.date}::${s.session_id}`,
                label: config.label,
                icon: <config.icon className={`w-5 h-5 ${config.iconColor}`} />,
                // badgeValue e badgeType sono stati rimossi
            };
        });
    }, [upcomingSessions, selectedDate]);

    const selectedId = `${selectedDate}::${selectedSessionId}`;

    const handleSelect = useCallback((id: string) => {
        const [date, sessionId] = id.split('::');
        if (date && sessionId) {
            onSelectSession(date, sessionId as SessionType);
        }
    }, [onSelectSession]);

    return (
        <DataExplorerSidebar
            title="Cooking Class"
            titleIcon={<Calendar className="w-5 h-5" />}
            items={sidebarItems}
            selectedId={selectedId}
            onSelect={handleSelect}
        />
    );
};

export default LogisticSidebar;