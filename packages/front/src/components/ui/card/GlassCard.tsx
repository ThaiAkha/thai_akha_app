import React, { useRef, useEffect } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import './GlassCard.css';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'action' | 'secondary' | 'subtle' | 'cherry';
  innerClassName?: string;
  /**
   * Fluid padding for the internal content.
   * Maps to System Fluid Space tokens (none, xs, s, m, l, xl).
   */
  padding?: 'none' | 'xs' | 's' | 'm' | 'l' | 'xl';
  /**
   * Custom radius token or value.
   * Defaults to var(--radius-card-full) (48px).
   */
  radius?: string;
  /**
   * Enables touch feedback (scale-down on press).
   * Automatically set to true when an onClick handler is provided.
   * Design System Standard: all interactive GlassCards MUST use this.
   */
  interactive?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

const PADDING_MAP = {
  none: '0px',
  xs: 'var(--space-fluid-xs)',
  s: 'var(--space-fluid-s)',
  m: 'var(--space-fluid-m)',
  l: 'var(--space-fluid-l)',
  xl: 'var(--space-fluid-xl)',
};

const GlassCard = React.forwardRef<HTMLElement, GlassCardProps>(
  ({ children, variant = 'primary', className, innerClassName, padding, radius, interactive, onClick, href, target, rel, ...props }, forwardedRef) => {
    const cardRef = useRef<HTMLElement>(null);
    // Treat as interactive if explicit prop OR onClick handler is provided OR if it acts as a link
    const isInteractive = interactive ?? (!!onClick || !!href);

    useEffect(() => {
      const card = cardRef.current;
      if (!card) return;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      };

      const handleMouseLeave = () => {
        card.style.setProperty('--mouse-x', '50%');
        card.style.setProperty('--mouse-y', '50%');
      };

      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);

      // ── Touch feedback (iOS Safari: active: pseudo-class unreliable) ──────
      // Adds a native scale-down on finger press, matching hover:scale-[1.01]
      // active:scale-[0.99] pattern standardized in Design System.
      const handleTouchStart = () => {
        if (!isInteractive) return;
        card.style.transform = 'scale(0.99)';
        card.style.transition = 'transform 150ms ease';
      };
      const handleTouchEnd = () => {
        if (!isInteractive) return;
        card.style.transform = '';
        // Keep transition for smooth snap-back
        setTimeout(() => { card.style.transition = ''; }, 300);
      };

      card.addEventListener('touchstart', handleTouchStart, { passive: true });
      card.addEventListener('touchend', handleTouchEnd, { passive: true });
      card.addEventListener('touchcancel', handleTouchEnd, { passive: true });

      return () => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
        card.removeEventListener('touchstart', handleTouchStart);
        card.removeEventListener('touchend', handleTouchEnd);
        card.removeEventListener('touchcancel', handleTouchEnd);
      };
    }, [isInteractive]);

    const Component = (href ? 'a' : 'div') as React.ElementType;

    return (
      <Component
        ref={(node: HTMLElement) => {
          (cardRef as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        href={href}
        target={target}
        rel={rel}
        className={cn(
          'glass-card',
          `glass-card--${variant}`,
          // Standard touch/click feedback — active: for desktop, native events for iOS
          isInteractive && 'active:scale-[0.99] transition-transform duration-150',
          href && 'outline-none focus:ring-2 focus:ring-action-400 block',
          className
        )}
        onClick={(e: React.MouseEvent<HTMLElement>) => {
          if (href && onClick) {
            // Se c'è sia un link che un onClick (e.g. onNavigate custom), usiamo preventDefault per non caricare la pagina se è un link interno locale
            if (!(e.ctrlKey || e.metaKey || e.button !== 0)) {
              e.preventDefault();
              onClick(e as React.MouseEvent<HTMLDivElement>);
            }
          } else if (onClick) {
            onClick(e as React.MouseEvent<HTMLDivElement>);
          }
        }}
        style={{
          ...props.style,
          ...(radius ? { '--radius': radius } : {}),
          ...(padding ? { '--glass-padding': PADDING_MAP[padding] } : {}),
          // Rule: raggio_figlio = raggio_parent - padding
          '--glass-inner-radius': 'calc(var(--radius) - var(--glass-padding))',
        } as React.CSSProperties}
        {...props}
      >
        <div className="glass-card__border" />
        <div className="glass-card__glow" />
        <div className={cn('glass-card__content', innerClassName)}>{children}</div>
      </Component>
    );
  }
);

GlassCard.displayName = 'GlassCard';
export default GlassCard;
