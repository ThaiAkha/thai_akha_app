import React from 'react';
import { Alert } from '../ui/index';

interface AllergyAlertsProps {
  conflicts: Array<{ allergen: string; warning: string }>;
}

const AllergyAlerts: React.FC<AllergyAlertsProps> = ({ conflicts }) => {
  return (
    <div className="flex flex-col gap-2 [margin-bottom:var(--space-fluid-m)]">
      {conflicts.map(conflict => (
        <Alert
          key={conflict.allergen}
          variant="error"
          title={`Contains ${conflict.allergen}`}
          message={conflict.warning}
        />
      ))}
    </div>
  );
};

export default AllergyAlerts;
