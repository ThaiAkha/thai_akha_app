import React from 'react';
import { Typography } from '../ui/index';
import { sanitizeHtml } from '../../lib/sanitizeHtml';

interface DirectionStep {
  step: number;
  text: string;
}

interface DirectionsStepsProps {
  steps: DirectionStep[];
}

const DirectionsSteps: React.FC<DirectionsStepsProps> = ({ steps }) => {
  return (
    <ol className="flex flex-col [gap:var(--space-fluid-xs)]">
      {steps.map(step => (
        <li
          key={step.step}
          className="flex [gap:var(--space-fluid-m)] [padding:var(--space-fluid-xs)] rounded-2xl"
        >
          {/* ── Step badge ────────────────────────────────────── */}
          <span className="flex-shrink-0 w-10 h-10 rounded-2xl font-black text-sm flex items-center justify-center bg-action/15 text-action">
            {step.step}
          </span>

          {/* ── Step text ─────────────────────────────────────── */}
          <div className="flex-1 pt-2">
            <Typography
              as="div"
              variant="paragraphM"
              color="default"
              className="leading-relaxed [&_strong]:font-bold [&_em]:italic [&_a]:text-action [&_a]:font-bold hover:[&_a]:underline"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(step.text) }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
};

export default DirectionsSteps;
