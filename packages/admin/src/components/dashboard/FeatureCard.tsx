/**
 * 🎴 FEATURE CARD COMPONENT
 *
 * Editorial-style card with image top + content bottom
 * Inspired by Stitch "Editorial Storyboard V3" design
 *
 * @example
 * <FeatureCard
 *   title="Hotel List"
 *   description="Add hotels, map GPS coordinates..."
 *   imageUrl="/images/hotel.jpg"
 *   icon="Hotel"
 *   path="/admin-hotels"
 * />
 */

import React from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import type { IconName } from '../../lib/iconRegistry';
import Icon from '../ui/Icon';
import { Heading, Paragraph } from '../typography';
import { cn } from '@thaiakha/shared/lib/utils';

export interface FeatureCardProps {
  /** Card title */
  title: string;

  /** Card description */
  description: string;

  /** Image URL for card header */
  imageUrl?: string;

  /** Icon name from registry */
  icon?: string | IconName;

  /** Link path */
  path: string;

  /** Link label (default: "Go to {title}") */
  linkLabel?: string;

  /** Custom className */
  className?: string;

  /** Image aspect ratio class (default: aspect-[5/2]) */
  aspectRatio?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  imageUrl,
  icon,
  path,
  linkLabel,
  className,
  aspectRatio = 'aspect-[5/2.7]'
}) => {
  const IconComponent = icon ? icon : null; // keep prop name but render with Icon component below

  return (
    <Link
      to={path}
      className={cn(
        "group relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden",
        "shadow-sm border border-gray-100 dark:border-gray-800",
        "flex flex-col transition-all duration-300",
        "hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1",
        "no-underline block",
        className
      )}
    >
      {/* Decorative Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Image Header */}
      {imageUrl && (
        <div className={cn("overflow-hidden relative", aspectRatio)}>
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/20 dark:to-gray-900/40 pointer-events-none" />

          {/* Icon Badge - Top Right */}
          {IconComponent && (
            <div className="absolute top-6 left-6">
              <Icon name={icon as IconName} variant="compact" />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Title */}
        <Heading level="h3" className="mb-3">
          {title}
        </Heading>

        {/* Description */}
        <Paragraph size="base" color="secondary" className="mb-6 flex-1">
          {description}
        </Paragraph>

        {/* Link Label */}
        {linkLabel && (
          <div className="inline-flex items-center text-brand-500 font-bold text-md uppercase tracking-wider transition-colors group-hover:text-brand-600 w-fit">
            {linkLabel}
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </div>
        )}
      </div>
    </Link>
  );
};

export default FeatureCard;
