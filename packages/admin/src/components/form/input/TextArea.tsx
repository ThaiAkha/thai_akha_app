import React from "react";
import { cn } from "../../../lib/utils";
import SectionHeader from "../../ui/SectionHeader";

interface TextareaProps {
  placeholder?: string;
  rows?: number;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  label?: string;
}

const TextArea: React.FC<TextareaProps> = ({
  placeholder = "Enter your message",
  rows = 3,
  value = "",
  onChange,
  className = "",
  disabled = false,
  success = false,
  error = false,
  hint = "",
  label,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const textareaClasses = cn(
    "w-full rounded-xl border appearance-none px-4 py-3 shadow-theme-xs transition-all duration-300 outline-none ring-green-500/20",
    "text-base font-bold bg-white/50 dark:bg-gray-800/20 backdrop-blur-sm border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 hover:border-green-500/30 focus:border-green-500 focus:ring-4",
    disabled && "bg-gray-50/50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700/50 cursor-default opacity-100",
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

      <textarea
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={textareaClasses}
      />

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

export default TextArea;