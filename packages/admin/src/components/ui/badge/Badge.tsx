type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  variant?: BadgeVariant; // Light or solid variant
  size?: BadgeSize; // Badge size
  color?: BadgeColor; // Badge color
  startIcon?: React.ReactNode; // Icon at the start
  endIcon?: React.ReactNode; // Icon at the end
  children: React.ReactNode; // Badge content
  className?: string; // Additional classes
}

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-md font-medium";

  // Define size styles
  const sizeStyles = {
    sm: "text-theme-xs", // Smaller padding and font size
    md: "text-sm", // Default padding and font size
  };

  // Contrasto (palette Tailwind 4.2.1 oklch, misurato sulle superfici REALI: pagina
  // light #E6ECEC e card bianca; pagina dark #121311 e card #222827). Il token di stato
  // puro sulla propria tinta al 10% non e' leggibile (2.0-3.3). Con testo -700 passava
  // solo sulla card (success 4.54) e falliva sulla pagina (3.85): quindi -800 in light
  // (5.5-6.2 ovunque) e -300 in dark (5.1-8.2; -400 dava 3.41 sull'info). Neutro:
  // gray-700 su gray-100 = 4.34, gray-800 = 5.93. Solid: bianco su -700 = 4.9-8.1.
  const variants = {
    light: {
      primary:
        "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300",
      success:
        "bg-sys-success/10 text-green-800 dark:bg-sys-success/15 dark:text-green-300",
      error:
        "bg-sys-error/10 text-red-800 dark:bg-sys-error/15 dark:text-red-300",
      warning:
        "bg-sys-warning/10 text-amber-800 dark:bg-sys-warning/15 dark:text-orange-300",
      info: "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300",
      light: "bg-gray-100 text-gray-800 dark:bg-white/5 dark:text-white/80",
      dark: "bg-gray-500 text-white dark:bg-white/5 dark:text-white",
    },
    solid: {
      primary: "bg-primary-500 text-white dark:text-white",
      success: "bg-green-700 text-white dark:text-white",
      error: "bg-red-700 text-white dark:text-white",
      warning: "bg-amber-700 text-white dark:text-white",
      info: "bg-primary-700 text-white dark:text-white",
      light: "bg-gray-600 text-white dark:bg-white/5 dark:text-white/80",
      dark: "bg-gray-700 text-white dark:text-white",
    },
  };

  // Get styles based on size and color variant
  const sizeClass = sizeStyles[size] || sizeStyles.md;
  const colorStyles = variants[variant]?.[color] || variants.light.primary;

  return (
    <span className={`${baseStyles} ${sizeClass} ${colorStyles} ${className}`}>
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </span>
  );
};

export default Badge;
