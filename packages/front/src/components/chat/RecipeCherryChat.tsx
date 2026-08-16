import React from 'react';
import { getRecipeCherryFollowups } from '@thaiakha/shared/lib/recipeCherryUtils';
import type { ChatNodeId } from '@thaiakha/shared/data/chatFlowData';
import { cherryPrompts } from '@thaiakha/shared/lib/cherry-prompts';
import { cn } from '@thaiakha/shared/lib/utils';
import { AskCherryButton } from './AskCherryButton';

interface RecipeCherry_ChatProps {
  cherry_prompt?: string | null;
  cherry_response?: string | null;
  cherry_button_ids?: string[] | null;
  recipeName: string;
  diet?: string;
  allergies?: string[];
  className?: string;
}

const RecipeCherryChat: React.FC<RecipeCherry_ChatProps> = ({
  cherry_prompt,
  cherry_response,
  cherry_button_ids,
  recipeName,
  diet,
  allergies = [],
  className,
}) => {
  const followups = getRecipeCherryFollowups(
    (cherry_button_ids ?? []) as ChatNodeId[]
  );

  const topic =
    cherry_prompt ||
    cherryPrompts.recipes.dish(
      recipeName,
      diet || 'regular',
      allergies.join(', ')
    );

  return (
    <div className={cn('flex flex-col [gap:var(--space-fluid-s)]', className)}>
      <AskCherryButton
        variant="prominent"
        context="recipe-dish"
        topic={topic}
        data={{
          name: recipeName,
          cherry_prompt: cherry_prompt ?? undefined,
          cherry_response: cherry_response ?? undefined,
        }}
        followupOptions={followups.length > 0 ? followups : undefined}
      />
    </div>
  );
};

export default RecipeCherryChat;
