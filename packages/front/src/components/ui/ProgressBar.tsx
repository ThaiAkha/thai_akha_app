// @/components/ui/ProgressBar.tsx
import React from 'react';

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'primary' | 'secondary' | 'action' | 'quiz';
  showValue?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'action',
  showValue = false,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    action: 'bg-action',
    quiz: 'bg-quiz',
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <div className="flex justify-between text-sm">
          <span className="font-accent font-bold tracking-wider">Progress</span>
          <span className="font-accent font-bold">{percentage.toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;