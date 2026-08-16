import React from 'react';
import { Edit, Save } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import Button from '../button/Button';
import Tooltip from '../Tooltip';

/**
 * Canonical inspector action buttons (Edit / Save) shared by every feature
 * inspector's *Actions panel. Before this, 6 inspectors (Hotels, Storage,
 * Inventory, Database, Reservation, Logistic) each re-wrote the SAME
 * `Button + Tooltip` markup with the magic className
 * "h-9 px-4 text-xs font-black uppercase tracking-widest", and Media
 * diverged with a fully hand-rolled look. These primitives lock that pattern
 * to one place so every inspector reads identically. Behavior-invariant.
 *
 * DS baseline: docs/ADMIN_DS_BASELINE_2027.md (button pill label idiom).
 */

// Shared pill-label sizing used by both edit (outline) and save (primary) states.
const ACTION_BTN = 'h-9 px-4 text-xs font-black uppercase tracking-widest transition-all';

interface InspectorEditButtonProps {
    onClick: () => void;
    /** Tooltip copy (i18n string). */
    tooltip: string;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
}

/** The "Edit" affordance shown when an inspected record is in read mode. */
export const InspectorEditButton: React.FC<InspectorEditButtonProps> = ({ onClick, tooltip, children, disabled, className }) => (
    <Tooltip content={tooltip} position="left">
        <Button
            type="button"
            onClick={onClick}
            disabled={disabled}
            variant="outline"
            size="md"
            className={cn(ACTION_BTN, 'active:scale-95', className)}
            startIcon={<Edit className="w-4 h-4" />}
        >
            {children}
        </Button>
    </Tooltip>
);

interface InspectorSaveButtonProps {
    onClick: () => void;
    /** Tooltip copy (i18n string). */
    tooltip: string;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
}

/** The "Save" affordance shown when an inspected record is in edit mode. */
export const InspectorSaveButton: React.FC<InspectorSaveButtonProps> = ({ onClick, tooltip, children, disabled, className }) => (
    <Tooltip content={tooltip} position="left">
        <Button
            type="button"
            onClick={onClick}
            disabled={disabled}
            variant="primary"
            size="md"
            className={cn(ACTION_BTN, className)}
            startIcon={<Save className="w-4 h-4" />}
        >
            {children}
        </Button>
    </Tooltip>
);
