import React from 'react';
import { Typography } from '../../ui/Typography';

interface ScrollToBottomButtonProps {
  isScrolledUp: boolean;
  scrollToBottom: () => void;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({ isScrolledUp, scrollToBottom }) => (
  <>
  {/* Scroll-to-bottom button */}
  {isScrolledUp && (
    <div className="sticky bottom-2 flex justify-center pointer-events-none">
      <button
        onClick={scrollToBottom}
        className="pointer-events-auto flex items-center [gap:var(--space-fluid-2xs)] bg-surface border border-border text-title shadow-theme-md rounded-full px-4 py-2 hover:bg-surface-2 transition-all animate-in fade-in slide-in-from-bottom-2"
      >
        <span className="material-symbols-outlined text-sm text-cherry-ai-teal">expand_more</span>
        <Typography variant="microLabel" color="sub">Go to bottom</Typography>
      </button>
    </div>
  )}
  </>
);

export default ScrollToBottomButton;
