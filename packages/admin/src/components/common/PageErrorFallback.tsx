import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { AppErrorFallbackProps } from '@thaiakha/shared/components/AppErrorBoundary';
import Button from '../ui/button/Button';

/**
 * Fallback visivo del boundary di pagina (admin, idioma gray/dark lecito).
 * Vive dentro AppLayout: sidebar, header e Cherry restano montati.
 * Chunk lazy fallito: il boundary ha gia' provato un reload automatico; qui il
 * pulsante ricarica di nuovo. Errore di render: "Retry" rimonta la pagina.
 */
const PageErrorFallback: React.FC<AppErrorFallbackProps> = ({ error, isChunkError, reset, reload }) => {
  const { t } = useTranslation(['common', 'navigation']);

  return (
    <div role="alert" className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/10">
        <div className="flex items-start gap-4">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-red-500" />
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-red-700 dark:text-red-400">
              {t('common:feedback.error')}
            </h2>
            {import.meta.env.DEV && (
              <pre className="max-w-full overflow-auto rounded bg-red-100 p-3 text-xs font-mono text-red-800 dark:bg-red-950 dark:text-red-200">
                {error.message}
              </pre>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={isChunkError ? reload : reset}
              startIcon={<RefreshCw className="h-4 w-4" />}
            >
              {t('navigation:sidebar.retry')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageErrorFallback;
