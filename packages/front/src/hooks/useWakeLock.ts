import { useState, useEffect, useCallback, useRef } from 'react';

interface UseWakeLockResult {
  isActive: boolean;
  isSupported: boolean;
  toggle: () => void;
}

export function useWakeLock(): UseWakeLockResult {
  const [isActive, setIsActive] = useState(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  const release = useCallback(async () => {
    if (!sentinelRef.current) return;
    await sentinelRef.current.release();
    sentinelRef.current = null;
    setIsActive(false);
  }, []);

  const request = useCallback(async () => {
    if (!isSupported) return;
    try {
      sentinelRef.current = await (navigator as Navigator & { wakeLock: { request(type: 'screen'): Promise<WakeLockSentinel> } }).wakeLock.request('screen');
      setIsActive(true);
      sentinelRef.current!.addEventListener('release', () => {
        sentinelRef.current = null;
        setIsActive(false);
      });
    } catch {
      // Permission denied or API unavailable — fail silently
    }
  }, [isSupported]);

  const toggle = useCallback(() => {
    isActive ? release() : request();
  }, [isActive, request, release]);

  // Re-acquire after tab becomes visible again (OS can revoke the lock on hide)
  useEffect(() => {
    if (!isActive) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !sentinelRef.current) {
        request();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, request]);

  // Always release on unmount
  useEffect(() => {
    return () => { sentinelRef.current?.release(); };
  }, []);

  return { isActive, isSupported, toggle };
}
