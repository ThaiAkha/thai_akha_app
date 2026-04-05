import React from 'react';
import { Tabs } from '../ui/index';

interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: string;
  badge?: string | number;
  activeColor?: 'primary' | 'secondary' | 'action';
}

interface StickyTabNavProps {
  items: TabItem[];
  value: string;
  onChange: (val: string) => void;
  /** Tailwind top offset class, e.g. "top-[12px]". Defaults to top-[12px] md:top-[28px] */
  topOffset?: string;
  /** Extra bottom margin class. Defaults to mb-3 md:mb-12 */
  bottomMargin?: string;
}

/**
 * StickyTabNav — sticky glass pill wrapper for page-level navigation.
 * Uses pointer-events trick so only the pill itself intercepts clicks.
 */
const StickyTabNav: React.FC<StickyTabNavProps> = ({
  items,
  value,
  onChange,
  topOffset = 'top-[12px] md:top-[28px]',
  bottomMargin = '',
}) => {
  return (
    <div
      className={`sticky ${topOffset} z-[100] w-full flex justify-center [margin-bottom:var(--space-fluid-l)] px-2 pointer-events-none${bottomMargin ? ` ${bottomMargin}` : ''}`}
    >
      <div className="pointer-events-auto bg-white/45 dark:bg-gray-950/90 backdrop-blur-xl [padding:var(--space-fluid-2xs)] rounded-full shadow-lg max-w-full overflow-x-auto no-scrollbar md:scale-110 md:origin-top transition-transform">
        <Tabs
          items={items}
          value={value}
          onChange={onChange}
          variant="pills"
        />
      </div>
    </div>
  );
};

export default StickyTabNav;
