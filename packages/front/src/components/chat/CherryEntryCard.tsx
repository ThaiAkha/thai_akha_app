import React from 'react';
import { getRecipeCherryFollowups } from '@thaiakha/shared/lib/recipeCherryUtils';
import type { ChatNodeId } from '@thaiakha/shared/data/chatFlowData';
import { cn } from '@thaiakha/shared/lib/utils';
import { AskCherryButton } from './AskCherryButton';

interface CherryEntryCardProps {
  /** Domanda-seme (entry point) dalla riga DB. */
  cherry_prompt?: string | null;
  /** Risposta preset zero-latency dalla riga DB. */
  cherry_response?: string | null;
  /** ID nodi-ingresso (CHAT_FLOW) da mostrare come follow-up dopo la risposta. */
  cherry_button_ids?: string[] | null;
  /** Tonalità: 'cherry' (brand, default) | 'ocean'. */
  tone?: 'cherry' | 'ocean';
  className?: string;
}

/**
 * CherryEntryCard — card "Ask Cherry" generica (header + card + pill), riusabile
 * su qualsiasi pagina (History, News, Classi, Site). Stesso pattern di
 * RecipeCherryChat ma indipendente dal contesto ricetta. Da posizionare subito
 * prima del blocco FAQ/essentials. Non renderizza nulla se la riga non ha prompt.
 */
export const CherryEntryCard: React.FC<CherryEntryCardProps> = ({
  cherry_prompt,
  cherry_response,
  cherry_button_ids,
  tone = 'cherry',
  className,
}) => {
  if (!cherry_prompt && !cherry_response) return null;

  const followups = getRecipeCherryFollowups((cherry_button_ids ?? []) as ChatNodeId[]);

  return (
    <div className={cn('flex flex-col [gap:var(--space-fluid-s)]', className)}>
      <AskCherryButton
        variant="prominent"
        tone={tone}
        topic={cherry_prompt ?? undefined}
        data={{
          cherry_prompt: cherry_prompt ?? undefined,
          cherry_response: cherry_response ?? undefined,
        }}
        followupOptions={followups.length > 0 ? followups : undefined}
      />
    </div>
  );
};

export default CherryEntryCard;
