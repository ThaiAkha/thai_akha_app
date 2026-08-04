import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { KitchenUsage, UsageNote } from '@thaiakha/shared/types';
import { Typography, Icon } from '../ui/index';

interface IngredientUsageNoteProps {
  usageNote?: UsageNote | null;
  kitchenUsage?: KitchenUsage | null;
  className?: string;
}

// Icon per usage type — style differentiation only; ALL text comes from usage_note (never hardcoded).
const USAGE_ICON: Record<string, string> = {
  market_tour: 'ShoppingBasket', // market tour context
  support: 'CookingPot',         // in our kitchen
};

/**
 * IngredientUsageNote — context callout for market_tour / support ingredients.
 * Heading + body are rendered verbatim from usage_note; kitchen_usage only picks the icon.
 * Renders nothing for 'recipe' ingredients or when usage_note is empty.
 */
const IngredientUsageNote: React.FC<IngredientUsageNoteProps> = ({ usageNote, kitchenUsage, className }) => {
  const heading = usageNote?.heading?.trim();
  const body = usageNote?.body?.trim();
  if (!heading && !body) return null;

  const icon = (kitchenUsage && USAGE_ICON[kitchenUsage]) || 'Leaf';

  return (
    <aside
      className={cn(
        'rounded-[1.25rem] bg-surface-2 border border-border border-l-4 border-l-pantry-4',
        '[padding:var(--space-fluid-l)] flex flex-col sm:flex-row items-start [gap:var(--space-fluid-s)]',
        className,
      )}
    >
      <span className="inline-flex items-center justify-center size-11 shrink-0 rounded-full bg-pantry-4/10 text-pantry-4">
        <Icon name={icon} size="md" />
      </span>
      <div className="flex flex-col [gap:var(--space-fluid-2xs)] min-w-0">
        {heading && (
          <Typography variant="h5" as="h2" color="title" className="leading-snug">
            {heading}
          </Typography>
        )}
        {body && (
          <Typography variant="paragraphM" className="text-desc leading-relaxed">
            {body}
          </Typography>
        )}
      </div>
    </aside>
  );
};

export default IngredientUsageNote;
