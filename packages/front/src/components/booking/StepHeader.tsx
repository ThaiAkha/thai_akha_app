import React from 'react';
import { Typography } from '../ui';

interface StepHeaderProps {
  number: string;
  stepName: string;
  title: string;
  subtitle?: string;
  color1?: string;
  color2?: string;
}

export const StepHeader: React.FC<StepHeaderProps> = ({
  number,
  stepName,
  title,
  subtitle,
  color1 = "text-orange-500",
  color2 = "text-action"
}) => {
  return (
    <div className="flex flex-col items-center justify-center mb-10 px-4 text-center animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-baseline justify-center gap-2 md:gap-3 mb-3">
        <Typography variant="monoLabel" className="text-lg md:text-xl leading-none">{number}.</Typography>
        <Typography variant="monoLabel" className="text-lg md:text-xl leading-none">{stepName}</Typography>
      </div>
      <Typography variant="h3" className="mb-3 font-black">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="paragraphS" className="max-w-xl mx-auto">
          {subtitle.split(/(Morning|Evening)/g).map((part, i) => {
            if (part === 'Morning') return <span key={i} className={`font-bold ${color1}`}>{part}</span>;
            if (part === 'Evening') return <span key={i} className={`font-bold ${color2}`}>{part}</span>;
            return <span key={i}>{part}</span>;
          })}
        </Typography>
      )}
    </div>
  );
};
