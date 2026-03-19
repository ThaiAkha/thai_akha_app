import { ReactNode, useState, useRef, useCallback } from "react";
import { cn } from "@thaiakha/shared/lib/utils";

interface ButtonProps {
  children: ReactNode;
  size?: "sm" | "md" | "icon";
  variant?: "primary" | "outline" | "olive";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  isLoading?: boolean;
}

interface FlashPoint { id: number; x: number; y: number; }

const NO_FLASH_VARIANTS = new Set(['outline']);

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "olive",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  isLoading = false,
}) => {
  const sizeClasses = {
    sm: "px-4 py-2.5 text-xs",
    md: "px-5 py-3 text-sm",
    icon: "p-0",
  };

  const variantClasses = {
    primary:
      "bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-300",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-700 hover:bg-gray-50 dark:bg-gray-800/20 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-200",
    olive:
      "bg-[var(--color-button-primary)] hover:bg-[var(--color-button-primary-hover)] active:bg-[var(--color-button-primary-active)] text-white shadow-theme-xs disabled:opacity-50",
  };

  const [flashes, setFlashes] = useState<FlashPoint[]>([]);
  const flashIdRef = useRef(0);
  const isFlashEnabled = !NO_FLASH_VARIANTS.has(variant) && !disabled && !isLoading;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (isFlashEnabled) {
      const rect = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--flash-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
      e.currentTarget.style.setProperty('--flash-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
    }
  }, [isFlashEnabled]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (isFlashEnabled) {
      const rect = e.currentTarget.getBoundingClientRect();
      const id = ++flashIdRef.current;
      setFlashes(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
      setTimeout(() => setFlashes(prev => prev.filter(f => f.id !== id)), 600);
    }
    onClick?.(e);
  }, [isFlashEnabled, onClick]);

  return (
    <button
      className={cn(
        "relative overflow-hidden isolate inline-flex items-center justify-center gap-2 rounded-xl font-medium",
        sizeClasses[size],
        variantClasses[variant],
        (disabled || isLoading) && "cursor-not-allowed opacity-50 !scale-100 !translate-y-0",
        className
      )}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      disabled={disabled || isLoading}
      type={type}
    >
      {isFlashEnabled && <span className="btn-flash-glow" aria-hidden="true" />}
      {flashes.map(f => (
        <span
          key={f.id}
          className="btn-flash-ripple"
          style={{ top: f.y, left: f.x } as React.CSSProperties}
          aria-hidden="true"
        />
      ))}

      <span className="relative z-10 inline-flex items-center gap-2">
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && startIcon && <span className="flex items-center shrink-0">{startIcon}</span>}
        {children}
        {!isLoading && endIcon && <span className="flex items-center shrink-0">{endIcon}</span>}
      </span>
    </button>
  );
};

export default Button;
