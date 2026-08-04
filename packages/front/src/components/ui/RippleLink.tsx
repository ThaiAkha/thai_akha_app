import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';

export interface RippleLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  onNavigate?: (path: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export const RippleLink = React.forwardRef<HTMLAnchorElement, RippleLinkProps>(
  ({ href, onNavigate, children, className, ...rest }, ref) => {
    const [flashes, setFlashes] = React.useState<{ id: number; x: number; y: number }[]>([]);
    const flashIdRef = React.useRef(0);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const id = ++flashIdRef.current;
      
      setFlashes((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
      setTimeout(() => setFlashes((prev) => prev.filter((f) => f.id !== id)), 350);

      // Se è un click normale (sinistro senza modificatori) e abbiamo un onNavigate, lo usiamo
      if (!(e.ctrlKey || e.metaKey || e.button !== 0)) {
        if (onNavigate) {
          e.preventDefault();
          onNavigate(href);
        }
      }
    };

    return (
      <a 
        ref={ref}
        href={href} 
        onClick={handleClick} 
        className={cn('relative overflow-hidden block cursor-pointer', className)} 
        {...rest}
      >
        {children}
        {flashes.map((f) => (
          <span
            key={f.id}
            className="btn-flash-ripple pointer-events-none"
            style={{
              top: f.y,
              left: f.x,
              zIndex: 50,
              animationDuration: '300ms',
              '--btn-flash-ripple-color': 'rgba(255, 255, 255, 0.8)',
              '--btn-flash-ripple-soft': 'rgba(255, 255, 255, 0.4)',
            } as React.CSSProperties}
            aria-hidden="true"
          />
        ))}
      </a>
    );
  }
);

RippleLink.displayName = 'RippleLink';
