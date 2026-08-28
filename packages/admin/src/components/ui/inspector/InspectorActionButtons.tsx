import React from 'react';
import { Edit, Save, X } from 'lucide-react';
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

interface InspectorCancelButtonProps {
    onClick: () => void;
    /** Tooltip copy (i18n string). */
    tooltip: string;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
}

/**
 * "Cancel" (X) accanto a Save in edit mode: stesso chrome pill di Edit/Save.
 * Prima non esisteva e Media/Calendar lo scrivevano a mano con raw <button>.
 */
export const InspectorCancelButton: React.FC<InspectorCancelButtonProps> = ({ onClick, tooltip, children, disabled, className }) => (
    <Tooltip content={tooltip} position="left">
        <Button
            type="button"
            onClick={onClick}
            disabled={disabled}
            variant="outline"
            size="md"
            className={cn(ACTION_BTN, 'active:scale-95', className)}
            startIcon={<X className="w-4 h-4" />}
        >
            {children}
        </Button>
    </Tooltip>
);

interface InspectorPrimaryButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    isLoading?: boolean;
    /** 'submit' quando il bottone chiude un <form> (Logistic: Enter-submit deve restare). */
    type?: 'button' | 'submit';
    startIcon?: React.ReactNode;
    className?: string;
}

/**
 * Azione primaria a tutta larghezza del footer (h-12, text-base): il target del planner
 * per Save/Confirm in Logistic, Reservation, Pos e Storage (che gia' usa h-12 nel corpo).
 * Variante olive del brand, non il pill h-9 dell'header.
 */
export const InspectorPrimaryButton: React.FC<InspectorPrimaryButtonProps> = ({
    onClick, children, disabled, isLoading, type = 'button', startIcon, className,
}) => (
    <Button
        type={type}
        onClick={onClick}
        disabled={disabled}
        isLoading={isLoading}
        variant="olive"
        size="md"
        className={cn('w-full justify-center h-12 text-base font-bold rounded-xl', className)}
        startIcon={startIcon}
    >
        {children}
    </Button>
);
