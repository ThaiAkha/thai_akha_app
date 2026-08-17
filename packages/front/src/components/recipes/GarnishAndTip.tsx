import React from 'react';
import { t } from '../../i18n';
import Alert from '../ui/card/Alert';

interface GarnishAndTipProps {
  garnish?: string;
  cooksTip?: string;
}

const GarnishAndTip: React.FC<GarnishAndTipProps> = ({ garnish, cooksTip }) => {
  if (!garnish && !cooksTip) return null;

  return (
    <div className="flex flex-col [gap:var(--space-fluid-m)]">
      {garnish && (
        <Alert
          variant="warning"
          icon="eco"
          title={t('recipeSingle:garnish') || 'Garnish'}
          message={garnish}
          className="h-full"
        />
      )}
      {cooksTip && (
        <Alert
          variant="warning"
          icon="tips_and_updates"
          title={t('recipeSingle:cooksTip') || "Cook's Tip"}
          message={cooksTip}
          className="h-full"
        />
      )}
    </div>
  );
};

export default GarnishAndTip;
