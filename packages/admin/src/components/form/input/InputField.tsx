import React, { type FC } from "react";
import { cn } from "@thaiakha/shared/lib/utils";
import SectionHeader from "../../ui/SectionHeader";

interface InputProps {
  type?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number | string;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  label?: string;
  autoComplete?: string;
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  label,
  autoComplete,
}) => {
  const inputClasses = cn(
    "w-full rounded-xl border appearance-none px-4 shadow-theme-xs transition-all duration-300 outline-none ring-green-500/20",
    "h-12 text-base font-bold bg-white/50 dark:bg-gray-800/20 backdrop-blur-sm border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 hover:border-green-500/30 focus:border-green-500 focus:ring-4",
    disabled && "bg-gray-50/50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/50 cursor-default opacity-100",
    // 🔥 Bordo success per modalità edit (non disabled)
    !disabled && success && "border-green-500 focus:border-green-500 focus:ring-green-500/20 dark:border-green-500",
    !disabled && error && "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500",
    className
  );

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <SectionHeader
          title={label}
          variant="formfield"
        />
      )}

      <div className="relative h-12">
        <input
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          autoComplete={autoComplete}
          className={inputClasses}
        />
      </div>

      {hint && (
        <p className={cn(
          "mt-1.5 text-[10px] font-black uppercase tracking-widest",
          error ? "text-red-500" : success ? "text-emerald-500" : "text-gray-500"
        )}>
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;