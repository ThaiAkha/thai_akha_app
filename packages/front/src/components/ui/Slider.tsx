// @/components/ui/Slider.tsx
import React from 'react';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
  /** Dynamic thumb color (hex). Defaults to action green. */
  thumbColor?: string;
  /** Show the default min/mid/max labels. Defaults to false. */
  showMinMax?: boolean;
}

const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = false,
  className = '',
  thumbColor,
  showMinMax = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const pct = ((value - min) / (max - min)) * 100;
  const trackStyle = thumbColor
    ? { background: `linear-gradient(to right, ${thumbColor} ${pct}%, rgba(255,255,255,0.1) ${pct}%)` }
    : undefined;

  return (
    <div className={`space-y-4 ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className="font-accent text-sm font-bold tracking-wider">{label}</span>
          )}
          {showValue && (
            <span className="font-accent text-lg font-bold text-action">{value}</span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          style={thumbColor ? {
            ...trackStyle,
            ['--thumb-color' as string]: thumbColor,
          } : undefined}
          className={[
            'w-full h-2 rounded-full appearance-none cursor-pointer transition-all duration-200',
            thumbColor
              ? '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:[transform:scale(1.1)] [&::-webkit-slider-thumb]:[background-color:var(--thumb-color)]'
              : 'bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-action [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110',
          ].join(' ')}
        />
      </div>
      {showMinMax && (
        <div className="flex justify-between text-xs text-slate-400">
          <span>{min}</span>
          <span className="font-accent">{((max - min) / 2 + min).toFixed(0)}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

export default Slider;
