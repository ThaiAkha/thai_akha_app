import React, { useState } from 'react';
import { Share2, Copy, CheckCircle } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Button, Typography } from '../ui';

interface InviteGroupBlockProps {
  bookingInternalId: string | null;
}

const InviteGroupBlock: React.FC<InviteGroupBlockProps> = ({ bookingInternalId }) => {
  const [copied, setCopied] = useState(false);

  const inviteLink = bookingInternalId
    ? `${window.location.origin}/join-group?ref=${bookingInternalId}`
    : '';

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isDisabled = !bookingInternalId;

  return (
    <div className={cn(
      'rounded-3xl p-6 md:p-8',
      'bg-gray-50/80 dark:bg-white/5',
      'backdrop-blur-xl',
      'border border-gray-200/60 dark:border-white/10',
      isDisabled && 'opacity-50 pointer-events-none'
    )}>
      <div className="flex items-center gap-3 mb-2">
        <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <Typography variant="h5" color="title">Traveling with Friends?</Typography>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 leading-relaxed">
        Share this link with your group so they can create an account and select their own dietary preferences and dishes.
      </p>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Link display */}
        <div className="flex-1 bg-black/5 dark:bg-black/30 border border-border rounded-2xl px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-500 truncate min-w-0">
          {inviteLink || 'No active booking — link unavailable'}
        </div>

        {/* Copy button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={isDisabled}
          className={cn(
            'shrink-0 transition-colors duration-300',
            copied && 'text-action border-action'
          )}
        >
          {copied
            ? <CheckCircle className="w-4 h-4" />
            : <Copy className="w-4 h-4" />
          }
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </Button>
      </div>
    </div>
  );
};

export default InviteGroupBlock;
