/**
 * Config dell'onboarding AuthPage - asset e meta tecnici FUORI da i18n.
 * (pulizia i18n 2026-08-17, audit /i18n): i path immagine e i token icon/color
 * non sono testo da tradurre. Le cards in auth.json tengono SOLO title/description;
 * il componente ricompone testo+meta per indice (scelta B dell'audit).
 * ⚠️ Se cambi il NUMERO di card in una sezione, allinea i18n e questo array insieme.
 */
export type OnboardingCardColor = 'primary' | 'action' | 'secondary' | 'subtle';

export interface OnboardingCardMeta {
  icon: string;
  color: OnboardingCardColor;
}

export const AUTH_HERO_IMAGES = {
  chef: '/avatarCherry/600-Avatar-AuthPage.webp',
  story: '/avatarCherry/600-Avatar-Storyteller.webp',
} as const;

export const ONBOARDING_CARDS_META: Record<'chef' | 'story', OnboardingCardMeta[]> = {
  chef: [
    { icon: 'UtensilsCrossed', color: 'action' },
    { icon: 'ShieldCheck', color: 'secondary' },
  ],
  story: [
    { icon: 'Sparkles', color: 'secondary' },
    { icon: 'Trophy', color: 'action' },
  ],
};
