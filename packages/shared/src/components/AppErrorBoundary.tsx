import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * AppErrorBoundary - boundary di errore condiviso front/admin (audit 2026-08, P5).
 *
 * Headless: cattura l'errore e decide COSA e' successo, ma il fallback visivo lo
 * passa ogni app (`renderFallback`) col proprio design system (front = Typography +
 * token semantici; admin = idioma gray e dark). Cosi' un throw in render o un chunk
 * lazy che non scarica non lascia piu' lo schermo bianco.
 *
 * Chunk lazy fallito (deploy nuovo mentre l'utente ha la vecchia index.html, rete
 * assente): il rimedio giusto e' ricaricare la pagina UNA volta. Guardia in
 * sessionStorage: se il reload non basta, si mostra il fallback e basta (niente loop).
 */

export interface AppErrorFallbackProps {
  error: Error;
  /** true = errore di download di un chunk lazy (import() fallito) */
  isChunkError: boolean;
  /** Ritenta il render dei children (azzera il boundary) */
  reset: () => void;
  /** Ricarica la pagina */
  reload: () => void;
}

interface Props {
  children: ReactNode;
  renderFallback: (props: AppErrorFallbackProps) => ReactNode;
  /** Hook per logging centralizzato (Sentry, tabella client_errors...) */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Cambia il valore per resettare automaticamente il boundary (es. la route) */
  resetKey?: unknown;
}

interface State {
  error: Error | null;
}

const CHUNK_RELOAD_FLAG = 'tak_chunk_reloaded';

const CHUNK_ERROR_RE =
  /(Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk [\w-]+ failed|Loading CSS chunk|error loading dynamically imported module)/i;

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return CHUNK_ERROR_RE.test(message);
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AppErrorBoundary]', error, info.componentStack);
    this.props.onError?.(error, info);

    // Chunk vecchio dopo un deploy: ricarica una volta sola, poi lascia il fallback.
    if (isChunkLoadError(error) && typeof sessionStorage !== 'undefined') {
      try {
        if (!sessionStorage.getItem(CHUNK_RELOAD_FLAG)) {
          sessionStorage.setItem(CHUNK_RELOAD_FLAG, '1');
          window.location.reload();
        }
      } catch {
        /* sessionStorage non disponibile: resta il fallback manuale */
      }
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
    // Render riuscito dopo un reload da chunk: azzera la guardia per il prossimo deploy.
    if (!this.state.error && typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.removeItem(CHUNK_RELOAD_FLAG);
      } catch {
        /* noop */
      }
    }
  }

  private reset = () => this.setState({ error: null });
  private reload = () => window.location.reload();

  render() {
    if (this.state.error) {
      return this.props.renderFallback({
        error: this.state.error,
        isChunkError: isChunkLoadError(this.state.error),
        reset: this.reset,
        reload: this.reload,
      });
    }
    return this.props.children;
  }
}

export default AppErrorBoundary;
