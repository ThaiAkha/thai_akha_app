import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import Button from '../button/Button';
import Tooltip from '../Tooltip';

interface InspectorHeaderBaseProps {
  /** Small overline label above the title. Ignorata quando si passa `heading`. */
  subtitle?: string;
  onClose?: () => void;
  /** Extra controls rendered before the close button. */
  actions?: React.ReactNode;
  /** Optional leading element (e.g. an avatar) rendered before the text. */
  leading?: React.ReactNode;
  /** 'lg' increases header height + text size for a more readable, prominent header. */
  size?: 'sm' | 'lg';
  /** Aggiunge shadow-sm: e' l'header di DataExplorerInspector (8 pagine admin). */
  shadow?: boolean;
  /** Tooltip del close. Passarlo attiva il close "ricco" (Button 36px + Tooltip). */
  closeTooltip?: string;
  /**
   * In edit mode il close si tinge di rosso e il tooltip dice explorer.closeCancel,
   * come in ManagerReservation. Passarlo (anche false) attiva il close ricco.
   */
  isEditing?: boolean;
  /** Icona al posto della X (es. MoreHorizontal nel pannello agency). Passarla attiva il close ricco. */
  closeIcon?: React.ReactNode;
}

/**
 * Testo dell'header, in alternativa: `title` (stringa o nodo) dentro la colonna di testo
 * standard, oppure `heading`, che SOSTITUISCE l'intera colonna `flex flex-col min-w-0`.
 * Serve all'adapter di DataExplorerInspector (B1), che rende `<SectionHeader variant="title">`
 * e non un `<span>` font-bold text-title: con `heading` il DOM delle 8 pagine resta uguale.
 */
export type InspectorHeaderProps = InspectorHeaderBaseProps & (
  | { title: React.ReactNode; heading?: never }
  | { heading: React.ReactNode; title?: never }
);

interface InspectorCloseRichProps {
  onClose: () => void;
  tooltip?: string;
  isEditing: boolean;
  icon?: React.ReactNode;
}

// Copia 1:1 del close di DataExplorerInspector, cosi' l'adapter (B1) rende lo stesso DOM.
// Il hook i18n vive in questo sotto-componente e non nell'header: la variante nuda
// (6 adopter) non deve cambiare di una riga.
const InspectorCloseRich: React.FC<InspectorCloseRichProps> = ({ onClose, tooltip, isEditing, icon }) => {
  const { t } = useTranslation('dashboard');
  return (
    <Tooltip content={tooltip ?? (isEditing ? t('explorer.closeCancel') : t('explorer.close'))} position="left">
      <Button
        type="button"
        onClick={onClose}
        variant="outline"
        size="icon"
        className={cn(
          'h-11 w-11 p-0 shadow-sm transition-all active:scale-95 flex items-center justify-center',   // 44px, standard planner
          isEditing
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        )}
      >
        {icon ?? <X className={cn('w-5 h-5', isEditing ? 'text-red-600' : 'text-sub')} />}
      </Button>
    </Tooltip>
  );
};

/**
 * Header a altezza fissa (h-16 / h-20). Il close e' nudo (16px, aria-label "Close")
 * finche' nessuno passa closeTooltip / isEditing / closeIcon: solo allora diventa il
 * Button 36px + Tooltip. Opt-in, perche' ogni default che cambia si vede in 6 pannelli.
 */
export const InspectorHeader: React.FC<InspectorHeaderProps> = ({
  title, heading, subtitle, onClose, actions, leading, size = 'sm', shadow, closeTooltip, isEditing, closeIcon,
}) => {
  const lg = size === 'lg';
  const richClose = closeTooltip !== undefined || isEditing !== undefined || closeIcon !== undefined;
  return (
    <div className={cn('px-4 shrink-0 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50', lg ? 'h-20' : 'h-16', shadow && 'shadow-sm')}>
      <div className="flex items-center gap-3 min-w-0">
        {leading}
        {heading !== undefined ? heading : (
          <div className="flex flex-col min-w-0">
            {subtitle && <span className={cn('font-bold uppercase tracking-widest text-body', lg ? 'text-sm' : 'text-xs')}>{subtitle}</span>}
            <span className={cn('font-bold text-title truncate', lg ? 'text-xl' : 'text-sm')}>{title}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        {onClose && (richClose ? (
          <InspectorCloseRich onClose={onClose} tooltip={closeTooltip} isEditing={isEditing ?? false} icon={closeIcon} />
        ) : (
          <button
            onClick={onClose}
            aria-label="Close"
            // size-11 = 44px di area tattile (standard planner); l'icona resta 16px, il
            // margine negativo tiene l'icona dov'era visivamente. Prima l'area era 16px.
            className="size-11 -mr-3 inline-flex items-center justify-center text-sub hover:text-body rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <X className="w-4 h-4" />
          </button>
        ))}
      </div>
    </div>
  );
};
