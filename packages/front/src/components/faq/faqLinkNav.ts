import type React from 'react';

/**
 * Click-handler DELEGATO per i link interni dentro le answer HTML delle FAQ
 * (renderizzate via dangerouslySetInnerHTML). Intercetta i click su `<a href="/...">`
 * interni e naviga in SPA via onNavigate (niente full reload → migliora UX e CWV).
 * Link esterni (http…), nuova scheda (Cmd/Ctrl) e click non-sinistro → default browser.
 */
export function handleFaqAnswerClick(
  e: React.MouseEvent<HTMLElement>,
  onNavigate?: (path: string) => void,
): void {
  const anchor = (e.target as HTMLElement).closest('a');
  if (!anchor || !onNavigate) return;
  const href = anchor.getAttribute('href') ?? '';
  const internal = href.startsWith('/') && !href.startsWith('//');
  if (internal && e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
    e.preventDefault();
    onNavigate(href);
  }
}
