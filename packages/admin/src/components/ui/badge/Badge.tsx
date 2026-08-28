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

  // Il testo di stato passa dalle classi semantiche (text-success / text-error /
  // text-warning), che si adattano al tema; i fondi restano le tinte sys, che sono
  // superfici e hanno regola propria. Contrasto misurato sul caso peggiore fra pagina
  // (#F6FCFC light, #121311 dark) e card (#FFFFFF, #222827), palette Tailwind 4.2.1:
  // light success 4.38 pagina / 4.54 card, warning 4.52 / 4.65, error 5.45 / 5.62;
  // dark success 6.41 e warning 6.55 sulla card. L'error in dark scendeva a 4.49 con
  // la tinta al 15 per cento: red-400 e' la piu' scura delle quattro tinte dark e non
  // se lo puo' permettere, quindi la sua riga resta al 10 anche in dark (4.73). E' una
  // asimmetria voluta. Resta aperta una riga: success in light sulla pagina e' 4.38,
  // sotto AA per un soffio, e la tinta e' gia' al minimo - va risolto sul token, non qui.
  // Neutro: gray-700 su gray-100 = 4.34, gray-800 = 5.93. Solid: bianco su -700 = 4.9-8.1.
  const variants = {
    light: {
      primary:
        "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300",
      success:
        "bg-sys-success/10 text-success dark:bg-sys-success/15",
      error:
        "bg-sys-error/10 text-error",
      warning:
        "bg-sys-warning/10 text-warning dark:bg-sys-warning/15",
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
