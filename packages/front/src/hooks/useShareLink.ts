import { useState, useCallback, useEffect, useRef } from 'react';

interface UseShareLinkResult {
  handleShare: (title: string, text: string) => void;
  copied: boolean;
}

export function useShareLink(): UseShareLinkResult {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleShare = useCallback((title: string, text: string) => {
    if (navigator.share) {
      navigator.share({ title, text, url: window.location.href }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return { handleShare, copied };
}
