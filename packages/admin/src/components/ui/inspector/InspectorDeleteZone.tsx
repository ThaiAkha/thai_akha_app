import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import Button from '../button/Button';

export interface InspectorDeleteZoneProps {
  onDelete: () => void;
  /** Etichetta del primo step (default common actions.deleteRecord). */
  label?: string;
  /** Etichetta di conferma (default common actions.confirm). */
  confirmLabel?: string;
  /** Etichetta di annullo (default common actions.cancel). */
  cancelLabel?: string;
  disabled?: boolean;
  /** Contenitore esterno (chrome del footer). `shrink` via tailwind-merge toglie lo shrink-0. */
  className?: string;
  /**
   * Classi del wrapper interno, che SOSTITUISCONO il default `flex flex-col gap-2 max-w-sm mx-auto`
   * (DbInspector). NewsInspector e' `flex flex-col gap-2` senza max-w: lo passa qui.
   */
  contentClassName?: string;
  /** false = CONFIRM senza `animate-in fade-in slide-in-from-bottom-1` (NewsInspector non ce l'ha). */
  animate?: boolean;
}

/**
 * Zona di cancellazione a 2 step (DELETE -> CONFIRM / CANCEL) col chrome del footer.
 * I default riproducono DbInspector alla lettera; NewsInspector differisce in tre punti
 * (niente shrink-0, wrapper senza max-w-sm mx-auto, CONFIRM senza animate-in), coperti da
 * className / contentClassName / animate. Lo stato showDeleteConfirm, prima tenuto dal
 * genitore, qui e' interno: il genitore riceve solo onDelete.
 * Le etichette passano dalle chiavi common gia' esistenti, con defaultValue di riserva.
 */
export const InspectorDeleteZone: React.FC<InspectorDeleteZoneProps> = ({
  onDelete, label, confirmLabel, cancelLabel, disabled, className, contentClassName, animate = true,
}) => {
  const { t } = useTranslation('common');
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = () => {
    setConfirming(false);
    onDelete();
  };

  return (
    <div className={cn('px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 shrink-0', className)}>
      <div className={contentClassName ?? 'flex flex-col gap-2 max-w-sm mx-auto'}>
        {!confirming ? (
          <Button
            type="button"
            variant="olive"
            size="md"
            disabled={disabled}
            className="w-full justify-center h-11 text-xs font-black border-none uppercase tracking-widest shadow-lg shadow-red-500/20"
            startIcon={<Trash2 className="w-5 h-5 text-white" />}
            onClick={() => setConfirming(true)}
          >
            {label ?? t('actions.deleteRecord', { defaultValue: 'DELETE RECORD' })}
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              type="button"
              disabled={disabled}
              className={cn(
                'flex-1 justify-center h-11 text-xs font-black border-none uppercase tracking-widest',
                animate && 'animate-in fade-in slide-in-from-bottom-1',
                'shadow-lg shadow-red-500/20',
              )}
              onClick={handleConfirm}
            >
              {confirmLabel ?? t('actions.confirm', { defaultValue: 'CONFIRM' })}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="flex-1 justify-center h-11 text-xs font-black text-sub uppercase tracking-widest border-gray-200 dark:border-gray-700 bg-white"
              onClick={() => setConfirming(false)}
            >
              {cancelLabel ?? t('actions.cancel', { defaultValue: 'CANCEL' })}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
