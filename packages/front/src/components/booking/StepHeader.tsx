import React from 'react';

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
        <span className="text-lg md:text-xl font-mono font-bold leading-none text-sub/50">{number}.</span>
        <span className="text-lg md:text-xl font-mono font-bold leading-none uppercase tracking-[0.2em] text-sub/50">{stepName}</span>
      </div>
      <h2 className="text-2xl md:text-4xl font-display font-black tracking-tight text-title mb-3 uppercase">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm md:text-base text-desc max-w-xl mx-auto font-medium">
          {subtitle.split(/(Morning|Evening)/g).map((part, i) => {
            if (part === 'Morning') return <span key={i} className={`font-bold ${color1}`}>{part}</span>;
            if (part === 'Evening') return <span key={i} className={`font-bold ${color2}`}>{part}</span>;
            return <span key={i}>{part}</span>;
          })}
        </p>
      )}
    </div>
  );
};
