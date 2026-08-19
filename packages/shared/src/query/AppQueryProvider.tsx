import { useState, type ReactNode } from 'react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { createAppQueryClient } from './queryClient';

interface AppQueryProviderProps {
  children: ReactNode;
  /** Client esplicito (test / storybook). Di default ne viene creato uno per albero React. */
  client?: QueryClient;
}

/**
 * Provider TanStack Query condiviso da front e admin. Va montato UNA volta,
 * sopra l'App. Il client vive nello stato del provider (non a livello modulo)
 * cosi' HMR e test non condividono cache tra alberi diversi.
 */
export function AppQueryProvider({ children, client }: AppQueryProviderProps) {
  const [queryClient] = useState(() => client ?? createAppQueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
