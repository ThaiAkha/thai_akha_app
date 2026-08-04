import { ChatNodeId, ChatOption } from '../data/cherry/chatFlowData';
import { getChatFlow, type ChatLocale } from '../data/cherry/chatFlowI18n';

/**
 * Converts an array of ChatNodeId (stored in recipes.cherry_button_ids)
 * into ChatOption objects ready to render as follow-up buttons.
 * Silently skips any ID that does not exist in CHAT_FLOW.
 * Locale-aware: usa l'accessor i18n (default 'en').
 */
export function getRecipeCherryFollowups(nodeIds: ChatNodeId[], locale: ChatLocale = 'en'): ChatOption[] {
  const flow = getChatFlow(locale);
  return nodeIds.flatMap((id) => {
    const node = flow[id];
    if (!node) return [];
    const label =
      node.shortLabel ||
      node.message.split('\n')[0].replace(/\*\*/g, '').trim();
    return [{ label, nextId: id } satisfies ChatOption];
  });
}
