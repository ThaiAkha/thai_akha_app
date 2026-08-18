import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AppErrorFallbackProps } from '@thaiakha/shared/components/AppErrorBoundary';
import { Typography } from '../ui/Typography';
import Button from '../ui/navigation/Button';

/**
 * Fallback visivo del boundary di pagina (front). Vive nell'area <main>: sidebar e
 * Cherry restano montate, l'utente puo' navigare altrove o ritentare.
 * Chunk lazy fallito: il boundary ha gia' provato un reload automatico; qui il
 * pulsante ricarica di nuovo. Errore di render: "Try again" rimonta la pagina.
 */
const PageErrorFallback: React.FC<AppErrorFallbackProps> = ({ error, isChunkError, reset, reload }) => {
  const { t } = useTranslation(['errors', 'common']);

  return (
    <div
      role="alert"
      className="h-full w-full flex items-center justify-center [padding:var(--space-fluid-l)]"
    >
      <div className="max-w-md w-full text-center flex flex-col items-center [gap:var(--space-fluid-m)]">
        <Typography variant="h3" color="title" className="block">
          {isChunkError ? t('errors:network') : t('errors:server')}
        </Typography>
        <Typography variant="paragraphS" color="sub" className="block">
          {t('errors:generic')}
        </Typography>
        {import.meta.env.DEV && (
          <Typography variant="caption" color="muted" className="block break-all">
            {error.message}
          </Typography>
        )}
        <Button
          variant="brand"
          size="md"
          onClick={isChunkError ? reload : reset}
          icon="refresh"
        >
          {t('common:retry')}
        </Button>
      </div>
    </div>
  );
};

export default PageErrorFallback;
