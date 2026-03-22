import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import Icon from '../Icon';
import Typography from '../Typography';

// --- TYPES ---
export interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: string;
  badge?: string | number;
  activeColor?: 'primary' | 'secondary' | 'action';
}

interface ActionButton {
  icon: string;
  onClick: () => void;
  label?: string;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'pills' | 'mineral';
  actionButton?: ActionButton;
  className?: string;
  containerClass?: string;
}

const Tabs: React.FC<TabsProps> = ({
  items,
  value,
  onChange,
  variant = 'mineral',
  actionButton,
  className,
  containerClass
}) => {

  // Indicator Ref (Used only for 'mineral')
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (variant === 'pills') return;

    const activeIndex = items.findIndex(item => item.value === value);
    const activeTab = tabsRef.current[activeIndex];

    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
        opacity: 1
      });
    }
  }, [value, items, variant]);

  // --- VARIANT CONFIG ---
  const isMineral = variant === 'mineral';
  const isPills = variant === 'pills';

  // Container Styles (Refined for Light/Dark)
  const containerClasses = isMineral
    ? "bg-surface dark:bg-black/40 backdrop-blur-xl border border-border dark:border-white/10 p-2 shadow-2xl rounded-full relative"
    : isPills
      ? "bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 p-2 rounded-full"
      : "";

  return (
    <div className={cn("flex items-center gap-3 md:gap-4 justify-center", containerClass)}>

      {/* External Action Button (Optional) */}
      {actionButton && (
        <button
          onClick={actionButton.onClick}
          title={actionButton.label}
          type="button"
          className={cn(
            // Base Layout
            "rounded-full aspect-square h-[44px] md:h-[52px] flex items-center justify-center transition-all duration-300 group",
            // Colors (Light/Dark Ready)
            "bg-surface dark:bg-black/40 backdrop-blur-xl border border-border dark:border-white/10",
            // Interactive
            "text-gray-700 dark:text-gray-300 hover:text-action hover:border-action/50 hover:bg-action/5 active:scale-95 shadow-sm"
          )}
        >
          <Icon name={actionButton.icon} size="sm" className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Tabs List Container */}
      <div className={cn(
        "flex items-center overflow-x-auto no-scrollbar max-w-full",
        containerClasses,
        className
      )}>

        {/* Sliding Indicator (Mineral Only) */}
        {isMineral && (
          <div
            className="absolute top-2 bottom-2 bg-action rounded-full transition-all duration-300 ease-out shadow-brand-glow z-0"
            style={{ ...indicatorStyle, opacity: 0 }}
            ref={(el) => { if (el) setTimeout(() => el.style.opacity = '1', 50) }}
          />
        )}

        {/* Tabs Wrapper with Gap */}
        <div className={cn(
          "flex items-center",
          isPills ? "gap-2 md:gap-4" : "gap-1"
        )}>
          {items.map((item, index) => {
            const isActive = value === item.value;

            return (
              <button
                key={item.value}
                type="button"
                ref={(el) => { tabsRef.current[index] = el; }}
                onClick={() => onChange(item.value)}
                className={cn(
                  "relative z-10 flex items-center gap-2.5 md:gap-3 px-3 md:px-5 py-1.5 md:py-2.5 rounded-full transition-all duration-300 whitespace-nowrap select-none",

                  // --- VARIANT 1: PILLS (User Dashboard) ---
                  isPills && isActive
                    ? cn(
                      // Active: Primary text, primary border, light bg
                      "bg-primary/5 text-gray-800 dark:text-gray-200   border border-primary/30",
                      "hover:bg-primary/10"
                    )
                    : isPills
                      ? cn(
                        // Inactive: Gray-800/200 text, action border, very light bg
                        "bg-white/30 dark:bg-white/5 text-gray-800 dark:text-gray-200 border border-action/30",
                        "hover:bg-action/5 hover:border-action/60 hover:text-primary"
                      )

                      // --- VARIANT 2: MINERAL (Admin) ---
                      : isActive
                        ? "text-white border-transparent" // Indicator is the background
                        : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100 border-transparent hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                {/* Icon - visible only on desktop */}
                {item.icon && (
                  <Icon
                    name={item.icon}
                    size="xs"
                    className={cn(
                      "hidden md:block transition-colors duration-300",
                      isPills && isActive ? "text-primary" :
                        isPills ? "text-action" :
                          isActive ? "text-white" : "text-current opacity-70"
                    )}
                  />
                )}

                <Typography variant="badge" color="inherit" className="leading-none pt-0.5">
                  {item.label}
                </Typography>

                {/* Badge */}
                {item.badge && (
                  <span className={cn(
                    "ml-1 px-1.5 py-0.5 rounded-full text-[8px] md:text-[10px] leading-none min-w-[1.2em] text-center font-bold",
                    isActive
                      ? "bg-primary text-white"
                      : "bg-red-500 text-white shadow-sm"
                  )}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Tabs;