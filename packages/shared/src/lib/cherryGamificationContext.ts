// ─────────────────────────────────────────────────────────────────────────────
// cherryGamificationContext — conoscenza quiz/premi per Cherry (Akha Wisdom Path)
//
// Cherry deve saper spiegare come funziona la gamification e come si vincono i
// premi. Le MECCANICHE sono stabili (statiche qui); i PREMI sono live da
// quiz_rewards (label + required_points) così restano accurati se cambiano.
//
// Iniettato SOLO su intento quiz (token-efficiente): se l'utente non parla di
// quiz/premi/punti, ritorna null.
// ─────────────────────────────────────────────────────────────────────────────

import { gameService } from '../services/game.service';

const QUIZ_INTENT = [
  'quiz', 'gamif', 'prize', 'prizes', 'reward', 'rewards', 'points', 'win ',
  'certificate', 'wisdom path', 'game', 'play', 'premio', 'premi', 'punti',
  'vincere', 'gioco', 'ricompens',
];

/** True se il messaggio riguarda il quiz / i premi / la gamification. */
export function hasQuizIntent(text: string): boolean {
  const hay = (text ?? '').toLowerCase();
  return QUIZ_INTENT.some((kw) => hay.includes(kw));
}

/**
 * Blocco GAMIFICATION DATA, o null se nessun intento quiz. Meccaniche statiche +
 * premi live (ordinati per punti) dal DB.
 */
export async function getGamificationContextForCherry(text: string): Promise<string | null> {
  if (!hasQuizIntent(text)) return null;

  let rewardsLine = '';
  try {
    const rewards = await gameService.getQuizRewards();
    const sorted = [...rewards]
      .filter(r => r && (r as { is_active?: boolean }).is_active !== false)
      .sort((a, b) => (a.required_points ?? 0) - (b.required_points ?? 0))
      .map(r => `${r.required_points} pts → ${r.label}`);
    if (sorted.length) rewardsLine = `Prizes by points: ${sorted.join('; ')}.`;
  } catch {
    rewardsLine = '';
  }

  return [
    `### GAMIFICATION DATA — Akha Wisdom Path quiz (authoritative — answer ONLY from this):`,
    `How it works: a free in-app cultural quiz. The guest answers questions across themed levels (culture, market, spice, festival, foraging and more); every correct answer earns points, and points unlock real rewards. It plays directly in the app, anytime, and there is no cost.`,
    rewardsLine || 'Points unlock a ladder of rewards, from a welcome treat up to a chef\'s apron and a discount on a class.',
    `STYLE: encouraging and fun — explain simply how to earn points and reach the next prize, and warmly invite the guest to play. ~120 words, plain text, no labels kha.`,
  ].join('\n');
}
