import React from 'react';
import { useTranslation } from 'react-i18next';
import { InspectorShell, InspectorHeader, InspectorBody } from '../ui/inspector';

import { SectionTitle } from '../typography';

interface DataExplorerInspectorProps {
    title?: string;
    headerActions?: React.ReactNode;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    isEditing?: boolean;
}

/**
 * Adapter sui primitivi `ui/inspector` (task #93, B1): stesse props e stesso DOM di prima
 * per le 8 pagine host (Storage, Inventory, Media, Hotels, Database, News, Logistic,
 * Reservation). Il titolo passa dallo slot `heading` (SectionTitle as="h6",
 * non lo span dell'header nudo); `isEditing` attiva il close ricco (Button 36px +
 * Tooltip, rosso in edit); `closeTooltip` resta undefined cosi' il testo del tooltip
 * viene dall'header (explorer.close / explorer.closeCancel, ns dashboard) come oggi.
 */
const DataExplorerInspector: React.FC<DataExplorerInspectorProps> = ({
    title,
    headerActions,
    onClose,
    children,
    className = '',
    isEditing = false,
}) => {
    const { t } = useTranslation('dashboard');

    return (
        <InspectorShell className={className}>
            <InspectorHeader
                heading={<SectionTitle as="h6" className="mb-0 text-body">{title ?? t('explorer.details')}</SectionTitle>}
                actions={headerActions}
                onClose={onClose}
                isEditing={isEditing}
                shadow
            />
            <InspectorBody fill>
                {children}
            </InspectorBody>
        </InspectorShell>
    );
};

export default DataExplorerInspector;
