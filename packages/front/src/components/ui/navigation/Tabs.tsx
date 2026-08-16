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
  variant?: 'default' | 'pills' | 'mineral' | 'dock';
  compact?: boolean;
  actionButton?: ActionButton;
  className?: string;
  containerClass?: string;
}

const Tabs: React.FC<TabsProps> = ({
  items,
  value,
  onChange,
  variant = 'mineral',
  compact = false,
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
  const isCompact = compact;

  // Container Styles (Refined for Light/Dark)
  const containerClasses = isMineral
    ? "bg-surface dark:bg-black/40 backdrop-blur-xl border border-border dark:border-white/10 p-2 shadow-2xl rounded-full relative"
    : isCompact
      ? cn(
          "bg-surface/80 dark:bg-black/60 backdrop-blur-2xl border border-white/10 p-1 rounded-full shadow-brand-glow",
          containerClass
        )
      : cn(
          "bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 p-2 rounded-full",
          containerClass
        );

  return (
    <div className={cn("flex items-center [gap:var(--space-fluid-s)] justify-center", containerClass)}>

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
            "text-sub hover:text-action hover:border-action/50 hover:bg-action/5 active:scale-95 shadow-sm"
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
            className={cn(
              "absolute bg-action rounded-full transition-all duration-300 ease-out z-0",
              isCompact ? "top-1.5 bottom-1.5 bg-primary shadow-brand-glow" : "top-2 bottom-2 bg-action shadow-brand-glow"
            )}
            style={{ ...indicatorStyle, opacity: 0 }}
            ref={(el) => { if (el) setTimeout(() => el.style.opacity = '1', 50) }}
          />
        )}

        {/* Tabs Wrapper with Gap */}
        <div className={cn(
          "flex items-center",
          isCompact 
            ? "[gap:var(--space-fluid-2xs)]" 
            : (isPills || isCompact) ? "[gap:var(--space-fluid-xs)]" : "gap-1"
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
                  "relative z-10 flex items-center rounded-full transition-all duration-300 whitespace-nowrap select-none",
                  isCompact 
                    ? "font-accent text-[11px] tracking-[2px] uppercase [gap:0] [padding-inline:var(--space-fluid-2xs)] [padding-block:var(--space-fluid-2xs)]" 
                    : "text-base font-medium [gap:var(--space-fluid-xs)] [padding-inline:var(--space-fluid-m)] [padding-block:var(--space-fluid-2xs)]",

                  // --- VARIANT 1: PILLS ---
                  isPills && isActive
                    ? "bg-primary/10 text-primary dark:text-white border border-primary/30 font-bold"
                    : isPills
                      ? "bg-white/30 dark:bg-white/5 text-sub border border-action/20 hover:bg-action/5 hover:text-primary dark:hover:text-white"
                      : "",

                  // --- VARIANT 2: MINERAL (Sliding) ---
                  isMineral && isActive
                    ? "text-white border-transparent"
                    : isMineral
                      ? "text-sub hover:text-title border-transparent hover:bg-black/5 dark:hover:bg-white/5"
                      : ""
                )}
              >
                {/* Icon - visible only on desktop and not in compact mode */}
                {item.icon && !isCompact && (
                  <Icon
                    name={item.icon}
                    size="xs"
                    className="hidden md:block"
                  />
                )}

                <Typography 
                  variant={isCompact ? "accent" : "badge"} 
                  color="inherit" 
                  className={cn("leading-none pt-0.5", isCompact && "text-[11px] tracking-[3px]")}
                >
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