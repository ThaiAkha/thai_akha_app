import React, { useRef, useEffect } from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import './GlassCard.css';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'primary' | 'action' | 'secondary' | 'subtle';
  className?: string;
  innerClassName?: string;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, variant = 'primary', className, innerClassName }, forwardedRef) => {
    const cardRef = useRef<HTMLDivElement>(null);

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

      return () => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, []);

    return (
      <div ref={cardRef} className={cn('glass-card', `glass-card--${variant}`, className)}>
        <div className="glass-card__border" />
        <div className="glass-card__glow" />
        <div className={cn('glass-card__content', innerClassName)}>{children}</div>
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
export default GlassCard;
