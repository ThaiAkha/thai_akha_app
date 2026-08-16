import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import Typography from './Typography';
import Icon from './Icon';

interface ShareButtonProps {
  /** Fired on click — wire to useShareLink().handleShare or navigator.share */
  onShare: () => void;
  /** Copied feedback state (from useShareLink().copied) — swaps to the "Link Copied!" success style */
  isCopied?: boolean;
  /** Extra classes on the outer pill wrapper */
  className?: string;
}

/**
 * Canonical "Share this page" pill button.
 * Single source for the share affordance used across the site (history/blog headers,
 * class overview, …) so the style stays identical everywhere. Presentational only:
 * the parent owns the share logic (typically via the useShareLink hook).
 */
const ShareButton: React.FC<ShareButtonProps> = ({ onShare, isCopied, className }) => (
  <div className={cn('rounded-full bg-surface shadow-sm w-full md:w-auto', className)}>
    <button
      onClick={onShare}
      className={cn(
        'group relative flex items-center gap-4 bg-btn-s/10 border-2 border-btn-s/20 hover:border-btn-s/40 rounded-full overflow-hidden transition-all py-2 px-2 w-full md:w-auto select-none',
        isCopied && 'bg-action/10 border-action/20',
      )}
    >
      <div
        className={cn(
          'size-12 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300',
          isCopied ? 'border-action text-action bg-action/10' : 'border-btn-s text-btn-s group-hover:bg-btn-s/20',
        )}
      >
        <Icon name={isCopied ? 'done' : 'share'} size="lg" className={isCopied ? '' : '-ml-1'} />
      </div>

      <div className="flex items-center pr-4">
        <Typography
          variant="h6"
          as="p"
          className={cn('font-bold uppercase tracking-widest leading-none', isCopied ? 'text-action' : 'text-btn-s')}
        >
          {isCopied ? 'Link Copied!' : 'Share'}
        </Typography>
      </div>
    </button>
  </div>
);

export default ShareButton;
