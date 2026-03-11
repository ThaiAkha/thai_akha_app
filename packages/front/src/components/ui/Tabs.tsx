import React, { useRef, useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import Icon from './Icon';

// --- TYPES ---
export interface TabItem {
  value: string;
  label: string;
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
    : "gap-3 md:gap-4"; 

  return (
    <div className={cn("flex items-center gap-4 justify-center", containerClass)}>
      
      {/* External Action Button (Optional) */}
      {actionButton && (
        <button 
          onClick={actionButton.onClick}
          title={actionButton.label}
          type="button"
          className={cn(
            // Base Layout
            "rounded-full aspect-square h-[52px] flex items-center justify-center transition-all duration-300 group",
            // Colors (Light/Dark Ready)
            "bg-surface dark:bg-black/40 backdrop-blur-xl border border-border dark:border-white/10",
            // Interactive
            "text-desc hover:text-action hover:border-action/50 hover:bg-action/5 active:scale-95 shadow-sm"
          )}
        >
          <Icon name={actionButton.icon} size="md" className="group-hover:-translate-x-0.5 transition-transform"/>
        </button>
      )}

      {/* Tabs List */}
      <div className={cn(
        "flex items-center overflow-x-auto no-scrollbar max-w-full",
        // Padding aggiustato per ombre Pills
        isPills ? "p-3" : "p-1", 
        containerClasses, 
        className
      )}>        
        
        {/* Sliding Indicator (Mineral Only) */}
        {isMineral && (
          <div 
            className="absolute top-2 bottom-2 bg-action rounded-full transition-all duration-300 ease-out shadow-brand-glow z-0"
            style={{ ...indicatorStyle, opacity: 0 }} 
            ref={(el) => { if(el) setTimeout(() => el.style.opacity = '1', 50) }}
          />
        )}

        {items.map((item, index) => {
          const isActive = value === item.value;

          return (
            <button
              key={item.value}
              type="button"
              ref={(el) => { tabsRef.current[index] = el; }} 
              onClick={() => onChange(item.value)}
              className={cn(
                "relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full text-base font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap select-none border",
                
                // --- VARIANT 1: PILLS (User Dashboard) ---
                isPills && isActive 
                  ? cn(
                      // Active: Gradient text, white/glass bg
                      "bg-white dark:bg-white/5 border-primary/50",
                      "text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary",
                      "shadow-[0_0_10px_-1px_var(--color-action)] scale-105"
                    )
                  : isPills
                    ? cn(
                        // Inactive: Semantic borders (visibili su bianco e nero)
                        "bg-transparent border-border dark:border-white/20",
                        "text-desc dark:text-white/60",
                        "hover:border-primary/50 hover:text-title hover:bg-surface dark:hover:bg-white/5"
                      )
                  
                // --- VARIANT 2: MINERAL (Admin) ---
                  : isActive 
                    ? "text-white border-transparent" // Indicator is the background
                    : "text-desc hover:text-title border-transparent hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              {item.icon && (
                <Icon 
                  name={item.icon} 
                  size="md" 
                  className={cn(
                    "transition-colors duration-300", 
                    isActive && isPills ? "text-primary" : (isActive ? "text-white" : "text-current opacity-70")
                  )}
                />
              )}
              
              <span>{item.label}</span>

              {/* Badge */}
              {item.badge && (
                <span className={cn(
                  "ml-1 px-1.5 py-0.5 rounded-full text-[10px] leading-none min-w-[1.2em] text-center font-bold",
                  isActive 
                    ? "bg-white text-action" 
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
  );
};

export default Tabs;