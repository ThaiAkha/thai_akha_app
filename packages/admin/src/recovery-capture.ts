// Runs BEFORE the Supabase client is created (must be the first import in main.tsx).
// Supabase's default `detectSessionInUrl: true` parses and CLEARS the recovery hash
// (#access_token=...&type=recovery) on load and fires PASSWORD_RECOVERY very early —
// often before the /reset-password page can register its listener. Without an early
// capture the page can't tell it's a recovery and loops back to the "enter email" form.
// We stash a flag synchronously so ResetPassword can show the "set new password" form.
try {
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  const isRecovery =
    hash.includes('type=recovery') ||
    new URLSearchParams(search).get('type') === 'recovery';
  if (isRecovery) {
    sessionStorage.setItem('akha_pw_recovery', '1');
  }
} catch {
  /* sessionStorage unavailable — ignore */
}

export {};
