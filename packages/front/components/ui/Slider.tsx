// @/components/ui/Slider.tsx - VERSIONE CORRETTA
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
}

const Slider: React.FC<SliderProps> = ({
  value,          // Riceve il valore come prop
  onChange,       // Riceve la funzione onChange come prop
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = false,
  className = '',
}) => {
  // Gestisce il cambiamento del valore
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    onChange(newValue); // Chiama la funzione passata dal padre
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className="font-accent text-sm font-bold tracking-wider">
              {label}
            </span>
          )}
          {showValue && (
            <span className="font-accent text-lg font-bold text-action">
              {value}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}           // Usa il valore passato come prop
          onChange={handleChange} // Usa la funzione locale
          className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-action [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 transition-all duration-200"
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>{min}</span>
        <span className="font-accent">{((max - min) / 2 + min).toFixed(0)}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default Slider;